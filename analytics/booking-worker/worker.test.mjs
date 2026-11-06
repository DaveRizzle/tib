import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { generateKeyPairSync } from 'node:crypto';
import { BookingTracker, default as worker } from './worker.mjs';
import { hash, conversionPayload } from './core.mjs';

const start = Date.parse('2026-11-06T14:00:00Z');
const marker = { 'goo.createdByAvailId': 'test-schedule', 'goo.createdBySet': 'test-set' };
async function fixture() {
  const db = new DatabaseSync(':memory:');
  const sql = { exec(query, ...args) {
    const statement = db.prepare(query);
    const rows = statement.columns().length ? statement.all(...args) : (statement.run(...args), []);
    return { toArray: () => rows };
  } };
  const ctx = { storage: { sql, transactionSync(fn) { db.exec('BEGIN'); try { fn(); db.exec('COMMIT'); } catch (e) { db.exec('ROLLBACK'); throw e; } } } };
  const env = { CALENDAR_ID: 'owner@example.invalid', TRACKING_START: new Date(start).toISOString(), SCHEDULE_FINGERPRINT: await hash(JSON.stringify(Object.values(marker))), SEND_EVENTS: 'true', MARKER_SAMPLE_ID: 'sample', GA4_MEASUREMENT_ID: 'G-TEST', GA4_API_SECRET: 'test-only' };
  const tracker = new BookingTracker(ctx, env);
  return { tracker, env, sql, db };
}
function event(id, overrides = {}) {
  return { id, status: 'confirmed', eventType: 'default', created: new Date(start + 1000).toISOString(), updated: new Date(start + 1000).toISOString(), organizer: { email: 'owner@example.invalid' }, extendedProperties: { shared: marker }, ...overrides };
}

test('recognises only the configured schedule; ignores ordinary meetings and working locations', async () => {
  const { tracker } = await fixture();
  await tracker.record(event('ordinary', { extendedProperties: {} }));
  await tracker.record(event('other', { extendedProperties: { shared: { ...marker, 'goo.createdByAvailId': 'other' } } }));
  await tracker.record(event('work', { eventType: 'workingLocation' }));
  await tracker.record(event('wrong-owner', { organizer: { email: 'another@example.invalid' } }));
  assert.deepEqual(tracker.status().bookings, []);
});
test('existing tests excluded; new booking, edits, duplicate pages, cancellation tombstones and restoration deduplicated', async () => {
  const { tracker, sql } = await fixture();
  await tracker.record(event('old-test', { created: new Date(start - 1000).toISOString() }));
  await tracker.record({ id: 'old-test', status: 'cancelled' });
  await tracker.record(event('new'));
  await tracker.record(event('new', { updated: new Date(start + 2000).toISOString() }));
  await tracker.record(event('new'));
  await tracker.record({ id: 'new', status: 'cancelled', updated: new Date(start + 3000).toISOString() });
  await tracker.record({ id: 'new', status: 'cancelled', updated: new Date(start + 3000).toISOString() });
  await tracker.record(event('new'));
  assert.deepEqual(sql.exec('SELECT event_name,COUNT(*) AS n FROM deliveries GROUP BY event_name ORDER BY event_name').toArray().map(r => [r.event_name,r.n]), [['appointment_booked',1],['appointment_cancelled',1]]);
  assert.equal(sql.exec('SELECT COUNT(*) AS n FROM bookings WHERE excluded=1').toArray()[0].n, 1);
});
test('ambiguous sends are not automatically retried, and successful sends are not resent', async () => {
  const { tracker, sql } = await fixture();
  await tracker.record(event('new', { created: new Date().toISOString() }));
  const fetchBefore = globalThis.fetch;
  let attempts = 0;
  globalThis.fetch = async () => { attempts++; throw new Error('timeout'); };
  try {
    await assert.rejects(tracker.deliver(Date.now()+60000), /ga4_delivery_uncertain/);
    await tracker.deliver(Date.now()+60000);
    assert.equal(attempts, 1);
    assert.equal(sql.exec('SELECT state FROM deliveries').toArray()[0].state, 'uncertain');
    await tracker.record(event('second', { created: new Date().toISOString() }));
    globalThis.fetch = async () => { attempts++; return new Response(null, { status: 204 }); };
    await tracker.deliver(Date.now()+60000); await tracker.deliver(Date.now()+60000);
    assert.equal(attempts, 2);
  } finally { globalThis.fetch = fetchBefore; }
});
test('cursor expiry and pagination preserve exclusions and deduplication; missing markers block sending', async () => {
  const { tracker, env, sql } = await fixture();
  const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  env.GOOGLE_SERVICE_ACCOUNT = JSON.stringify({ client_email: 'test@example.invalid', private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }) });
  tracker.put('sync_token','expired');
  await tracker.record(event('old-test', { created: new Date(start-1000).toISOString() }));
  const fetchBefore = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async input => {
    const url = new URL(input); calls.push(url);
    if (url.hostname === 'oauth2.googleapis.com') return Response.json({ access_token:'test' });
    if (url.pathname.endsWith('/sample')) return Response.json(event('sample'));
    if (url.searchParams.has('syncToken')) return new Response(null, { status:410 });
    if (url.searchParams.has('pageToken')) return Response.json({ items:[event('new')], nextSyncToken:'fresh' });
    return Response.json({ items:[event('old-test', { created:new Date(start-1000).toISOString() }),event('new')],nextPageToken:'page-two' });
  };
  try {
    await tracker.sync(Date.now()+60000);
    assert.equal(tracker.meta('sync_token'),'fresh');
    assert.equal(sql.exec('SELECT COUNT(*) AS n FROM deliveries').toArray()[0].n,1);
    assert.equal(tracker.meta('marker_health'),'verified');
    globalThis.fetch = async input => new URL(input).hostname === 'oauth2.googleapis.com' ? Response.json({access_token:'test'}) : new URL(input).pathname.endsWith('/sample') ? Response.json(event('sample',{extendedProperties:{}})) : Response.json({items:[],nextSyncToken:'newer'});
    await assert.rejects(tracker.sync(Date.now()+60000), /calendar_marker_check_required/);
    assert.equal(tracker.meta('marker_health'),'check_required');
  } finally { globalThis.fetch = fetchBefore; }
});
test('GA4 payload has no attendee details or claimed website session; public endpoints require auth', async () => {
  const payload = conversionPayload({ client_id:'12345.67890',event_key:'hashed-id' },'appointment_booked',Date.now());
  assert.equal(payload.events[0].params.attribution_status,'unlinked');
  assert.equal(payload.events[0].params.session_id,undefined);
  assert.equal(payload.user_id,undefined);
  assert.equal(payload.events[0].params.page_location,undefined);
  const response = await worker.fetch(new Request('https://test/status'),{ADMIN_TOKEN:'secret'});
  assert.equal(response.status,404);
});

test('legacy UUIDs produce stable numeric client IDs accepted by the validation format', () => {
  const row = {client_id:'7397f9cf-27be-449d-9442-46575dc5a447',event_key:'hashed-id'};
  const first = conversionPayload(row,'appointment_booked',Date.now());
  const second = conversionPayload(row,'appointment_cancelled',Date.now());
  assert.match(first.client_id, /^\d+\.\d+$/);
  assert.equal(first.client_id,second.client_id);
});
