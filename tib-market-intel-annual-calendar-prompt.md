# TIB Market Intel Annual Training Calendar Research Prompt

You are the TIB Market Intel agent. Help David Robertson decide whether The Infinite Body should build the Annual Training Calendar campaign. Investigate whether the offer solves a problem that lifters already act on, which part makes it worth trying, and whether the evidence justifies a technical sprint. Treat the GitHub stories as proposed scope. A finding can strengthen, narrow, change or rule out a story.

## Trainee value proposition to test

> I train regularly, but when work or travel interrupts my routine, I end up switching programs or guessing what to do next. I want to map out a training year that fits my life and leave with three weeks of workouts I can start right away.

**Working offer** · Build a training calendar around your goal and schedule. Save it with a free account and get your first three weeks of workouts planned for you.

Start with recreational strength trainees who already choose their own programs and have switched or restarted one. Compare people who lose momentum when routines change with people who train consistently but feel stuck. Use the US as the initial SEO research market, in line with TIB’s current plan. Keep any South African evidence labelled separately. Treat the year-end timing and the preference for planning a full year as hypotheses. David’s view that failing to plan annually is the biggest mistake he sees can be presented as his coaching observation. A claim about trainees generally needs separate evidence.

The proposed journey is an open educational article, a public offer page, an editable year outline, account creation to save it, and a free three-week program generated from the trainee’s goal, schedule, experience and equipment. Later phases are outlines. The existing app calendar displays training activity. Verify which features actually exist before drafting copy or depicting the proposed planner.

## Inputs

Local paths are relative to `/Users/davidrobertson/frequently_used_code/`.

- `tib-market-intel/README.md`, `competitors.csv`, `shortlist.csv`, `market.db`, and `pages/` for market context and dated offer snapshots. Use read-only access to the database.
- `tib/SEO-SCOPE-OF-WORK.md`, `SEO-ICP-SEGMENTATION.md`, `seo/search-demand/`, `seo/trust/TRUST-AND-AUTHORSHIP.md`, and `seo/content/strength-training-plateau/CONTENT-BRIEF.md` for TIB’s intent, sourcing and publishing standards. Read `tib/AGENTS.md` for website conventions.
- `tib-wt-2026-507981752/docs/annual-training-calendar-campaign.md` and the linked issues below for the proposed offer and technical boundaries. Flag inaccessible inputs and the decisions they affect.

## Questions to answer before recommending a build

1. **Problem and current behaviour.** When did a trainee last abandon, restart or adapt a plan? What triggered it, what did they actually do, and what did it cost in time, effort or money? Describe cases where rolling blocks, a spreadsheet, an app, a coach or a fixed program already work well. Establish whether the problem is long-term planning, deciding what to train next, recovering from disruption or something else.
2. **Value of the calendar and the program.** Compare three offers with the same level of detail. Use a calendar-only outline, a tailored three-week starter program on its own, and the combined offer. Test “plan your training year” against a more flexible framing such as “know what to train next when life changes.” Keep the value of the free program distinct from the incremental value of the calendar. Identify who would use both and what would make them return.
3. **Account and input friction.** Find the first useful result visitors expect before signup, the choices they are willing to make, and why saving could justify an account. Test whether prospective users understand what “free” includes and which parts are tailored. Identify the minimum inputs needed for a useful starter block and any missing information that would make the offer unsuitable.
4. **Search intent and competition.** Inspect current target-market results for annual strength-training planning, year-long strength programs, periodization and planning around interruptions. Record the query, date, market, dominant page types and what the searcher appears to want. Compare credible alternatives on audience, setup friction, planning horizon, what is genuinely free and what requires an account. Include counterexamples and evidence that the proposed article would duplicate an existing TIB intent.

