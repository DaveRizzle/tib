# Automatic Calendar booking register

Worker: `tib-booking-conversions`, Cloudflare account `09dfe272fc0ceb9c2a545b1f624c9c0b`.
Endpoint: https://tib-booking-conversions.david-robertson67.workers.dev
One SQLite-backed Durable Object holds the register and Calendar sync cursor.
Cron: `*/5 * * * *` (every five minutes). No computer or manual script is needed.

## Data and event semantics

Only read-only Calendar access is used. API field selection excludes event titles,
attendees, descriptions and conference details. Match the exact configured schedule
fingerprint and owner, not generic confirmed events. Google’s observed
`goo.createdByAvailId` / `goo.createdBySet` markers are undocumented. A known sample
is checked on each sync; missing sample markers stop sends with an operational error.
The sample must remain retrievable. A permanently removed sample needs replacement.

The register stores hashed calendar/event IDs, random per-booking Analytics IDs,
status, timestamps, exclusion flags and delivery state. It stores no attendee data.
The schedule fingerprint, sample ID, calendar ID, OAuth key and API/admin secrets
are encrypted Worker secret bindings. No secret belongs in Git or the static site.

`TRACKING_START` is a fixed cutoff. Older bookings, including the user's existing
tests, are excluded permanently. A new confirmed booking after that cutoff queues
`appointment_booked`; cancellation queues `appointment_cancelled` separately.
Edits/reschedules keeping the same Calendar event ID cannot create another booked
event. A replacement created under a new ID is a new calendar booking; automatic
recognition of that as a reschedule has not been established. Reinstating the same
cancelled ID does not send another booked event. Cancellation events do not subtract
historical GA4 key events; use register statuses for currently active bookings.
A booking created and cancelled entirely between polls may only be observed as
cancelled and is not counted as a confirmed booking. Calendar status is not attendance.

Source of truth for counts is the register. Cursor expiry triggers a full resync
without clearing the booking/delivery ledger. Pagination replay is idempotent.
Persist `sending` before contacting GA4. Successful HTTP responses become `submitted`,
which is NOT proof GA4 processed the event. Timeouts, errors or interrupted sends
become `uncertain` and are never automatically retried (avoids duplicate conversions).
Review them using Worker status/logs. Events older than 70 hours become `expired`
rather than being silently retimed. This is not a claim of exactly-once GA4 delivery.

## GA4 destination

Property `562594130`, dedicated web stream `16286989508`, measurement ID
`G-0N914J2Z4W` (Calendar booking confirmations). Do not install this tag on the website.
`appointment_booked` is configured as a key event once per event. Cancellations are
ordinary events. The website remains on `G-GMZT51K1VM` / stream `16279643437`.

Server events have `event_origin=calendar_sync`, `attribution_status=unlinked` and
`booking_provider=google_calendar`, with opaque IDs and no personal details. There
is no website client/session matching. No website pageviews/session IDs are fabricated.
These events use separate random Analytics client IDs, so property-wide user totals
may increase; filter to the website stream for website users and conversion rates.
Do not claim ad, campaign, device, location or website-session attribution from them.
Realtime visibility is not guaranteed without a corresponding session. Normal GA4
processing can lag; validate both the payload and eventual received real events.

## Operations

Install the parent analytics requirements. The admin token is stored locally in
ignored `.admin-token`; alternatively use `TIB_BOOKING_ADMIN_TOKEN`. Do not print it.
Unauthenticated requests return 404. Protected commands expose aggregate counts only.

```sh
python3 analytics/booking-worker/manage.py status
python3 analytics/booking-worker/manage.py run
python3 analytics/booking-worker/manage.py validate
node --test analytics/booking-worker/worker.test.mjs
```

`validate` uses Google's DEBUG endpoint and sends no production conversions.
`run` is optional; the cron runs automatically. Check `last_success`, `last_error`,
`marker_health`, delivery states, and `deliveries_needing_review`. Successful syncs
and sanitised errors are logged in Cloudflare observability. No external email/Slack
alert is configured; a failed sync must be investigated in these status/log surfaces.
Changes to Cron Triggers can take up to 15 minutes to propagate.

Deploy from this directory with a scoped Cloudflare API token:

```sh
npx wrangler@4.158.0 deploy --config wrangler.jsonc
```

Required Worker secrets: GOOGLE_SERVICE_ACCOUNT (JSON with client_email/private_key),
CALENDAR_ID, SCHEDULE_FINGERPRINT, MARKER_SAMPLE_ID, TRACKING_START,
GA4_MEASUREMENT_ID, GA4_API_SECRET and ADMIN_TOKEN. Preserve existing secrets when
redeploying. Setting SEND_EVENTS=false pauses delivery but keeps collecting changes;
removing the cron pauses collection. Never clear storage to fix an expired cursor.

## Setup status — 6 November 2026

The initial deployed Cloudflare sync succeeded and verified the schedule marker:
2 cancelled tests and 1 confirmed test were excluded, with zero queued deliveries.
The owner accepted Google's User Data Collection Acknowledgement. The stream's
Measurement Protocol API secret was created and installed as an encrypted Worker
secret. Google's deployed DEBUG validation returned valid=true with zero messages
and no production events. Numeric-format anonymous client IDs are used; legacy UUID
records are deterministically normalised if needed. SEND_EVENTS=true enables
production submission for future eligible bookings. Existing baseline tests remain
excluded. Actual unattended execution succeeded at 14:15:38 UTC on 6 November
(16:15 Johannesburg), with delivery enabled and no errors. No eligible new real
booking has yet been sent, so eventual GA4 event receipt is still to be observed.
Six Node tests pass. See ../AGENTS.md for the dated verification record.
