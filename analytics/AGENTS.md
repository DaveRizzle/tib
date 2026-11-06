# Analytics project memory

Last updated: 6 November 2026 (Africa/Johannesburg).
This is a dated record of verified findings, not a claim about future live state.
Read the repository-root AGENTS.md alongside this file. Where the root file says
all pages use G-NSJ5MNTZNF, that statement is stale: use the verified details below.

## Verified production configuration

- GA4 account: `414911292` (TIB Ads).
- GA4 property: `562594130` (`tib_ads_1`), created 5 November 2026.
- Web stream: `16279643437` (The Infinite Body).
- Production measurement ID: `G-GMZT51K1VM`.
- Production hostnames: `theinfinitebody.com`, `www.theinfinitebody.com`.
- Property timezone: Africa/Johannesburg. Currency: ZAR.
- Booking link: https://calendar.app.google/ZyW4qWin1iDgaxhX6
- Booking calendar owner: admin@theinfinitebody.com.
- Existing service account: tib-market-intel@tib-market-intel.iam.gserviceaccount.com.
  The user granted Editor access; successful writes verified it on 6 November.
- Key file: repository-root tib-market-intel-95b303aac178.json (gitignored).
  Never print its contents, commit it, or include it in a Pages upload.
- No Google Ads account was linked when audited. Recheck before making claims
  about ad conversion imports or bidding.

## Historical baseline pulled on 6 November 2026

Source: authenticated GA4 Data API reports, requested 7 October–5 November 2026
(`30daysAgo` through `yesterday`). The property only existed from 5 November,
so this is effectively the first day's data, not a month of established traffic.
No fresh traffic report was requested while writing this memory.

| Event | Event count | Users for that event | Key events |
| --- | ---: | ---: | ---: |
| page_view | 9 | 5 | 0 |
| session_start | 8 | 5 | 0 |
| first_visit | 5 | 5 | 0 |
| user_engagement | 5 | 2 | 0 |
| scroll | 1 | 1 | 0 |

| Hostname | Sessions | Page views | Key events |
| --- | ---: | ---: | ---: |
| www.theinfinitebody.com | 4 | 6 | 0 |
| theinfinitebody.com | 2 | 2 | 0 |
| cfdee076.tib-marketing.pages.dev | 2 | 1 | 0 |

No outbound `click` rows appeared in this historical report. Separate realtime
queries returned page_view, session_start and scroll activity. Today's processed
report initially returned no rows; that was not proof of no visitors.

Interpretation: tracking was receiving traffic, but this tiny sample includes
preview/test activity and cannot support conclusions about conversion performance.
Do not sum user counts across events or infer no appointments from zero key events.
Host-level sessions are dimensional report values, not a guaranteed deduplicated total.

## Changes completed on 6 November 2026

1. Replaced misleading Universal Analytics diagnostics with `ga4.py`, using
   authenticated GA4 Admin/Data API requests, read-only scope, timeouts and nonzero
   failure exits. Legacy filenames delegate to it. Property/account IDs are distinct;
   the old property value `414911292` returned 403. Removed reliance on the missing
   google.analytics package; dependencies are in requirements.txt.
2. Versioned analytics source by removing the blanket analytics/ ignore rule.
   Kept the service-account key ignored and added Python cache/environment ignores.
3. Aligned the local homepage with production's verified measurement ID. The
   previous uncommitted local tag G-NSJ5MNTZNF differed from the live homepage.
4. Added `booking_click` on the exact Google Calendar booking link. Payload has
   booking_provider=google_calendar and beacon transport; no visitor details.
5. Limited homepage GA4 config and booking events to the two production hostnames.
   This prevents new homepage local/preview traffic; old data is not removed and
   other exported pages have not been updated.
6. Created remote GA4 key event `booking_click`, ONCE_PER_SESSION, resource
   properties/562594130/keyEvents/16286776925. Readback verified it.
7. Extended event-data retention from TWO_MONTHS to FOURTEEN_MONTHS. Readback
   verified it; resetUserDataOnNewActivity remained true. Do not treat this as a
   recovery of historical events that were never collected.
8. Merged PR #12: https://github.com/DaveRizzle/tib/pull/12
   Source commit b3b71381e708f9fa75e2ca278ecc47e509870473;
   merge commit 8283b55c77ad18b59c82c740e2a678385c073f71.
9. Deployed to Cloudflare Pages project tib-marketing, production branch main.
   Deployment: https://e3f9d4bb.tib-marketing.pages.dev
   Promoted index-v2.html to index.html in a clean temporary staging directory.
   Retained existing exported WordPress assets for secondary-page compatibility.
   Excluded analytics scripts, keys and unrelated local files from the upload.
10. Verified the normal production homepage returned the correct tag, hostname
    guard, booking_click handler and booking link. An initial older response was
    followed by successful fresh and normal-URL checks.

## What is and is not verified

