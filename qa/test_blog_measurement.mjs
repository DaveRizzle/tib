// Test the site's real consent script without contacting Google or Calendar.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

const source = readFileSync(new URL('../assets/tib-consent.js', import.meta.url), 'utf8');
const choice = { analytics: true, noticeVersion: '2026-11-19-v1', expiresAt: '2099-01-01T00:00:00.000Z' };

function exercise({ allowed = true, host = 'www.theinfinitebody.com', gpc = false } = {}) {
  const listeners = new Map();
  function link(attrs, region = '') {
    const element = {
      getAttribute: name => attrs[name] || null,
      closest: selector => selector === region ? {} : null,
      addEventListener: (type, handler) => listeners.set(element, handler),
    };
    return element;
  }
  const booking = [link({}, 'header'), link({ 'data-tib-cta': 'article' }), link({}, 'footer')];
  const coaching = [link({ 'data-tib-coaching': 'how_it_works' }), link({ 'data-tib-coaching': 'pricing' }), link({ 'data-tib-coaching': 'unexpected' })];
  const stub = () => ({ hidden: true, setAttribute() {}, addEventListener() {}, appendChild() {}, querySelector: stub });
  const document = {
    readyState: 'complete',
    cookie: 'tib_consent_v1=' + encodeURIComponent(JSON.stringify({ ...choice, analytics: allowed })),
    createElement: stub,
    head: { appendChild() {} },
    body: { appendChild() {} },
    querySelectorAll: selector => selector.startsWith('a[href=') ? booking : selector === 'a[data-tib-coaching]' ? coaching : [],
  };
  const window = {};
  const navigator = { globalPrivacyControl: gpc };
  vm.runInNewContext(source, { window, document, navigator, location: { hostname: host, search: '' }, URLSearchParams, Date });
  const click = element => listeners.get(element)({ currentTarget: element });
  return { window, navigator, booking, coaching, click, events: () => Array.from(window.dataLayer).filter(x => x[0] === 'event' && x[1] !== 'consent_choice').map(x => JSON.parse(JSON.stringify(Array.from(x)))) };
}

test('booking placement and article destinations emit exactly one diagnostic event per click', () => {
  const run = exercise();
  run.booking.forEach(run.click);
  run.coaching.forEach(run.click);
  const events = run.events();
  assert.equal(events.length, 5);
  assert.deepEqual(events.slice(0, 3).map(e => [e[1], e[2].cta_location]), [['booking_click', 'header'], ['booking_click', 'article'], ['booking_click', 'footer']]);
  assert.deepEqual(events.slice(3).map(e => [e[1], e[2].coaching_destination]), [['coaching_interest', 'how_it_works'], ['coaching_interest', 'pricing']]);
  assert.ok(events.every(e => e[2].transport_type === 'beacon'));
  assert.ok(events.every(e => !('email' in e[2]) && !('link_url' in e[2])));
  const update = Array.from(run.window.dataLayer).find(e => e[0] === 'consent' && e[1] === 'update');
  assert.equal(update[2].analytics_storage, 'granted');
  for (const field of ['ad_storage', 'ad_user_data', 'ad_personalization']) assert.equal(update[2][field], 'denied');
});

for (const options of [{ allowed: false }, { gpc: true }, { host: 'preview.pages.dev' }, { host: 'localhost' }]) {
  test('suppress diagnostics for ' + JSON.stringify(options), () => {
    const run = exercise(options);
    [...run.booking, ...run.coaching].forEach(run.click);
    assert.equal(run.events().length, 0);
  });
}

test('public booking API stays compatible and GPC suppresses later clicks', () => {
  const run = exercise();
  run.window.TIBConsent.bookingClick();
  assert.equal(run.events().length, 1);
  assert.equal(run.events()[0][2].cta_location, 'other');
  run.navigator.globalPrivacyControl = true;
  [...run.booking, ...run.coaching].forEach(run.click);
  assert.equal(run.events().length, 1);
});