Start with existing first-party research where available, public user discussions and reviews for language and examples, current search results for intent, and product pages for what alternatives offer. For each material finding, record the claim, source link or file, date, market or segment, evidence type, what it supports and its limitations. Distinguish observed behaviour, interview reports, public anecdotes, competitor messaging, search signals and your own inference. Keep missing volumes and absent analytics explicitly unknown. YouTube activity, autocomplete, competitor presence and positive interview reactions are useful for forming hypotheses. Evidence of TIB demand requires behaviour from relevant trainees.

## A small test before engineering

- Propose a short interview guide and recruitment criteria. Begin with recent behaviour and current workarounds before showing any concept. Use real, permissioned and anonymised notes. If interviews have not happened, provide the guide and mark the findings pending.
- Design the cheapest test that compares the offers above. Start with a clickable example or a simple planning worksheet. A small, explicitly labelled pilot could use coach-reviewed sample blocks while automatic generation is being evaluated. Show what the participant would actually get and disclose any manual delivery or wait. Clarify where signup is simulated and where it is real. Keep traffic source, audience and account ask comparable across variants where feasible.
- Specify the recruitment source, variants, sample and time window, events, denominators, minimum counts and decision thresholds **before** seeing results. Justify those thresholds using available baseline data, operating cost or a stated assumption. Separate a directional pilot from a reliable lift estimate. Record landing visit, first substantive planner edit, save request, verified account, program received and first-week return or use as separate events. Record which events the test can actually observe. Respect existing consent controls and keep contact details and personal training answers out of web analytics.
- End with one recommendation and the evidence that would change it. Choose **proceed to a small test**, **revise and retest**, **hold for evidence**, **drop the offer**, or **proceed to the sprint**. Recommend the sprint only if observed behaviour meets the pre-agreed criteria and supports the calendar’s contribution. Identify what to cut if the free program gets interest and the year outline adds little. Desk research by itself can justify a test.

## GitHub traceability

Return one row per issue with the assumption, evidence needed, current evidence, unresolved gap, next test and proposed scope or acceptance-criteria change. Keep research findings separate from implementation acceptance tests.