- Live Admin/Data API connectivity and remote settings were verified.
- JavaScript checks verified config/event calls for both production hostnames,
  and no config/booking event calls for localhost or preview hostnames.
- Missing credentials correctly returned exit 1; Python parsing and diff checks passed.
- Live HTML deployment was verified. No actual browser booking-click receipt in
  GA4 Realtime/DebugView has been verified yet. Do not claim end-to-end delivery.
- `booking_click` means a visitor opened the booking page, NOT an appointment booked.
  Key-event counting is once per session; raw eventCount can include repeat clicks.
- Enhanced measurement outbound clicks are enabled, so generic `click` may also
  appear. Do not sum click and booking_click as distinct people or appointments.
- No appointment_booked confirmation integration exists. Do not create a completed
  booking event from outbound clicks, generic form submissions or page views.
- Original key events purchase, qualify_lead and close_convert_lead were left intact;
  none appeared in the baseline. Their presence does not prove an integration.

## Outstanding work and follow-up reporting

1. Validate a deliberate real-browser booking-link click in GA4 Realtime/DebugView,
   documenting test traffic. Do not create a real appointment without authorization.
2. Choose a reliable Google Calendar booking-confirmation integration and separately
   measure confirmed appointments. Analytics Editor access alone grants no Gmail
   or Calendar access. Never send names, emails or appointment notes to GA4.
3. Standardise secondary-page tags through the CMS/re-scrape workflow. On the audit
   date, live privacy-policy used G-NSJ5MNTZNF and work-with-me had no GA tag in HTML.
   The root instructions prohibit hand-editing raw exported WordPress directories.
4. Recheck Google Ads linkage if the user requests ad attribution; relevant Ads
   access is separate from GA4 access.
5. Compare production-host sessions and booking-intent key events after enough
   post-deployment data exists. Report date range, timezone, host filters and lag.
   Keep pre-deployment and preview activity separate from post-deployment results.

## Working conventions

Use README.md for commands (`audit`, `today`, `events`, `realtime`). Diagnostics are
read-only and do not apply remote settings. Query live state when needed rather than
assuming this snapshot is current. Do not persist raw report dumps or private data
in source control without an explicit user request. Update this dated memory after
verified changes; distinguish code deployment, GA4 configuration and event receipt.
Use feature/chore branches and PRs. Deploy only staged public site files, never the
repository root with credentials. Preserve unrelated local files and edits.

The user also asked about forwarding booking notifications to another monitored
inbox. Gmail forwarding with a verified destination and a booking-specific filter
was explained, but no destination was supplied and no forwarding was configured.
That notification workflow is separate from Analytics conversions.

## Calendar connection check — 6 November 2026

The user reported sharing the booking calendar with the existing service account.
A real request with calendar.readonly scope to calendar ID admin@theinfinitebody.com
returned HTTP 403, reason SERVICE_DISABLED/accessNotConfigured. Google Calendar API
(calendar-json.googleapis.com) is disabled or has never been enabled in Cloud project
351917990722 (tib-market-intel). This response does not verify or disprove the calendar
sharing permission; Google blocks the API call before calendar access can be tested.
No events or attendee details were retrieved, and no appointment tracking was enabled.
Next: enable Google Calendar API in that Cloud project, then repeat the read-only check
and inspect booking metadata before designing a confirmed-booking integration.
Activation URL: https://console.developers.google.com/apis/api/calendar-json.googleapis.com/overview?project=351917990722

## Calendar access verified — 6 November 2026

After the user enabled Google Calendar API, repeated calendar.readonly requests
returned HTTP 200 for both calendar metadata and events on admin@theinfinitebody.com.
The calendar timezone is Africa/Johannesburg. This supersedes the SERVICE_DISABLED
block above: read access is now verified, not merely reported by the user.

A single complete events listing covering 90 days before and 90 days after the
check returned 133 confirmed-status entries: 129 workingLocation and 4 default
calendar events. The 4 default events have attendees. No returned event contained
an appointmentSchedule field, extendedProperties, 'discovery' in its title, or the
configured booking short URL in its description. These findings do NOT establish
whether there have been any real appointments; ordinary confirmed calendar events
are not proof of appointment-schedule bookings. Attendee details were not output
or saved. No events were changed and no conversion was sent.

Next dependency: identify a known appointment made via the actual public booking
link (approximate date and non-personal title), or establish there have been none.
The user was asked for this information. Do not classify all default events with
attendees as bookings, and do not count working-location records. No test booking
has been created. Completed-booking automation remains unimplemented pending a
verified way to recognise the relevant appointments and a plan for attribution.

## Known booking sample identified — 6 November 2026

The user reported deleting a booking and creating a new one. Read-only inspection
of events updated in the preceding day returned 3 appointment-marked entries:
2 cancelled and 1 confirmed. The confirmed entry was created at 13:56:18 UTC
(15:56:18 Johannesburg); no attendee identity or event title was output or saved.

