#!/usr/bin/env python3
"""Score and consolidate Task 9 candidates without pretending unknown volume is zero.

The score is a strategic-fit score, not a demand forecast. Volume, Search Console and
first-party interview evidence remain explicit gates before permanent page production.
"""
import csv
from pathlib import Path

BASE = Path(__file__).resolve().parent

GROUPS = {
    'core_service': {
        'stage': 'P1', 'action': 'optimize_existing_homepage_avoid_cannibalization',
        'working_url': '/',
        'primary': 'online strength coaching',
        'queries': {
            'online strength coach', 'online strength coaching',
            'online strength training coaching', 'remote strength coach',
            'remote strength coaching', 'online strength trainer',
            'online strength and conditioning coach',
            'personalized strength training program', 'custom strength program'},
    },
    'busy_schedule': {
        'stage': 'P2', 'action': 'validate_message_before_indexing',
        'working_url': '/strength-training-with-a-busy-schedule/',
        'primary': 'working out with a busy schedule',
        'queries': {
            'strength coach for busy professionals',
            'workout routines for busy professionals',
            'workout program for busy people',
            'working out with a busy schedule',
            'workout program for unpredictable schedule'},
    },
    'executive_identity': {
        'stage': 'HOLD', 'action': 'no_indexed_page', 'working_url': '',
        'primary': 'executive fitness coach',
        'queries': {'online personal trainer for executives', 'executive fitness coach'},
    },
    'travel_training': {
        'stage': 'P2', 'action': 'supporting_article',
        'working_url': '/strength-training-while-traveling/',
        'primary': 'strength training while traveling',
        'queries': {
            'strength training while traveling',
            'how to do strength training while traveling',
            'weight training while traveling'},
    },
    'plateau_diagnostic': {
        'stage': 'P1', 'action': 'one_problem_guide',
        'working_url': '/strength-training-plateau/',
        'primary': 'strength training plateau',
        'queries': {
            'strength training plateau', 'breaking through strength training plateaus',
            'lifting plateau', 'break lifting plateau', 'not getting stronger',
            'not getting stronger in gym', 'keep restarting workout program'},
    },
    'intermediate_programming': {
        'stage': 'P3', 'action': 'intent_review_before_brief',
        'working_url': '/intermediate-strength-programming/',
        'primary': 'intermediate strength program',
        'queries': {'intermediate strength program', 'intermediate strength training'},
    },
    'adaptive_method': {
        'stage': 'P2', 'action': 'methodology_page_or_service_section',
        'working_url': '/method/',
        'primary': 'online strength programming',
        'queries': {
            'online strength programming', 'adaptive strength training program',
            'strength program based on maxes', 'training load management strength'},
    },
    'evidence_periodization': {
        'stage': 'P3', 'action': 'authority_content_not_niche_page',
        'working_url': '/evidence-based-strength-training/',
        'primary': 'evidence based strength training',
        'queries': {
            'data driven strength training', 'evidence based strength training',
            'science based strength training',
            'evidence based strength training program',
            'periodization strength training',
            'periodization strength training program'},
    },
}

INTENT_COMMERCIAL = {
    'commercial': 5, 'commercial_investigation': 4,
    'mixed': 2, 'informational': 2,
}
ICP_FIT = {
    'commercial_core': 4, 'busy_schedule': 5,
    'plateau_intermediate': 5, 'evidence_data': 3,
}
SERVICE_BRIDGE = {
    'commercial_core': 5, 'busy_schedule': 4,
    'plateau_intermediate': 4, 'evidence_data': 3,
}
DIFFERENTIATION = {
    'core_service': 2, 'busy_schedule': 3, 'executive_identity': 2,
    'travel_training': 3, 'plateau_diagnostic': 3,
    'intermediate_programming': 3, 'adaptive_method': 3,
    'evidence_periodization': 2,
}
AMBIGUOUS = {
    'online strength coach', 'remote strength coach', 'remote strength coaching',
    'online strength and conditioning coach', 'executive fitness coach',
    'data driven strength training', 'training load management strength',
}


def group_for(query):
    hits = [name for name, spec in GROUPS.items() if query in spec['queries']]
    if len(hits) != 1:
        raise ValueError(f'{query!r} belongs to {hits}')
    return hits[0]


def evidence_score(row):
    source = row['evidence_source']
    distinct = sum(token in source for token in
                   ('autocomplete', 'competitor', 'youtube', 'first_party'))
    score = 1 + min(distinct, 3)
    if row['autocomplete_exact'] == 'true':
        score += 1
    return min(score, 5)


