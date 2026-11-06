# GA4 diagnostics

See [AGENTS.md](AGENTS.md) for the dated audit baseline, deployment history and remaining work.

Production property: `562594130` (`tib_ads_1`), account `414911292`,
web stream `16279643437`, measurement ID `G-GMZT51K1VM`.
Account IDs and property IDs are different.

Install `python3 -m pip install -r analytics/requirements.txt` in your Python environment.
The ignored service-account key defaults to the repository root; override it with
`GOOGLE_APPLICATION_CREDENTIALS`. Never deploy the key or include it in a static Pages upload.
`GA4_PROPERTY_ID` overrides the property for diagnostics; the audit still requires the
expected production measurement ID to be present.

Run from the repository root:

```sh
python3 analytics/ga4.py audit
python3 analytics/ga4.py today
python3 analytics/ga4.py events
python3 analytics/ga4.py realtime
```

All commands use read-only scopes and real API requests. Failures exit nonzero.
Empty report rows mean no reportable data was returned, not that tracking is verified.
The audit reports the last 30 days through yesterday; today's processed data may lag.
Legacy script names delegate to these commands. These are operational diagnostics,
not automated unit tests. Output contains business analytics: do not publish it.

## Booking funnel

The homepage sends `booking_click` when the Google Calendar booking link is clicked
on either production hostname. It contains the provider only, not visitor details.
Local and Cloudflare preview visits do not configure production Analytics or send
this event. Google enhanced measurement may also send `click`; these are distinct
events and must not be summed as unique bookings.

On 6 November 2026, `booking_click` was configured remotely as a GA4 key event,
counted once per session. Event-data retention was extended to 14 months.
The homepage was deployed on 6 November 2026 via PR #12. Live HTML was verified;
browser-to-GA4 receipt of `booking_click` still needs validation in Realtime/DebugView. It is NOT an appointment confirmation.
The [booking Worker](booking-worker/README.md) now implements a separate Calendar
booking register; see its setup status before assuming GA4 delivery is enabled. Do not create it from booking-link clicks or generic form submissions.

Editor access and both remote settings were verified by API readback.
Pending work: validate browser event receipt, standardise tags on CMS-managed
pages through the CMS/re-scrape workflow, and finish/validate the booking Worker activation. Ads linking requires
the relevant Google Ads account access. No remote settings are changed by these scripts.
