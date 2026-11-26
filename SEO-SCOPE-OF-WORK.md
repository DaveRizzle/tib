# SEO Strategy — Scope of Work

**Site:** The Infinite Body  
**Prepared:** 13 November 2026  
**Status:** Active  
**Primary business outcome:** Qualified, confirmed coaching appointments

## Objective

Build an evidence-led organic search programme that attracts prospective online
strength-coaching clients and converts them into confirmed appointments. Technical
indexability and reliable measurement come before keyword expansion or content
volume.

## Operating guardrails

The project will not:

1. Treat page views, rankings, impressions or traffic as completed conversions.
2. Treat `booking_click` as a confirmed appointment. It is an intent signal;
   `appointment_booked` is the confirmed-booking event.
3. Target broad or high-volume keywords without validating search intent and
   commercial relevance.
4. combine unrelated search intents on one generic landing page.
5. publish content solely because an SEO tool recommends it or to meet a volume quota.
6. permit unreviewed automatic platform changes.
7. make performance claims from tiny, test-contaminated samples.
8. suppress raw South African analytics data. South Africa will be excluded at
   reporting time so the underlying data remains recoverable.
9. launch paid acquisition before conversion measurement and landing-page alignment
   are verified.

## Baseline findings

The initial live audit found:

- `/sitemap.xml` and `/sitemap_index.xml` return homepage HTML with status 200 rather
  than an XML sitemap.
- `robots.txt` begins with valid Cloudflare-managed directives but then contains the
  complete homepage HTML because the missing path falls back to `index.html`.
- `theinfinitebody.com` and `www.theinfinitebody.com` both return the homepage with
  status 200; neither redirects to the other.
- The homepage has no canonical link element.
- The homepage has no structured data.
- The homepage contains two `h1` elements for alternate hero treatments.
- `/work-with-me/` is `noindex, nofollow` and has stale exported-CMS metadata.
- Search Console access needs reauthentication before live query/index data can be
  audited.
- The homepage title and description are reasonable starting points but have not yet
  been validated against real search demand.

## Ordered work plan

Tasks are intentionally ordered. A later phase should not begin merely to create
visible output while an earlier dependency remains unresolved.

### Phase 1 — Technical foundation

#### 1. Select the canonical hostname — COMPLETE (13 November 2026)

**Decision:** `https://www.theinfinitebody.com` is the canonical origin.

Evidence:

- The historical site and 125 exported absolute URL references use `www`.
- The GA4 web stream default URI is `https://www.theinfinitebody.com`.
- Search Console reports the `www` homepage as submitted and indexed, with
  `https://www.theinfinitebody.com/` selected as Google's canonical.
- Search Console classifies the non-`www` homepage as “Duplicate without
  user-selected canonical” and selects the `www` URL as its Google canonical.
- The historical sitemap was submitted on the `www` hostname.

**Acceptance criteria met:** one documented canonical origin is approved and will be
used by all subsequent technical work.

#### 2. Redirect the alternate hostname — COMPLETE (13 November 2026)

Deployed the source-controlled Cloudflare Worker `tib-canonical-redirect` on route
`theinfinitebody.com/*` (version `82713d33-bf46-450d-b788-deac3db97c45`). Source and
operations notes are in `seo/canonical-redirect/`.

Verified that:

- HTTPS apex-host requests return one permanent `301` to the equivalent `www` URL.
- Paths and query strings are preserved.
- The destination scheme is always HTTPS.
- Canonical `www` requests remain untouched and return 200 without a redirect.
- Root, nested-path and query-string checks passed locally and against production.

Plain HTTP requests first receive the existing Cloudflare HTTP-to-HTTPS redirect and
then the hostname redirect. This two-hop legacy path is acceptable for noncanonical
HTTP entry points but should not be used in links or sitemap entries.

**Acceptance criteria met for the production HTTPS origin:** alternate-host URLs return
one permanent redirect to the equivalent canonical URL; canonical URLs return 200.

#### 3. Add canonical metadata — HOMEPAGE COMPLETE (13 November 2026)

Added one absolute, self-referencing canonical to the maintained homepage:

```html
<link rel="canonical" href="https://www.theinfinitebody.com/">
```

Deployed to Cloudflare Pages production from a clean public-only staging directory.
Deployment preview: `https://589274ea.tib-marketing.pages.dev`.

Verified on the deployment and canonical production hostname that:

- the homepage returns 200;
- exactly one canonical link is present;
- its value is `https://www.theinfinitebody.com/`;
- the apex hostname still preserves path/query and redirects to `www`;
- canonical `www` requests do not redirect.

