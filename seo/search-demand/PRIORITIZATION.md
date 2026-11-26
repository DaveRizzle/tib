# Task 10 — Search Opportunity Classification and Prioritisation

**Prepared:** 13 November 2026  
**Market:** United States  
**Status:** Provisional strategic priority; volume and first-party language gates remain

## Decision

Consolidate 38 candidate queries into eight intent clusters. Do not create 38 pages.
The current implementation order is:

1. strengthen the existing homepage as the sole commercial online-strength-coaching page;
2. prepare one comprehensive strength-plateau problem guide;
3. validate busy-schedule positioning before indexing a segment page;
4. prepare a distinct travel-strength article;
5. strengthen the method explanation without creating thin “data-driven” pages;
6. hold intermediate/evidence clusters until intent and volume are clearer;
7. do not create an executive-targeted indexed page.

## Scoring method

`query-priorities.csv` gives every candidate a transparent strategic-fit score using:

| Dimension | Weight | Meaning |
| --- | ---: | --- |
| Commercial relevance | 25% | Proximity to hiring coaching rather than browsing generally |
| ICP fit | 20% | Fit with the three provisional customer hypotheses |
| Intent clarity | 15% | Confidence that the phrase means what the proposed page assumes |
| Evidence quality | 15% | Breadth of autocomplete, competitor, category and first-party evidence |
| Service bridge | 15% | Ability to move naturally from the query to the actual coaching offer |
| Differentiation | 10% | Ability to add a distinctive mechanism/proof rather than generic copy |

Scores are directional and explicitly exclude unknown search volume. They are **not**
traffic, conversion or revenue forecasts. A high score cannot override a missing-volume,
mixed-intent or first-party-language gate.

The selected primary query for a cluster is a messaging/architecture choice, not always
the mathematically highest row. For example, `online strength coaching` is the core
category phrase even where a programme variant receives the same or higher fit score.

## Consolidated priority

### P1 — Existing homepage: commercial core

**Canonical URL:** `https://www.theinfinitebody.com/`  
**Primary query hypothesis:** `online strength coaching`  
**Supporting language:** online strength coach, remote strength coaching, online
strength trainer, personalised/custom strength programme

**Decision:** keep one commercial page. The homepage already targets online strength
coaching. Creating `/online-strength-coaching/` now would duplicate intent and risk
cannibalisation.

**Required work before copy expansion:**

- inspect US results for category, jobs and certification contamination;
- obtain volume ranges;
- preserve coaching—not low-touch programme—positioning;
- add stronger proof that load prescription and ongoing adjustment are real mechanisms;
- keep confirmed appointments as the conversion outcome.

### P1 — Strength plateau diagnostic guide

**Working URL:** `/strength-training-plateau/`  
**Primary query hypothesis:** `strength training plateau`  
**Supporting language:** not getting stronger, lifting plateau, break a lifting plateau,
restarting programmes

**Decision:** one comprehensive guide, not separate pages for every synonym.

**Search role:** problem-aware acquisition. The guide should diagnose common causes,
show what can be self-corrected, and explain when individual history and adaptive
coaching matter. It must not force every plateau into a sales pitch.

**Proof/expertise needed:** credible explanation of progression, fatigue, adherence,
exercise selection, recovery and programme fit. Avoid diagnosis or medical claims.

### P2 — Busy-schedule positioning test

**Potential permanent URL:** `/strength-training-with-a-busy-schedule/`  
**Primary query hypothesis:** `working out with a busy schedule`

**Decision:** validate the message before indexing a dedicated segment page. Use a
controlled non-indexed landing test or first-party interviews first.

The situation has stronger evidence than the “executive” label, but competitors already
use schedule-flexibility language. A winning page would need specific proof of how the
programme changes when time, equipment or recovery changes.

### P2 — Strength training while travelling

**Working URL:** `/strength-training-while-traveling/`  
**Primary query hypothesis:** `strength training while traveling`