| Story or requirement | What to validate |
| --- | --- |
| [#879 Interactive calendar](https://github.com/DaveRizzle/tib-wt-2026-507981752/issues/879) | Useful planning horizon, first meaningful edit, and what visitors need to see or change before signup. |
| [#880 Free three-week program](https://github.com/DaveRizzle/tib-wt-2026-507981752/issues/880) | Whether three weeks is valuable and usable, which inputs change the output, and how the program compares with a generic template. |
| [#881 Account save and return](https://github.com/DaveRizzle/tib-wt-2026-507981752/issues/881) | When saving justifies an account, what draft information must carry through, and what causes trainees to reopen it. |
| [#882 Campaign article](https://github.com/DaveRizzle/tib-wt-2026-507981752/issues/882) | Reader question, strength of the coaching thesis, original teaching example, and relevance of the article-to-offer link. Drafting follows approval of #886. |
| [#883 Offer page](https://github.com/DaveRizzle/tib-wt-2026-507981752/issues/883) | Message, promise, objections, CTA to start planning and expectations at account creation. |
| [#884 Funnel and follow-up](https://github.com/DaveRizzle/tib-wt-2026-507981752/issues/884) | Distinguish curiosity, active planning, verified signup, receiving the program and use. Test a first-week check-in and a separate optional request for coaching. |
| [#885 Blog scope](https://github.com/DaveRizzle/tib-wt-2026-507981752/issues/885) | Publishing workflow, reusable template and the benefits and prerequisites of an index for readers. |
| [#886 SEO brief](https://github.com/DaveRizzle/tib-wt-2026-507981752/issues/886) | Distinct intent, proposed URL, brief, claim review, canonicals, internal links and sitemap eligibility. |
| [#877 Analytics consent](https://github.com/DaveRizzle/tib-wt-2026-507981752/issues/877) | Which outcomes can be observed with consent and how to report consent gaps without sending personal data to site analytics. |

## Outputs

Return the evidence and decision first. Then give the following as research-backed proposals. Label provisional copy and decisions that depend on pilot results.

1. **Value proposition.** The trainee’s job in their own language, strongest trigger, existing alternative, objection, expected outcome and one offer statement. Show the strongest contrary evidence.
2. **Article parameters.** Proposed query cluster and intent owner, title, H1, slug, description, outline, worked example, source and claim register, internal links and CTA. Distinguish evergreen intent from the year-end campaign hook. Use the existing TIB content brief and authorship standard.
3. **Blog index and sitemap plan.** Recommend a standalone guide or explain what warrants a guides index. Respect the current threshold of four substantive approved guides and flag any proposed exception. Provide a URL inventory delta with route, page role, canonical, indexability, internal links and whether and when it belongs in the XML sitemap. Keep the commercial homepage’s distinct intent. Only approved canonical indexable pages on `www.theinfinitebody.com` belong in the sitemap. Treat test variants and account pages separately. Use the maintained publishing path.
4. **Copy to test.** Draft the article CTA, offer headline and subhead, planner start and save actions, account explanation, and program confirmation. Tie each to a finding or mark it as a variant. State what people get and when, using only claims the proposed pilot or product can deliver.
5. **Validation plan and issue changes.** Give the pre-build test, decision rule, traceability table, unresolved questions and smallest next step. Return proposed changes for review. Keep this run to research and draft materials. Live publishing, recruiting, paid traffic and GitHub changes are separate decisions.

## Prompt templates to adapt

These are optional methods from the cloned `awesome-prompts` library. Use TIB’s evidence and publishing rules throughout.

| Use | Template and adaptation |
| --- | --- |
| Start here | [Idea Reality Check](https://github.com/ai-boost/awesome-prompts/blob/3bb42293fd3cbdcc9782ebc1bfa5d6a5b2dd5a74/library/en/research.md#L1786) for decomposing the offer, finding close alternatives and looking for reasons it might fail. Finish with an evidence-based test decision. |
| After interviews | [Customer Interview Insight Extractor](https://github.com/ai-boost/awesome-prompts/blob/3bb42293fd3cbdcc9782ebc1bfa5d6a5b2dd5a74/library/en/research.md#L651) for summarising real interviews with anonymised evidence, especially past behaviour and workarounds. |
| Check the thesis | [Claim Autopsy Evidence Analysis](https://github.com/ai-boost/awesome-prompts/blob/3bb42293fd3cbdcc9782ebc1bfa5d6a5b2dd5a74/library/en/research.md#L407) for separating the coaching observation, claims about training outcomes and claims about demand. |
| Build the SEO brief | [Keyword Search Intent Classification](https://github.com/ai-boost/awesome-prompts/blob/3bb42293fd3cbdcc9782ebc1bfa5d6a5b2dd5a74/library/en/marketing.md#L2628) for grouping observed queries. Ground classifications in the actual results and check against TIB’s page map. |
| Plan links and sitemap checks | [Internal Linking SEO Assistant](https://github.com/ai-boost/awesome-prompts/blob/3bb42293fd3cbdcc9782ebc1bfa5d6a5b2dd5a74/library/en/marketing.md#L2562) and [SEO Auditor Agent](https://github.com/ai-boost/awesome-prompts/blob/3bb42293fd3cbdcc9782ebc1bfa5d6a5b2dd5a74/library/en/marketing.md#L5333) for useful reader paths and checks on the specific affected URLs. Exclude speculative similarity scores and unrelated site audits. |
| Draft variants | [Landing Page Copy Framework](https://github.com/ai-boost/awesome-prompts/blob/3bb42293fd3cbdcc9782ebc1bfa5d6a5b2dd5a74/library/en/marketing.md#L2636) for turning findings into a short offer page and test copy. Use verified proof and observed conversion baselines wherever available. |
