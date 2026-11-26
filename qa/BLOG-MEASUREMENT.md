# Article conversion diagnostics

The weekly-planning guide is informational. Its links offer readers a way to
explore coaching without equating readership with a qualified sales lead.

- The homepage links contextually to the published guide.
- Existing booking_click events include cta_location: header, article, footer,
  or other. A booking click is not a confirmed or attended appointment.
- coaching_interest is sent for the article's two contextual coaching links.
  coaching_destination is how_it_works or pricing; cta_location is article.
- These event parameters contain only fixed, allowlisted labels. No contact,
  training, or form answers are included. Existing page_path/page_location
  identify the article; no internal campaign UTMs are needed.
- Both events respect analytics consent, GPC, and the existing production-host
  guard. Advertising storage, user data and personalization remain denied.
- coaching_interest is an ordinary diagnostic event, not a GA4 key event or
  a Google Ads primary conversion. Existing key-event settings are unchanged.
- Register event-scoped custom dimensions for cta_location and
  coaching_destination to use those parameters in GA4 reports. They do not
  backfill earlier event data. Report processing may lag.

Run the focused checks from the website root:

    node --test qa/test_blog_measurement.mjs

The tests execute the actual consent script with a stub DOM and never contact
Google or create appointments. Browser QA should additionally cover the real
article, essential-only/allow/withdrawal choices, mobile layout, and absence of
production tracking on local/preview hosts. The localhost-only ga4_test_id
override supports a nonproduction measurement ID for isolated network checks.

For commercial analysis, keep the website stream separate from the anonymous,
unlinked Calendar confirmation stream. Evaluate qualified and attended calls,
paid clients and retention in the private sales register. Do not divide unlinked
Calendar confirmations by article sessions to claim an attributed conversion rate.
