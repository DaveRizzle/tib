# Task 11 — SEO Page Map and Intent Ownership

**Prepared:** 13 November 2026  
**Market:** United States  
**Status:** Approved architecture hypothesis; publication gates still apply

## Architecture principle

One meaningful search intent gets one primary destination. A query variant does not
automatically deserve a URL. The architecture separates:

- a single commercial service owner;
- distinct problem/situation guides;
- optional methodology and proof pages that must earn their depth;
- controlled non-indexed message tests;
- held ideas with no page.

`page-map.csv` is the machine-readable register. `internal-links.csv` records links to
add only when both source and destination are appropriate.

## Proposed architecture

```text
/                                      HOME — commercial service owner
├── /strength-training-plateau/        PLATEAU — P1 problem guide
├── /strength-training-while-traveling/ TRAVEL — P2 situation guide
├── /method/                            METHOD — conditional, only if substantive
├── /client-results/                    RESULTS — conditional, only with detailed cases
├── /privacy-policy/                    PRIVACY — existing legal utility
└── /guides/                            GUIDES_HUB — conditional after 4+ approved guides

/lp/busy-schedule-strength-coaching/    BUSY_TEST — proposed noindex test, not navigation
/work-with-me/                           WORK_WITH_ME — existing noindex legacy page

No URL:
- INTERMEDIATE — held pending intent/volume
- EVIDENCE — held pending intent/original thesis
- EXECUTIVE — rejected for indexed publication under current evidence
```

The `/lp/` path is a test surface, not part of the organic hierarchy.

## Intent ownership

### HOME — `/`

**Owns:** online strength coaching and close commercial variants.

The current title, canonical and visible offer already establish this ownership. Do not
create `/online-strength-coaching/` while the site has one primary service. A second
commercial page would split links, copy, relevance and conversion data between two pages
with the same job.

The homepage should continue to contain:

- the offer and audience framing;
- how coaching works;
- the app/mechanism;
- concise coach identity and trust;
- concise client evidence;
- pricing orientation and FAQs;
- the discovery-call conversion path.

Future P1/P2 guides link back here rather than becoming disguised service pages.

### PLATEAU — `/strength-training-plateau/`

**Owns:** strength-training plateau, not getting stronger, lifting plateau, breaking a
plateau and repeated programme restarts.

This should be a diagnostic guide, not a listicle containing generic tips. A useful
structure would distinguish adherence, progression, recovery/fatigue, exercise
selection, technique, programme mismatch and life constraints. It should explain what a
reader can test independently and when individual coaching judgement adds value.

Do not publish separate pages for “lifting plateau,” “not getting stronger” and “break a
plateau” without later evidence of genuinely different result-page intent.

### TRAVEL — `/strength-training-while-traveling/`

**Owns:** strength/weight training while travelling and close practical variants.

Travel merits separation from the broad busy-schedule cluster because it creates a
specific task: equipment constraints, load substitution, session priorities, minimum
effective work and return-to-normal programming. The article must go beyond generic
hotel-room exercise suggestions.

### BUSY_TEST — `/lp/busy-schedule-strength-coaching/`

**Owns no organic intent while testing.**

Use only if a controlled message test is run. Requirements:

- `noindex` and excluded from the sitemap;
- no permanent navigation link;
- same underlying offer and conversion definition as other variants;
- traffic source and test period documented;
- evaluation based on qualified bookings, not clicks or page views.

If first-party interviews and behaviour validate the segment, decide whether its job is
already satisfied by HOME, TRAVEL and PLATEAU before promoting it into the indexed
architecture.

### METHOD — `/method/` only if substantive

**Potential ownership:** online strength programming, adaptive programming, load
prescription and coaching adjustment.

The homepage already contains method and app sections. A separate page is justified
only if it can show meaningful depth: inputs, decisions, examples, boundaries and client
benefits. “Personalised,” “adaptive” and “data-driven” are not enough.

If that depth is unavailable, keep METHOD as homepage sections and use no separate URL.

### RESULTS — `/client-results/` only with substantive cases

This is a conversion-support page, not a keyword-volume play. Create it when there are
multiple permissioned cases with context, starting point, process, duration, constraints
and appropriately qualified outcomes. Do not create it by duplicating the three short
homepage testimonials or adding aggregate-review markup.