Remaining page-level canonical work will be handled deliberately as each maintained
indexable page is identified or replaces a stale exported page. Exported WordPress
content will not be casually hand-edited.

**Homepage acceptance criteria met:** the maintained indexable homepage exposes exactly
one absolute canonical URL on the selected hostname.

#### 4. Create a valid `robots.txt` — COMPLETE (13 November 2026)

Added a source-controlled site-specific `robots.txt` and deployed it through a clean
Cloudflare Pages staging directory. Cloudflare continues to prepend its separately
managed AI crawler/content-signal policy.

Verified in production that:

- `/robots.txt` returns 200 as `text/plain`;
- the previous homepage HTML fallback is gone;
- standard search crawling remains allowed;
- the canonical sitemap URL is declared;
- the Cloudflare managed section is byte-for-byte unchanged from before deployment;
- managed blocks for GPTBot, ClaudeBot, Google-Extended and the other configured AI
  crawlers remain present.

Cloudflare handles `robots.txt` as a special managed endpoint, so the apex hostname can
serve the managed response directly rather than passing through the canonical redirect
Worker. Its sitemap declaration still points only to the canonical `www` origin.

Deployment preview: `https://0d556391.tib-marketing.pages.dev`.

**Acceptance criteria met:** `/robots.txt` returns clean plain text, permits intended
search crawling, preserves Cloudflare AI protection and names the canonical sitemap.

#### 5. Create a real XML sitemap — COMPLETE (13 November 2026)

Created and deployed:

- `/sitemap.xml`: canonical URL set;
- `/sitemap_index.xml`: valid index referencing the canonical sitemap.

The URL set currently contains only `https://www.theinfinitebody.com/`. This is the
only maintained page currently verified as canonical, indexable and suitable for
organic acquisition. Stale exported feeds/pages, redirects, `noindex` pages, preview
hosts and pages lacking an approved canonical were deliberately excluded. No `lastmod`
value is published because there is not yet a reliable process to keep it accurate.

Verified in production that:

- both endpoints return 200 as `application/xml`;
- both parse as valid XML with the standard sitemap namespace;
- the sole URL returns 200 directly without a redirect;
- the apex sitemap path redirects once to the canonical `www` sitemap;
- `robots.txt` names the canonical sitemap;
- no credentials or non-public project files were deployed.

Deployment preview: `https://db793fef.tib-marketing.pages.dev`.

**Acceptance criteria met:** `/sitemap.xml` returns valid XML, every entry resolves
correctly and no excluded URL is present.

#### 6. Add structured data — COMPLETE (13 November 2026)

Added one connected JSON-LD `@graph` to the maintained homepage with:

- `Organization`: The Infinite Body brand operated as a sole proprietorship;
- `WebSite`: canonical website and publisher relationship;
- `Person`: David Robertson, Online Strength Coach, public portrait and LinkedIn identity;
- `Service`: remote online strength coaching focused on a United States audience.

All entity IDs and asset URLs use the canonical HTTPS `www` origin. The service copy,
professional title, audience, remote delivery, coach identity and methods are supported
by visible homepage content.

Deliberately omitted legal-company claims, founding dates, hidden credentials, physical
address, local-business status, ratings, review scores, medical claims, guaranteed
outcomes, FAQ markup and variable pricing. David began working in fitness in 2006, but
that broader private career context was not published or stored in site files.

Verified that:

- the deployed preview and production homepage each expose exactly one parseable JSON-LD block;
- all internal `@id` references resolve within the graph;
- public logo and portrait assets return 200;
- Schema.org Validator reports zero errors and zero warnings.

Deployment preview: `https://218ead7d.tib-marketing.pages.dev`.

**Acceptance criteria met:** markup parses without errors or warnings, reflects visible
claims and uses canonical URLs.

#### 7. Restore and configure Search Console — COMPLETE (13 November 2026)

Completed:

- Reauthenticated `admin@theinfinitebody.com` for gcloud and product OAuth.
- Verified identity checks and token refresh.
- Confirmed site-owner access to `sc-domain:theinfinitebody.com`.
- Inspected both homepage hostname variants and confirmed Google's `www` canonical.
- Submitted `https://www.theinfinitebody.com/sitemap.xml` using a one-time
  Search Console write credential held in memory only.
- Removed the historical broken `http://www.theinfinitebody.com/sitemap.xml`
  submission, which had five warnings and one error.
- Read the final sitemap state back through the normal read-only credential.

Search Console downloaded the new sitemap at 14:10 UTC. Its current state is:

- pending: false;
- errors: 0;
- warnings: 0;
- submitted web URLs: 1;
- indexed through the sitemap report: 0 immediately after submission.

The separate URL Inspection result already reports the canonical `www` homepage as
submitted and indexed. Sitemap index counts can lag and should be checked again rather
than interpreted as de-indexing. The property still returns no query rows for the
preceding 90 days; recheck after post-verification data accrues.

**Acceptance criteria met:** authenticated access succeeds, the domain property is
verified, the canonical sitemap is submitted and its processing state is recorded.

#### 8. Validate conversion measurement — IMPLEMENTATION VERIFIED; REAL EVENT PENDING

Completed 13 November 2026:

- Reconfirmed page views as engagement metrics, never conversions.
- Reconfirmed `booking_click` as a secondary booking-intent key event.
- Reconfirmed `appointment_booked` as a confirmed Calendar booking, not evidence of
  attendance, qualification, payment or website/ad attribution.
- Added `python3 analytics/ga4.py performance` as the standard read-only SEO report.
  It filters to the website stream and production hosts and excludes South Africa at
  query time without deleting raw data. It also excludes the separate Calendar stream.
- Verified the Calendar Worker is scheduled, sending-enabled, sync-ready and healthy,
  with verified markers, no last error and no deliveries requiring review.
- Revalidated the Measurement Protocol payload through Google's DEBUG endpoint:
  valid=true, no validation messages and zero production events sent.
- Passed all six Worker tests covering matching, exclusion, deduplication, delivery
  ambiguity, privacy and client-ID formatting.
- Confirmed all three known test bookings are cancelled and excluded. No test booking
  is represented as a production conversion.

The clean 30-day website view through 12 November reports 12 users, 13 sessions, 2
engaged sessions, 13 page views and zero key events. Both historical `booking_click`
events are removed by the South Africa reporting exclusion, consistent with test
activity.

The Calendar conversion stream still contains no processed event rows and the Worker
has no delivery records. The first eligible real `appointment_booked` delivery cannot
be verified until a genuine new booking occurs; a fake production booking will not be
created merely to close the task.

**Acceptance criteria partially pending by design:** event semantics and test exclusion
are verified. Final end-to-end receipt remains an observation task for the first genuine
booking.

### Phase 2 — Positioning, search demand and page architecture

Use `SEO-ICP-SEGMENTATION.md` as the working research plan for niche hypotheses,
interviews, evidence scoring and ICP selection. Permanent SEO pages should follow this
validation rather than precede it.

#### 9. Build the search-demand dataset — BASELINE COMPLETE; ENRICHMENT PENDING

Created `seo/search-demand/` with:

- 38 US query candidates across commercial, busy-schedule, plateau/intermediate and
  evidence/data clusters;
- 238 US/English Google autocomplete rows;
- 14 short competitor/customer-language evidence records;
- a reproducible builder and methodology/limitations report.

Combined the currently available evidence from:

- the verified Search Console property;
- live Google Ads API access-state testing;
- US Google autocomplete;
- 85 curated operators, including 33 direct-coaching operators;
- 76 fetched pages across 25 competitor domains;
- existing YouTube/category discovery seeds;
- the three ICP hypotheses.

Search Console currently has no query rows, so clicks/impressions remain blank rather
than being treated as zero. Google Ads volume is also blank because the developer token
is still Explorer tier; live requests confirmed that Basic or Standard access is
required. Competitor testimonials are language hypotheses, not a substitute for The
Infinite Body's own JTBD interviews.

Initial evidence favours situation/problem language over an executive identity keyword:
travel and busy-schedule queries have behavioural support, while executive-specific
phrases are sparse or ambiguous. Plateau/intermediate language has the broadest query
family but mostly informational/programme intent. Evidence/data language is currently
stronger as an authority mechanism across segments than as a standalone buyer niche.

**Baseline acceptance criteria met:** available sources are combined without inventing
missing demand. Refresh after Search Console accrues impressions, Google Ads Basic
access is approved and first-party interview language is collected. No candidate is yet
prioritised; that is Task 10.

#### 10. Classify and prioritise opportunities — PROVISIONAL COMPLETE

Created a documented strategic-fit model in `seo/search-demand/prioritize.py` and
scored all 38 candidates across:

- commercial relevance (25%);
- ICP fit (20%);
- intent clarity (15%);
- evidence quality (15%);
- service/conversion bridge (15%);
- differentiation potential (10%).