def intent_score(row, group):
    if group == 'executive_identity':
        return 1
    if row['query'] in AMBIGUOUS:
        return 2
    if row['autocomplete_exact'] == 'true':
        return 4
    if int(row['autocomplete_suggestion_count']) > 0:
        return 3
    return 2


def commercial_score(row, group):
    score = INTENT_COMMERCIAL[row['intent_hypothesis']]
    if row['intent_hypothesis'] == 'informational' and group in {
            'busy_schedule', 'travel_training', 'plateau_diagnostic'}:
        score = 3
    if group == 'executive_identity':
        score = min(score, 2)
    return score


def confidence(row, group):
    if group == 'executive_identity' or row['autocomplete_suggestion_count'] == '0':
        return 'low'
    if row['autocomplete_exact'] == 'true' and evidence_score(row) >= 4:
        return 'medium_high'
    return 'medium'


def main():
    rows = list(csv.DictReader((BASE / 'candidates.csv').open()))
    scored = []
    for row in rows:
        group = group_for(row['query'])
        spec = GROUPS[group]
        values = {
            'commercial_relevance': commercial_score(row, group),
            'icp_fit': ICP_FIT[row['cluster']],
            'intent_clarity': intent_score(row, group),
            'evidence_quality': evidence_score(row),
            'service_bridge': SERVICE_BRIDGE[row['cluster']],
            'differentiation': DIFFERENTIATION[group],
        }
        weighted = (
            values['commercial_relevance'] * 25 + values['icp_fit'] * 20 +
            values['intent_clarity'] * 15 + values['evidence_quality'] * 15 +
            values['service_bridge'] * 15 + values['differentiation'] * 10
        ) / 5
        scored.append({
            'stage': spec['stage'], 'page_cluster': group,
            'recommended_action': spec['action'],
            'working_url': spec['working_url'], 'query': row['query'],
            'intent_hypothesis': row['intent_hypothesis'],
            **values, 'strategic_fit_score_100': round(weighted, 1),
            'confidence': confidence(row, group),
            'volume_status': row['ads_volume_status'],
            'search_console_status': row['search_console_status'],
            'decision_status': 'provisional_not_a_demand_forecast',
        })

    stage_order = {'P1': 0, 'P2': 1, 'P3': 2, 'HOLD': 3}
    scored.sort(key=lambda x: (stage_order[x['stage']], -x['strategic_fit_score_100'], x['query']))
    fields = list(scored[0])
    with (BASE / 'query-priorities.csv').open('w', newline='') as handle:
        writer = csv.DictWriter(handle, fields)
        writer.writeheader(); writer.writerows(scored)

    by_group = {}
    source_rows = {x['query']: x for x in rows}
    for name, spec in GROUPS.items():
        group_rows = [x for x in scored if x['page_cluster'] == name]
        primary_query = spec['primary']
        primary = next(x for x in group_rows if x['query'] == primary_query)
        queries = sorted(spec['queries'], key=lambda q: -next(
            x['strategic_fit_score_100'] for x in group_rows if x['query'] == q))
        by_group[name] = {
            'stage': spec['stage'], 'page_cluster': name,
            'recommended_action': spec['action'], 'working_url': spec['working_url'],
            'primary_query_hypothesis': primary['query'],
            'secondary_query_hypotheses': ' | '.join(q for q in queries if q != primary['query']),
            'average_strategic_fit_score_100': round(sum(
                x['strategic_fit_score_100'] for x in group_rows) / len(group_rows), 1),
            'query_count': len(group_rows),
            'confidence': 'low' if any(x['confidence'] == 'low' for x in group_rows) else 'medium',
            'volume_gate': 'required_before_final_priority',
            'first_party_language_gate': 'required_before_segment_claim',
        }
    clusters = sorted(by_group.values(), key=lambda x: (
        stage_order[x['stage']], -x['average_strategic_fit_score_100']))
    with (BASE / 'page-clusters.csv').open('w', newline='') as handle:
        writer = csv.DictWriter(handle, list(clusters[0]))
        writer.writeheader(); writer.writerows(clusters)

    print(f"{len(scored)} scored queries -> {BASE / 'query-priorities.csv'}")
    print(f"{len(clusters)} consolidated clusters -> {BASE / 'page-clusters.csv'}")


if __name__ == '__main__':
    main()