### INTERMEDIATE — no page yet

`intermediate strength program` may mean a free/template programme rather than coaching.
Do not create `/intermediate-strength-programming/` until US result pages and volume show
an opportunity that the service can satisfy honestly.

### EVIDENCE — no page yet

Evidence-based, science-based, data-driven and periodisation queries are broad and may
primarily serve coaches, students and DIY readers. Avoid several overlapping articles.
A future page requires one original, well-sourced thesis and a defined reader job.

### EXECUTIVE — no indexed page

An executive identity is still a customer-research and reach hypothesis. Search language
is sparse or ambiguous with business executive coaching. Do not create an executive
fitness page merely to reinforce desired positioning.

## Existing URL governance

### `/privacy-policy/`

Keep as a legal utility page. It is not an acquisition target. Canonical and analytics
standardisation must use the approved CMS/re-scrape workflow rather than casual edits to
an exported page.

### `/work-with-me/`

The legacy page is already `noindex`; the maintained homepage and external Google
Calendar link now own conversion. Decide whether to retire/redirect it through the
exported-page workflow. Do not add it to the sitemap.

### Exported author, feed, comment-feed and 404 paths

These do not belong in the organic page map or sitemap. They should not become internal
link destinations. Technical retirement/noindex handling is a separate cleanup item,
not a reason to modify raw exports ad hoc.

### `/guides/`

Do not create a blog/archive hub for one or two articles. Add a maintained Guides page
after at least four substantive approved guides exist and can be grouped usefully.

## Internal-link model

The homepage is the commercial hub. Guides provide context and link back to it where
coaching is a legitimate next step.

- HOME → PLATEAU from the existing plateau/problem context.
- HOME → TRAVEL from future schedule/travel context.
- PLATEAU → HOME where generic fixes stop being sufficient.
- TRAVEL → HOME where recurring schedule adaptation requires coaching.
- PLATEAU ↔ TRAVEL only where disruption and stalled progression genuinely intersect.
- METHOD, if created, links to HOME and demonstrates its application through PLATEAU
  and TRAVEL examples.
- RESULTS, if created, supports relevant claims and links to HOME.

Use varied descriptive language. Do not repeat exact-match anchors site-wide. Do not add
links to conditional or held pages before they exist. See `internal-links.csv`.

## Canonical and indexation rules for every new page

Before a page enters the sitemap it must:

1. return 200 on the canonical `www` HTTPS hostname;
2. have exactly one self-referencing canonical;
3. have a unique title, description and primary heading;
4. satisfy one intent not already owned by another page;
5. contain substantive original content and visible authorship/review context;
6. avoid unsupported medical, injury-prevention or guaranteed-outcome claims;
7. include a useful route to the commercial owner without turning into a doorway page;
8. be linked from at least one relevant maintained page;
9. use production analytics without treating page views as conversions;
10. be added to `sitemap.xml` only after all checks pass.

Test pages remain `noindex`, noncanonical-to-organic content where appropriate, absent
from the sitemap and outside permanent navigation.

## Publication sequence

### Sequence A — evidence before new URLs

1. Review US result intent for HOME and PLATEAU primary queries.
2. Obtain Google Ads Basic access and volume ranges.
3. Begin JTBD interviews, especially schedule disruption, travel and plateaus.
4. Inventory permissioned proof relevant to each situation.

### Sequence B — first production brief

5. Refine HOME without changing its intent owner.
6. Produce the PLATEAU brief and expert review.
7. Publish PLATEAU only after technical and claim checks.

### Sequence C — next situation guide

8. Produce TRAVEL after confirming result intent and useful differentiation.
9. Add contextual HOME/PLATEAU/TRAVEL links as destinations become live.

### Sequence D — conditional architecture

10. Test BUSY_TEST without indexing if evidence warrants it.
11. Create METHOD only if the content exceeds the existing homepage sections.
12. Create RESULTS only when detailed permissioned cases exist.
13. Create GUIDES_HUB only after four or more approved guides exist.

## Change control

Any proposed new URL must be added to `page-map.csv` with an intent owner and
publication gate before implementation. If a new page overlaps an owner in this map,
the default decision is to expand the existing owner—not publish another page.