**Decision:** distinct supporting article. Travel has a separate, coherent job-to-be-
done and clear autocomplete variants. It can support H1 without claiming all readers
are executives.

**Content requirement:** practical decisions for equipment, session priority, load
substitution and returning to normal training. Generic hotel-room exercise lists would
not differentiate the offer.

### P2 — Adaptive method

**Current destination:** homepage method/app sections; a future `/method/` page only if
there is enough substantive material  
**Primary query hypothesis:** `online strength programming`

**Decision:** explain mechanism before creating a new URL. “Adaptive,” “personalised”
and “data-driven” are competitor-standard claims. Demonstrate inputs, decisions and
client benefit rather than repeating adjectives.

Potential concepts include performance history, current maxes, schedule, equipment,
logged sets, progression trends and coach adjustments. Do not disclose proprietary or
private client data.

### P3 — Intermediate programming

**Working URL if approved:** `/intermediate-strength-programming/`  
**Primary query hypothesis:** `intermediate strength program`

**Decision:** hold for result-page and volume review. The likely intent may favour free
programmes or templates rather than coaching. It remains useful as an ICP qualifier,
but that does not automatically justify a page.

### P3 — Evidence and periodisation

**Working URL if approved:** `/evidence-based-strength-training/`  
**Primary query hypothesis:** `evidence based strength training`

**Decision:** authority content, not a niche landing page. This cluster is likely to
attract students, coaches and DIY trainees. Publish only where David can add original,
well-sourced interpretation and connect complexity to useful client decisions.

Avoid several overlapping “science-based,” “data-driven” and “periodisation” articles.
Start with one clear thesis after result-page analysis.

### HOLD — Executive identity

**Queries:** `executive fitness coach`, `online personal trainer for executives`

**Decision:** no indexed page. The former is ambiguous with business executive
coaching; the latter has no current autocomplete support. Continue using senior
professionals as an interview/reach hypothesis, not as an SEO conclusion.

Advance only if interviews, paid message tests or Search Console demonstrate distinct
pull and qualified bookings.

## Cannibalisation rules

- The homepage owns the online-strength-coaching commercial intent.
- Plateau synonyms belong to one diagnostic guide.
- Busy schedule and travel can become separate only because travel has a distinct task
  and practical content requirement.
- Data-driven, adaptive and personalised language supports the method; it does not
  justify multiple thin pages.
- Executive pages remain unindexed tests until evidence changes.
- Every future URL must have one primary intent and a reason it cannot be satisfied by
  an existing page.

## Evidence gates before briefs become publication work

| Gate | Core homepage | Plateau | Busy schedule | Travel | Method | Intermediate | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Search volume | Required | Required | Required | Required | Helpful | Required | Required |
| US result-page intent | Required | Required | Required | Required | Required | Required | Required |
| First-party customer language | Helpful | Helpful | Required | Helpful | Required | Required | Helpful |
| Relevant proof/case | Required | Helpful | Required | Helpful | Required | Required | Required |
| Distinct from existing page | Existing owner | Yes | Must prove | Yes | Must prove depth | Must prove | Must prove |

## Next actions

1. Apply for Google Ads Basic developer-token access; add volume and competition.
2. Manually inspect US result pages for the primary query of each P1/P2 cluster.
3. Begin JTBD interviews, prioritising schedule disruption, repeated plateau and failed
   template experiences.
4. Create a detailed brief for the existing homepage only after the core result-page
   intent check.
5. Create the plateau-guide brief after the same check.
6. Treat all later URLs as proposals, not an instruction to publish immediately.

## Files

- `query-priorities.csv` — all 38 scored candidates and their evidence gates.
- `page-clusters.csv` — eight consolidated intent/page decisions.
- `prioritize.py` — reproducible scoring and grouping logic.
- `candidates.csv` — Task 9 source matrix.

The scoring model can be rerun when Search Console, Ads volume and interview evidence
arrive. Changes to weights or manual cluster membership must be documented rather than
silently rewriting the outcome.