The model intentionally excludes unknown volume and is not a traffic/revenue forecast.
Outputs are `query-priorities.csv`, `page-clusters.csv` and `PRIORITIZATION.md`.

Consolidated the candidates into eight clusters:

- **P1:** existing homepage owns online-strength-coaching commercial intent;
- **P1:** one strength-plateau diagnostic guide;
- **P2:** busy-schedule message test before any indexed segment page;
- **P2:** distinct strength-training-while-travelling article;
- **P2:** method explanation, initially using existing homepage sections;
- **P3:** intermediate-programming intent review;
- **P3:** evidence/periodisation authority content;
- **HOLD:** no executive-identity indexed page.

The homepage remains the single commercial category owner; creating a duplicate
`/online-strength-coaching/` page now would risk cannibalisation. Plateau synonyms are
one guide, while data-driven/adaptive/personalised terms support the method rather than
creating thin pages.

**Provisional acceptance criteria met:** opportunities are classified, scored and
consolidated with explicit volume, result-page, first-party-language and proof gates.
Re-score when those missing sources become available.

#### 11. Design the page map — COMPLETE (13 November 2026)

Created `seo/search-demand/page-map.csv`, `internal-links.csv` and `PAGE-MAP.md` with
one owner per meaningful intent, publication gates and conditional internal links.

Architecture decisions:

- `/` remains the sole online-strength-coaching commercial owner;
- `/strength-training-plateau/` is the first proposed problem guide and consolidates
  all close plateau/not-getting-stronger variants;
- `/strength-training-while-traveling/` is a distinct proposed situation guide;
- `/lp/busy-schedule-strength-coaching/` is a non-indexed test surface only;
- `/method/` is conditional on content substantially deeper than the homepage;
- `/client-results/` is conditional on multiple detailed permissioned cases;
- `/guides/` is deferred until at least four substantive guides exist;
- intermediate, evidence/periodisation and executive identity ideas currently receive
  no URL.

The map also governs existing utility/legacy URLs: privacy remains a legal utility,
`/work-with-me/` remains out of the sitemap pending retirement/redirect through the
exported-page workflow, and feeds/author/404 exports are not acquisition destinations.

Every future indexable page must return 200 on canonical `www`, self-canonicalise, own a
unique intent, provide substantive original content, have a maintained internal link and
pass claim/analytics checks before entering the sitemap. Test pages remain `noindex`
and outside permanent navigation.

**Acceptance criteria met:** each approved/proposed intent has one destination or an
explicit no-page decision; cannibalisation rules and link paths are documented.

### Phase 3 — Content, proof and authority

#### 12. Build or improve commercial pages — HOMEPAGE FOUNDATION COMPLETE

Created `seo/commercial/HOMEPAGE-BRIEF.md` defining the homepage as the sole commercial
owner for online strength coaching, with its audience/job, failed alternatives, offer
mechanism, trust requirements, conversion hierarchy, structure and evidence gates.

Implemented and deployed the low-risk corrections supported by current evidence:

- reduced the document to one H1 by making the brand-led marble heading an H2 while
  preserving its visual treatment and accessible label;
- identified `David Robertson · Online Strength Coach` visibly in the coach section;
- clarified the variable monthly price as `US$400–$500`;
- standardised commercial and structured-data copy to US spelling (`personalized`,
  `periodized`, `custom program`) for the US market;
- preserved the single homepage canonical, production GA4 guard, booking-click event,
  structured-data entities and non-`www` redirect.

Verified the preview and production homepage return 200, expose exactly one H1 and one
canonical, retain one parseable JSON-LD graph, and show the updated provider/currency
copy. Schema.org Validator still reports zero errors and zero warnings.

Deployment preview: `https://55eea83b.tib-marketing.pages.dev`.

Deeper repositioning remains evidence-gated: no executive headline, duplicate service
page, travel/schedule uniqueness claim or major keyword-led title change was introduced.

**Homepage foundation acceptance criteria met:** title/intent ownership, heading
hierarchy, visible provider, offer clarity, proof sections and booking path align to one
commercial job without creating a competing page.

#### 13. Strengthen trust and authorship — FOUNDATION COMPLETE; PROOF GATES PENDING

Created `seo/trust/` with:

- `TRUST-AND-AUTHORSHIP.md`: provider identity, authorship, credential, claim and
  evidence standards;
- `proof-register.csv`: current public proof and explicit reuse restrictions;
- `CASE-STUDY-TEMPLATE.md`: consent, evidence, privacy, drafting and final checks.

Implemented and deployed:

- a visible statement that coaching is provided directly by David Robertson, Online
  Strength Coach, with the existing and supported `coached clients since 2008` claim;
- a matching Person structured-data description;
- an FAQ scope statement that strength coaching does not diagnose or treat injuries or
  medical conditions and directs affected clients to appropriately qualified healthcare
  professionals.

No qualification/certification is currently approved for publication, so none was
invented or inferred. David's detailed private career arc was not uploaded, committed or
published. The three existing named testimonials remain in their current homepage use,
but permission records are unverified; they must not be expanded into case studies,
advertising or review/rating schema until verified.

Verified in preview and production that the identity and scope statements are visible,
the private career details are absent, the page retains one H1/canonical/JSON-LD graph,
and Schema.org Validator reports zero errors and warnings.

Deployment preview: `https://5a4abc32.tib-marketing.pages.dev`.

**Foundation acceptance criteria met:** provider authorship and service scope are clear.
Detailed credentials and a `/client-results/` page remain blocked until verification and
written client permissions are recorded.

#### 14. Publish supporting content — STARTED; FIRST SOURCED DRAFT READY

Created the first supporting-content package at
`seo/content/strength-training-plateau/`:

- `CONTENT-BRIEF.md`: audience, intent, metadata, editorial thesis, diagnostic
  structure, original-contribution questions, claim boundaries, internal links,
  authorship and pre-publication gates;
- `SOURCE-REGISTER.csv`: ten verified PubMed records covering progression, weekly
  volume, frequency, intensity, training to failure, periodization, autoregulation,
  internal versus external load, HRV interpretation and the allostatic-load terminology
  boundary, with supported use and limitations;
- `DRAFT.md`: the first review-only draft, with inline sources, consultation-led
  troubleshooting, plain-language explanations, medical boundaries and a clearly
  labeled fictional example requiring David's personal approval.

The guide consolidates `strength training plateau`, `not getting stronger`, `lifting
plateau`, plateau-breaking and repeated-restart language into one proposed URL:
`/strength-training-plateau/`. It is designed as a diagnostic guide, not a service page
or collection of generic tips.

David's initial coaching judgement is now recorded: consultation about each client's
unique context and stressors is central; compare logged work with internal response and
recovery context; review app data, substantive client check-ins and optional
wearable-style signals together; inspect average load and programme fit; avoid premature
routine changes; and explain his undulating model in plain language. HRV alone must not
be described as a formal allostatic-load measurement. Any fictional example requires
David's personal review before publication. Private webinar material may inform David's
thinking but must not be named, cited, quoted or copied. US result-page review, full
source review and explicit medical-scope checks are still required.

The first article draft is complete but was not built or deployed. Search volume remains
unavailable while the Google Ads developer token is Explorer tier, and Search Console
has no query rows. Publishing before review would violate the strategy.

**Current acceptance state:** the evidence-led brief, source standard and first sourced
draft are ready. Publication remains gated on David's article and fictional-example
review, US result-page review, final source/claim checks and the documented technical
pre-publication checks.

#### 15. Implement internal linking

Create descriptive, useful links from supporting information to the relevant commercial
page. Avoid repetitive exact-match anchor patterns and orphan pages.

### Phase 4 — Measurement and iteration

#### 16. Establish the reporting baseline

Report production-host performance with South Africa excluded by default while
preserving raw data. Separate brand/non-brand queries, page types, booking intent and
confirmed appointments where the available data permits it.

#### 17. Review on a fixed cadence

Review monthly initially:

- indexation and crawl anomalies;
- query impressions, clicks and position;
- landing-page engagement;
- booking intent;
- confirmed appointments;
- content decay and cannibalisation.

Do not make strategic changes from a few days of data or isolated ranking movement.

## Deliverables

- Correct canonical-host and redirect configuration.
- Valid robots and sitemap files.
- Canonical and structured metadata.
- Verified Search Console setup and technical baseline.
- Search-intent and keyword opportunity map.
- Prioritised page architecture and briefs.
- Commercial and supporting content implemented in controlled iterations.
- Reporting that distinguishes engagement, booking intent and confirmed appointments.

## Change control

- Changes are implemented in the `tib` repository on a feature/chore branch and
  reviewed before production deployment.
- Exported WordPress directories are not hand-edited; they require the documented
  CMS/re-scrape workflow or deliberate replacement with maintained pages.
- Static deployments must exclude credentials, analytics utilities and unrelated local
  files.
- Technical changes are tested against both hostnames and representative paths before
  and after deployment.
- This document is the ordered backlog and should be updated with decisions, evidence
  and completion dates as work progresses.
