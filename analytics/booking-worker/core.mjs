export const MARKER_KEYS = ['goo.createdByAvailId', 'goo.createdBySet'];
export async function hash(value) {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))].map(x => x.toString(16).padStart(2, '0')).join('');
}
export async function matchesSchedule(event, env) {
  const shared = event.extendedProperties?.shared;
  if (event.eventType && event.eventType !== 'default') return false;
  if (event.organizer?.email !== env.CALENDAR_ID) return false;
  if (!MARKER_KEYS.every(key => typeof shared?.[key] === 'string' && shared[key])) return false;
  return await hash(JSON.stringify(MARKER_KEYS.map(key => shared[key]))) === env.SCHEDULE_FINGERPRINT;
}
export function newClientId() {
  return `${crypto.getRandomValues(new Uint32Array(1))[0]}.${Math.floor(Date.now() / 1000)}`;
}
function analyticsClientId(value) {
  if (/^\d+\.\d+$/.test(value)) return value;
  // Baseline records from the paused deployment used UUIDs. Keep any legacy
  // non-excluded row stable if it is ever delivered, without claiming a browser ID.
  const hex = value.replaceAll('-', '');
  if (/^[0-9a-f]{32}$/i.test(hex)) return `${parseInt(hex.slice(0, 8), 16)}.${parseInt(hex.slice(8, 16), 16)}`;
  throw new Error('ga4_invalid_client_id');
}
export function conversionPayload(row, eventName, timestamp) {
  return {
    client_id: analyticsClientId(row.client_id),
    timestamp_micros: String(Math.trunc(timestamp * 1000)),
    consent: { ad_user_data: 'DENIED', ad_personalization: 'DENIED' },
    events: [{ name: eventName, params: {
      booking_provider: 'google_calendar',
      event_origin: 'calendar_sync',
      attribution_status: 'unlinked',
      event_id: `${row.event_key}:${eventName}`,
    } }],
  };
}

// Identical IDs are edits/reschedules, never a second booked conversion.
// Cancellation notifications are independent from gross booked conversions.
export function transition(previous, event, startMs, now = Date.now()) {
  if (!['confirmed', 'cancelled'].includes(event.status)) return null;
  if (!previous && event.status === 'cancelled') return { excluded: true, action: null };
  const created = Date.parse(event.created);
  const excluded = previous ? Boolean(previous.excluded) : !Number.isFinite(created) || created < startMs || created > now;
  if (excluded) return { excluded: true, action: null };
  if (event.status === 'confirmed') return { excluded: false, action: previous ? null : 'appointment_booked' };
  return { excluded: false, action: previous && previous.status !== 'cancelled' ? 'appointment_cancelled' : null };
}