All three share the same values for these extendedProperties.shared keys:
- goo.createdByAvailId
- goo.createdBySet

These markers were absent from the earlier ordinary-event sample. There was one
distinct createdByAvailId and one distinct createdBySet across the three entries.
This is observed evidence of a common appointment schedule, not a documented Google
contract for these internal key names. The Calendar API documents extended
properties generally, but not these particular keys. Any implementation must match
the verified schedule, fail closed if markers disappear, and avoid treating generic
confirmed meetings or working locations as bookings. Do not publish schedule values.

The earlier lack of a booking marker is superseded for this newly created sample.
No automation or appointment_booked event has been enabled. No GA4 events were sent.
Treat these samples as test bookings and exclude them from production conversions.
A future register should deduplicate by calendar/event ID, track cancellations
separately, and distinguish new bookings from edits/reschedules. Calendar completion
signals still do not provide the visitor's GA4 client/session identifiers; website
or ad attribution remains unresolved. Counting a confirmed booking is distinct from
recording that the person attended the appointment.

## Cloudflare automatic register deployed — 6 November 2026

The user explicitly requested setting up the automatic Cloudflare integration.
Source: analytics/booking-worker/. Worker tib-booking-conversions, account
09dfe272fc0ceb9c2a545b1f624c9c0b; endpoint
https://tib-booking-conversions.david-robertson67.workers.dev (admin bearer required).
Cloudflare token could manage Workers but lacked D1 access, so state uses one
SQLite-backed Durable Object (BookingTracker) instead. No Pages site files changed.

A dedicated GA4 stream was created in property 562594130:
- Name: Calendar booking confirmations
- Stream ID: 16286989508
- Measurement ID: G-0N914J2Z4W
Do not install this stream's tag on the website. appointment_booked was created
as a property key event counted once per event; appointment_cancelled is an ordinary
event. Separate random per-booking client IDs are deliberately unlinked to website
visitors/sessions. Filter by stream for website-only users and conversion rates.

Tracking cutoff: 2026-11-06T14:03:17.222191Z (16:03:17 Johannesburg). Baseline sync
from the deployed Worker returned 2 cancelled tests and 1 confirmed test, all
excluded, no queued deliveries, verified schedule markers, and a valid sync cursor.
A repeat deployed sync also passed at 14:05:59 UTC without creating duplicate records.
Worker version a428cc95-4b59-479e-9fbb-3f11a3a5795e deployed with SEND_EVENTS=false.
Cloudflare schedule API confirmed */5 * * * * registered at 14:05:54 UTC. Actual
unattended cron execution has not yet been observed; initial successful runs were
manual verification calls. Cron propagation may take up to 15 minutes.

BLOCKER: Google returned FAILED_PRECONDITION when creating a Measurement Protocol
API secret: User Data Collection Acknowledgement must be attested on this property.
The user was asked to review and accept it in GA4 Admin → Data streams → Calendar
booking confirmations → Measurement Protocol API secrets. Do not attest it on the
user's behalf. Calendar collection is scheduled, but GA4 sends are intentionally
paused. No appointment conversion has been sent. Do not claim full activation.

Next: after the acknowledgement, create the stream's Measurement Protocol secret,
upload it to the Worker, validate through /validate (DEBUG endpoint, no conversion),
set SEND_EVENTS=true, redeploy and verify both live status and an actual unattended
cron execution. Verify eventual real event receipt without sending the existing
tests as production bookings. If activation is delayed, queued events older than
70 hours expire for review rather than being silently retimed.

Encrypted Worker secrets hold Google service-account credentials (Calendar read-only
scope at runtime), calendar ID, schedule fingerprint, known sample ID, cutoff,
stream measurement ID and private admin token. GA4_API_SECRET is not installed yet.
The local admin token is in ignored analytics/booking-worker/.admin-token (mode 0600).
All management endpoints are authenticated and return aggregate status, not IDs.

The register deduplicates by hashed calendar/event ID. Same-ID edits/reschedules
and restoring the same cancelled ID do not create another booked conversion. A
replacement under a new ID cannot yet be distinguished from a genuinely new booking.
Cancellation does not subtract previously recorded GA4 key events. An event created
and cancelled between polls may not be observed while confirmed. Internal marker
names remain undocumented: sends halt if the known sample loses its expected markers.
Deleting that sample permanently requires updating the sample secret.

GA4 HTTP success is only submission, not proof of processing. Delivery ambiguity
(timeouts/errors/crashes) is marked uncertain, never automatically replayed; status
exposes deliveries_needing_review. No external email/Slack alert was configured.
Use protected status and Cloudflare logs. Successful syncs and sanitised failures
are logged without credentials or attendee details.

Validation: five Node tests passed against real in-memory SQLite for exact schedule
matching, exclusion/deduplication, cancellations, delivery ambiguity, pagination,
cursor reset, marker failure, payload privacy and unauthenticated denial. Python
management helper parsed and git diff checks passed. See booking-worker/README.md.
