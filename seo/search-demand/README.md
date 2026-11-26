# US Search-Demand Dataset — Task 9

**Captured:** 13 November 2026  
**Market:** United States  
**Status:** Provisional evidence set; candidates are not prioritised keywords  
**Related:** `../../SEO-ICP-SEGMENTATION.md`, `../../SEO-SCOPE-OF-WORK.md`

## Deliverables

- `candidates.csv` — 38 query candidates across four clusters, with intent and page-type hypotheses, source notes and explicit missing-data states.
- `google-autocomplete-us.csv` — 238 Google autocomplete rows collected with `hl=en` and `gl=us`.
- `language-evidence.csv` — short competitor/customer-language excerpts mapped to the three ICP hypotheses.
- `build.py` — reproducible autocomplete collection and candidate-matrix generator.
- `query-priorities.csv` — Task 10 strategic-fit scoring for all 38 candidates.
- `page-clusters.csv` — eight consolidated page/intent decisions.
- `prioritize.py` — reproducible scoring and consolidation logic.
- `PRIORITIZATION.md` — Task 10 decisions, gates and implementation order.
- `page-map.csv` — Task 11 machine-readable URL, intent owner and publication gate register.
- `internal-links.csv` — conditional source/destination link plan.
- `PAGE-MAP.md` — Task 11 architecture, governance and publication sequence.

## Sources combined

### First-party search evidence

Search Console property `sc-domain:theinfinitebody.com` is verified, but returned no
query rows for the 90 days ending 10 November 2026. Candidate rows therefore use
`no_query_rows_post_verification`; click and impression cells are blank, not zero.
The dataset must be enriched after the property accrues data.

### Keyword-volume evidence

Google Ads `KeywordPlanIdeaService` was tested against customer 137-278-8815 on
13 November. Every usable request was rejected because the developer token remains at
Explorer access:

> This method is not allowed for use with explorer access. Please apply for basic or
> standard access.

Accordingly, volume and competition cells are blank and carry
`blocked_explorer_developer_token`. No search-volume estimate has been invented or
copied from an unverified third-party tool. Basic-access approval remains a dependency
before Task 10 can use volume quantitatively.

### Behavioural query-language evidence

Google autocomplete was captured for every candidate in a US/English context. It is a
useful signal that a phrase or close variant occurs in query behaviour; it is **not** a
volume, conversion or ranking estimate. Thirty of the 38 candidate phrases returned as
an exact suggestion, while six returned no suggestions. Autocomplete can contain job,
certification, geography and audience modifiers that reveal mixed intent.

### Competitor and category evidence

The existing market-intelligence dataset contains 85 curated operators, including 33
direct-coaching operators and 10 US direct-coaching operators. The fetched copy corpus
contains 76 pages across 25 domains. Relevant evidence was drawn especially from
Barbell Logic, Strength System, Wenning Strength, Genacks Fitness and Wits & Weights.

The YouTube discovery set supplies category/supply-side evidence for phrases including
`online strength coaching`, `remote strength coaching`, `strength training coach`,
`evidence based lifting`, `periodization strength training` and `strength programming`.
Every YouTube seed returned the collection cap of 50 channels, so this confirms a
content/operator ecosystem—not consumer search volume.

### Customer language

`language-evidence.csv` contains short phrases from competitor pages and testimonials,
not interviews with The Infinite Body's buyers. Treat these as language hypotheses.
First-party JTBD interviews, enquiry messages and sales-call language remain required.

## Candidate-set composition

| Cluster | ICP relationship | Candidates | Role |
| --- | --- | ---: | --- |
| Commercial core | All hypotheses | 10 | Direct coach/program category language |
| Busy schedule and travel | H1 | 10 | Situation-led professional/travel problem language |
| Plateau and intermediate lifters | H2 | 10 | Problem-aware and programme-intent language |
| Evidence and data | H3 | 8 | Method/authority language and potential commercial bridges |

## Findings

### 1. The direct commercial category exists, but intent is mixed

`online strength coach`, `online strength coaching`, remote variants and personalised
programme variants all have behavioural or category evidence. Autocomplete also shows
substantial contamination from jobs, certification, women, runners and non-US geography.
The permanent service page should target coaching buyers, while Task 10 must inspect
results and exclude career/certification interpretations.

### 2. “Executive” is not yet a defensible SEO-led niche

`executive fitness coach` appears in autocomplete, but neighbouring suggestions relate
to business executive coaching. `strength coach for busy professionals` and `online
personal trainer for executives` produced no autocomplete suggestions. This does not
prove zero demand, but it means the executive identity should remain a positioning test
rather than the basis of a large indexed content cluster.

Situation-led H1 language is stronger: `strength training while traveling`, `weight
training while traveling`, `working out with a busy schedule`, and busy-professional
workout variants all surfaced. Competitors also use travel and changing schedules as
explicit purchase triggers.

### 3. H2 has the broadest problem-language evidence

Plateau, intermediate-programme and “not getting stronger” phrases all produced clear
autocomplete families. These are mostly informational or programme-seeking queries, not
proof of coaching demand. They offer a plausible content-to-service path if the content
shows when generic advice stops being enough and coaching judgement becomes valuable.

### 4. H3 is better supported as authority/method than as a standalone niche

Data-driven, evidence-based and periodisation phrases have behavioural evidence, but
likely attract coaches, students and DIY trainees as well as buyers. Competitor copy
shows that data works best when translated into interpretation, adjustment and reduced
decision load. H3 should support trust across H1/H2 unless interviews show that it
predicts purchase and retention independently.

### 5. Adaptive schedule positioning is not an uncontested claim

Barbell Logic already uses strong language around travel, changing schedules, “the week
you actually have,” and templates people fall off. Wenning Strength explicitly adjusts
for performance, schedule and equipment. The Infinite Body therefore needs proof and a
distinct mechanism—not merely the words personalised, adaptive or data-driven.

Potential differentiators to validate include:

- visible progression and load prescription through the app;
- sustained management across disrupted work/travel periods;
- coaching for experienced trainees who already understand the basics;
- decision simplicity rather than more client-side analysis.

## Data-use rules

1. Blank Search Console or Ads values mean **unknown**, never zero.
2. Autocomplete presence does not establish meaningful volume.
3. Competitor usage validates market language, not The Infinite Body's right to win.
4. YouTube channel supply does not equal Google consumer demand.
5. Do not publish one page for every row. Task 10 must consolidate by distinct intent.
6. Do not create indexed “executive” pages until search intent and message tests support them.
7. Do not use informational traffic as evidence of product-market fit.

## Dependencies and next enrichment

1. Obtain Google Ads Basic developer-token access and rerun US keyword-volume research.
2. Requery Search Console after post-verification impressions accrue.
3. Conduct the first JTBD interviews in `SEO-ICP-SEGMENTATION.md` and add exact first-party language.
4. Inspect US result pages for the leading candidates to verify intent and achievable page types.
5. Add qualified-booking and retained-client evidence as it becomes available.

## Task 10 result

Task 10 consolidates the 38 candidates into eight clusters and scores strategic fit in
`query-priorities.csv`. See `PRIORITIZATION.md` for decisions and publication gates.
The scores do not include unknown volume and are not traffic forecasts. Final demand
priority remains gated on Ads Basic access, US result-page review and first-party
customer language.
