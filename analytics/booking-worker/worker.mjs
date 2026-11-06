import { hash, matchesSchedule, transition, conversionPayload } from './core.mjs';

const CALENDAR_FIELDS = 'items(id,status,eventType,created,updated,organizer(email),extendedProperties),nextPageToken,nextSyncToken';
const encoder = new TextEncoder();
function b64(bytes) { return btoa(String.fromCharCode(...new Uint8Array(bytes))).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', ''); }
function json(value, status = 200) { return Response.json(value, { status, headers: { 'Cache-Control': 'no-store' } }); }
async function http(url, options = {}) { return fetch(url, { ...options, signal: AbortSignal.timeout(15000) }); }
async function googleToken(env) {
  const key = JSON.parse(env.GOOGLE_SERVICE_ACCOUNT);
  const now = Math.floor(Date.now() / 1000);
  const head = b64(encoder.encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
  const claims = b64(encoder.encode(JSON.stringify({ iss: key.client_email, scope: 'https://www.googleapis.com/auth/calendar.readonly', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })));
  const pem = key.private_key.replace(/-----[^-]+-----/g, '').replace(/\s/g, '');
  const cryptoKey = await crypto.subtle.importKey('pkcs8', Uint8Array.from(atob(pem), c => c.charCodeAt(0)), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, encoder.encode(`${head}.${claims}`));
  const response = await http('https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${head}.${claims}.${b64(sig)}` }) });
  if (!response.ok) throw new Error(`google_auth_${response.status}`);
  const result = await response.json();
  if (!result.access_token) throw new Error('google_auth_missing_token');
  return result.access_token;
}
function gaUrl(env, debug = false) {
  const url = new URL(`https://www.google-analytics.com/${debug ? 'debug/' : ''}mp/collect`);
  url.searchParams.set('measurement_id', env.GA4_MEASUREMENT_ID);
  url.searchParams.set('api_secret', env.GA4_API_SECRET);
  return url;
}

export class BookingTracker {
  constructor(ctx, env) {
    this.ctx = ctx; this.env = env; this.sql = ctx.storage.sql; this.running = false;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)`);
    this.sql.exec(`CREATE TABLE IF NOT EXISTS bookings (event_key TEXT PRIMARY KEY, client_id TEXT NOT NULL, status TEXT NOT NULL, excluded INTEGER NOT NULL, created TEXT, updated TEXT)`);
    this.sql.exec(`CREATE TABLE IF NOT EXISTS deliveries (event_key TEXT NOT NULL, event_name TEXT NOT NULL, occurred_ms INTEGER NOT NULL, state TEXT NOT NULL DEFAULT 'pending', PRIMARY KEY(event_key,event_name))`);
  }
  meta(key) { return this.sql.exec('SELECT value FROM meta WHERE key=?', key).toArray()[0]?.value; }
  put(key, value) { this.sql.exec('INSERT INTO meta(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', key, String(value)); }
  status() {
    return { tracking_start: this.env.TRACKING_START, last_success: this.meta('last_success') || null,
      last_attempt: this.meta('last_attempt') || null, last_error: this.meta('last_error') || null,
      sync_ready: Boolean(this.meta('sync_token')), sending_enabled: this.env.SEND_EVENTS === 'true',
      bookings: this.sql.exec('SELECT status,excluded,COUNT(*) AS count FROM bookings GROUP BY status,excluded').toArray(),
      deliveries: this.sql.exec('SELECT event_name,state,COUNT(*) AS count FROM deliveries GROUP BY event_name,state').toArray(),
      marker_health: this.meta('marker_health') || 'not_checked',
      deliveries_needing_review: this.sql.exec("SELECT COUNT(*) AS count FROM deliveries WHERE state IN ('uncertain','expired')").toArray()[0].count };
  }
  async record(event) {
    if (!event.id) return;
    const eventKey = await hash(`${this.env.CALENDAR_ID}:${event.id}`);
    const previous = this.sql.exec('SELECT * FROM bookings WHERE event_key=?', eventKey).toArray()[0];
    const matches = await matchesSchedule(event, this.env);
    // Deleted events may retain only ID. Only previously recognised IDs can bypass markers.
    if (!matches && !(previous && event.status === 'cancelled')) return;
    const change = transition(previous, event, Date.parse(this.env.TRACKING_START));
    if (!change) return;
    this.ctx.storage.transactionSync(() => {
      this.sql.exec(`INSERT INTO bookings(event_key,client_id,status,excluded,created,updated) VALUES(?,?,?,?,?,?)
        ON CONFLICT(event_key) DO UPDATE SET status=excluded.status,updated=excluded.updated`,
      eventKey, previous?.client_id || crypto.randomUUID(), event.status, Number(change.excluded), event.created || null, event.updated || null);
      if (change.action) {
        const time = change.action === 'appointment_booked' ? Date.parse(event.created) : (Date.parse(event.updated) || Date.now());
        if (Number.isFinite(time)) this.sql.exec('INSERT OR IGNORE INTO deliveries(event_key,event_name,occurred_ms) VALUES(?,?,?)', eventKey, change.action, time);
      }
    });
  }
  async sync(deadline) {
    if (!Number.isFinite(Date.parse(this.env.TRACKING_START))) throw new Error('invalid_tracking_start');
    const token = await googleToken(this.env);
    let syncToken = this.meta('sync_token'), pageToken;
    let resets = 0, pages = 0;
    do {
      if (Date.now() > deadline || ++pages > 100) throw new Error('calendar_sync_budget');
      const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(this.env.CALENDAR_ID)}/events`);
      url.searchParams.set('showDeleted', 'true'); url.searchParams.set('maxResults', '250'); url.searchParams.set('fields', CALENDAR_FIELDS);
      if (syncToken) url.searchParams.set('syncToken', syncToken);
      if (pageToken) url.searchParams.set('pageToken', pageToken);
      const response = await http(url, { headers: { Authorization: `Bearer ${token}` } });
      if (response.status === 410 && syncToken && resets++ === 0) {
        // Reset only the cursor, preserving deduplication and exclusions.
        syncToken = null; pageToken = null; this.sql.exec("DELETE FROM meta WHERE key='sync_token'"); continue;
      }
      if (!response.ok) throw new Error(`calendar_sync_${response.status}`);
      const data = await response.json();
      for (const event of data.items || []) {
        if (Date.now() > deadline) throw new Error('calendar_sync_budget');
        await this.record(event);
      }
      pageToken = data.nextPageToken;
      if (!pageToken) {
        if (!data.nextSyncToken) throw new Error('calendar_missing_sync_token');
        this.put('sync_token', data.nextSyncToken);
      }
    } while (pageToken || (syncToken === null && resets === 1 && !this.meta('sync_token')));
    // Recheck a known real sample on every run. Missing undocumented markers must stop sends.
    const sampleUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(this.env.CALENDAR_ID)}/events/${encodeURIComponent(this.env.MARKER_SAMPLE_ID)}`;
    const sample = await http(sampleUrl, { headers: { Authorization: `Bearer ${token}` } });
    if (!sample.ok || !await matchesSchedule(await sample.json(), this.env)) {
      this.put('marker_health', 'check_required'); throw new Error('calendar_marker_check_required');
    }
    this.put('marker_health', 'verified');
  }
  async deliver(deadline) {
    if (this.env.SEND_EVENTS !== 'true') return;
    // A crash after a send may mean GA4 accepted it. Never blindly retry such events.
    this.sql.exec("UPDATE deliveries SET state='uncertain' WHERE state='sending'");
    const pending = this.sql.exec("SELECT d.*,b.client_id FROM deliveries d JOIN bookings b USING(event_key) WHERE d.state='pending' ORDER BY occurred_ms LIMIT 20").toArray();
    for (const row of pending) {
      if (Date.now() > deadline - 20000) break;
      if (Date.now() - row.occurred_ms > 70 * 3600000) {
        this.sql.exec("UPDATE deliveries SET state='expired' WHERE event_key=? AND event_name=?", row.event_key, row.event_name); continue;
      }
      this.sql.exec("UPDATE deliveries SET state='sending' WHERE event_key=? AND event_name=?", row.event_key, row.event_name);
      let state = 'uncertain';
      try {
        const response = await http(gaUrl(this.env), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(conversionPayload(row, row.event_name, row.occurred_ms)) });
        if (response.ok) state = 'submitted';
      } catch { /* Delivery ambiguity requires review, not duplicate conversions. */ }
      this.sql.exec('UPDATE deliveries SET state=? WHERE event_key=? AND event_name=?', state, row.event_key, row.event_name);
      if (state === 'uncertain') throw new Error('ga4_delivery_uncertain');
    }
  }
  async run() {
    if (this.running) return json({ skipped: 'already_running' }, 409);
    this.running = true;
    this.put('last_attempt', new Date().toISOString());
    try {
      const deadline = Date.now() + 120000;
      await this.sync(deadline); await this.deliver(deadline);
      this.put('last_success', new Date().toISOString()); this.put('last_error', '');
      console.log(JSON.stringify({ operation: 'booking_sync', success: true }));
      return json(this.status());
    } catch (error) {
      // Never log third-party error bodies, tokens, calendar IDs or event details.
      const code = /^(google_auth_|calendar_|ga4_|invalid_tracking_start)/.test(error.message) ? error.message : 'booking_sync_failed';
      this.put('last_error', code); console.error(JSON.stringify({ operation: 'booking_sync', success: false, code }));
      return json({ ...this.status(), error: code }, 503);
    } finally { this.running = false; }
  }
  async fetch(request) {
    const path = new URL(request.url).pathname;
    if (request.method === 'GET' && path === '/status') return json(this.status());
    if (request.method === 'POST' && path === '/run') return this.run();
    if (request.method === 'POST' && path === '/validate') {
      const payload = conversionPayload({ client_id: crypto.randomUUID(), event_key: 'validation-only' }, 'appointment_booked', Date.now());
      payload.validation_behavior = 'ENFORCE_RECOMMENDATIONS';
      const response = await http(gaUrl(this.env, true), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) return json({ valid: false, status: response.status }, 502);
      const result = await response.json();
      return json({ valid: !result.validationMessages?.length, validationMessages: result.validationMessages || [], production_events_sent: 0 });
    }
    return new Response('Not found', { status: 404 });
  }
}

export default {
  async scheduled(controller, env, ctx) {
    const stub = env.BOOKINGS.get(env.BOOKINGS.idFromName('calendar-bookings'));
    ctx.waitUntil(stub.fetch('https://internal/run', { method: 'POST' }).then(response => {
      if (!response.ok && response.status !== 409) throw new Error(`booking_sync_http_${response.status}`);
    }));
  },
  async fetch(request, env) {
    if (!env.ADMIN_TOKEN || request.headers.get('Authorization') !== `Bearer ${env.ADMIN_TOKEN}`) return new Response('Not found', { status: 404 });
    return env.BOOKINGS.get(env.BOOKINGS.idFromName('calendar-bookings')).fetch(request);
  },
};
