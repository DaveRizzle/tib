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
export function conversionPayload(row, eventName, timestamp) {
  return {
    client_id: row.client_id,
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
