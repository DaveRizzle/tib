#!/usr/bin/env python3
"""Build the provisional US search-demand candidate set and autocomplete evidence.

Autocomplete is behavioural query-language evidence, not search volume. Google Ads
KeywordPlanIdeaService remains blocked by Explorer developer-token access, and Search
Console currently has no query rows. Blank volume/click fields must not be treated as
zero demand.
"""
import csv
from datetime import datetime, timezone
import json
from pathlib import Path
import time
from urllib.parse import urlencode
from urllib.request import Request, urlopen

OUT = Path(__file__).resolve().parent
CAPTURED_AT = datetime.now(timezone.utc).replace(microsecond=0).isoformat()

# cluster, hypothesis, query, intent, likely page type, source, evidence note
CANDIDATES = [
    ("commercial_core", "all", "online strength coach", "commercial", "service_page", "youtube_seed+autocomplete", "Direct coach-seeking phrase; modifiers reveal jobs/certification intent risk."),
    ("commercial_core", "all", "online strength coaching", "commercial", "service_page", "youtube_seed+competitor", "Exact category language used by Barbell Logic and Strength System."),
    ("commercial_core", "all", "online strength training coaching", "commercial", "service_page", "autocomplete", "Autocomplete variant of online strength coaching."),
    ("commercial_core", "all", "remote strength coach", "commercial", "service_page", "youtube_seed+autocomplete", "Remote delivery synonym; check jobs contamination."),
    ("commercial_core", "all", "remote strength coaching", "commercial", "service_page", "youtube_seed", "Existing discovery seed; autocomplete is dominated by jobs and training variants."),
    ("commercial_core", "all", "online strength trainer", "commercial", "service_page", "autocomplete", "Commercial synonym surfaced by autocomplete."),
    ("commercial_core", "all", "online strength and conditioning coach", "commercial", "service_page", "autocomplete", "Commercial variant; may skew toward athletic performance or careers."),
    ("commercial_core", "all", "online strength programming", "commercial", "service_page", "competitor+icp", "Potential lower-touch/program-only intent; distinguish from coaching."),
    ("commercial_core", "all", "personalized strength training program", "commercial", "service_page", "autocomplete+competitor", "US spelling; custom-program demand but may expect a product, not coaching."),
    ("commercial_core", "all", "custom strength program", "commercial", "service_page", "autocomplete+competitor", "Short commercial phrase; likely product/program intent."),

    ("busy_schedule", "H1", "strength coach for busy professionals", "commercial", "segment_landing_test", "icp_hypothesis+competitor", "No exact autocomplete evidence yet; Barbell Logic and Genacks validate messaging use, not demand."),
    ("busy_schedule", "H1", "online personal trainer for executives", "commercial", "segment_landing_test", "icp_hypothesis", "No autocomplete evidence yet; executive language remains unvalidated."),
    ("busy_schedule", "H1", "executive fitness coach", "mixed", "segment_landing_test", "autocomplete", "Exact autocomplete phrase but strongly ambiguous with business executive coaching."),
    ("busy_schedule", "H1", "workout routines for busy professionals", "informational", "supporting_article", "autocomplete+competitor", "Exact US autocomplete phrase; likely broad/general fitness intent."),
    ("busy_schedule", "H1", "workout program for busy people", "commercial_investigation", "supporting_or_service", "autocomplete", "Autocomplete confirms natural language; programme/product intent likely."),
    ("busy_schedule", "H1", "working out with a busy schedule", "informational", "supporting_article", "autocomplete+competitor", "Problem-led language; relevant bridge into adaptive coaching."),
    ("busy_schedule", "H1", "strength training while traveling", "informational", "supporting_article", "autocomplete+competitor", "Exact autocomplete phrase and direct competitor message evidence."),
    ("busy_schedule", "H1", "how to do strength training while traveling", "informational", "supporting_article", "autocomplete", "Question variant with explicit strength intent."),
    ("busy_schedule", "H1", "weight training while traveling", "informational", "supporting_article", "autocomplete", "Synonym surfaced by autocomplete."),
    ("busy_schedule", "H1", "workout program for unpredictable schedule", "commercial_investigation", "supporting_or_service", "icp_hypothesis+competitor", "Strong JTBD fit; no autocomplete evidence yet."),

    ("plateau_intermediate", "H2", "strength training plateau", "informational", "supporting_article", "autocomplete+competitor", "Exact autocomplete phrase; Strength System uses plateau outcome language."),
    ("plateau_intermediate", "H2", "breaking through strength training plateaus", "informational", "supporting_article", "autocomplete", "Autocomplete variant with problem-solving intent."),
    ("plateau_intermediate", "H2", "lifting plateau", "informational", "supporting_article", "autocomplete", "Exact autocomplete phrase; broad enough to require intent review."),
    ("plateau_intermediate", "H2", "break lifting plateau", "informational", "supporting_article", "autocomplete", "Action-led variant surfaced by autocomplete."),
    ("plateau_intermediate", "H2", "not getting stronger", "informational", "supporting_article", "autocomplete+competitor", "Exact problem language with strong coaching bridge."),
    ("plateau_intermediate", "H2", "not getting stronger in gym", "informational", "supporting_article", "autocomplete", "Higher-context variant; still broad across training levels."),
    ("plateau_intermediate", "H2", "intermediate strength program", "commercial_investigation", "supporting_or_service", "autocomplete+icp_hypothesis", "Exact autocomplete phrase; likely template/program intent."),
    ("plateau_intermediate", "H2", "intermediate strength training", "informational", "supporting_article", "autocomplete", "Exact variant, potentially broad educational intent."),
    ("plateau_intermediate", "H2", "adaptive strength training program", "commercial_investigation", "service_page", "icp_hypothesis+competitor", "Mechanism fit; no autocomplete evidence yet."),
    ("plateau_intermediate", "H2", "keep restarting workout program", "informational", "supporting_article", "icp_hypothesis+competitor", "Excellent customer-language hypothesis; no autocomplete evidence yet."),

    ("evidence_data", "H3", "data driven strength training", "informational", "methodology_article", "autocomplete+competitor", "Exact autocomplete phrase; may attract coaches/researchers rather than buyers."),
    ("evidence_data", "H3", "evidence based strength training", "informational", "methodology_article", "youtube_seed+autocomplete", "Exact phrase with many science/program variants; broad informational intent."),
    ("evidence_data", "H3", "science based strength training", "informational", "methodology_article", "autocomplete", "Strong autocomplete synonym; informational intent."),
    ("evidence_data", "H3", "evidence based strength training program", "commercial_investigation", "methodology_or_service", "autocomplete", "Programme intent; may support method-led acquisition."),
    ("evidence_data", "H3", "periodization strength training", "informational", "methodology_article", "youtube_seed+autocomplete", "Exact phrase; aligns with visible periodised method."),
    ("evidence_data", "H3", "periodization strength training program", "commercial_investigation", "methodology_or_service", "autocomplete", "Program variant surfaced by autocomplete."),
    ("evidence_data", "H3", "strength program based on maxes", "commercial_investigation", "methodology_article", "first_party+competitor", "Matches TIB mechanism and Strength System copy; no demand evidence yet."),
    ("evidence_data", "H3", "training load management strength", "informational", "methodology_article", "icp_hypothesis", "Expertise topic; likely practitioner/research intent, not yet buyer language."),
]


def suggestions(query):
    url = 'https://suggestqueries.google.com/complete/search?' + urlencode({
        'client': 'firefox', 'hl': 'en', 'gl': 'us', 'q': query})
    request = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urlopen(request, timeout=20) as response:
        return json.load(response)[1]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    suggestion_rows = []
    by_query = {}
    for *_, query, intent, page_type, source, note in CANDIDATES:
        try:
            values = suggestions(query)
            status = 'ok'
        except Exception as error:
            values = []
            status = type(error).__name__
        by_query[query] = values
        if values:
            for position, value in enumerate(values, 1):
                suggestion_rows.append({
                    'market': 'US', 'seed': query, 'suggestion': value,
                    'position': position, 'captured_at': CAPTURED_AT})
        else:
            suggestion_rows.append({
                'market': 'US', 'seed': query, 'suggestion': '',
                'position': '', 'captured_at': CAPTURED_AT,
                'status': status})
        time.sleep(0.12)

    with (OUT / 'google-autocomplete-us.csv').open('w', newline='') as handle:
        fields = ['market', 'seed', 'suggestion', 'position', 'captured_at', 'status']
        writer = csv.DictWriter(handle, fields, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(suggestion_rows)

    with (OUT / 'candidates.csv').open('w', newline='') as handle:
        fields = [
            'market', 'cluster', 'hypothesis', 'query', 'intent_hypothesis',
            'page_type_hypothesis', 'evidence_source', 'evidence_note',
            'autocomplete_exact', 'autocomplete_suggestion_count',
            'search_console_status', 'search_console_clicks',
            'search_console_impressions', 'ads_volume_status',
            'avg_monthly_searches', 'ads_competition', 'research_state']
        writer = csv.DictWriter(handle, fields)
        writer.writeheader()
        for cluster, hypothesis, query, intent, page_type, source, note in CANDIDATES:
            values = by_query[query]
            writer.writerow({
                'market': 'US', 'cluster': cluster, 'hypothesis': hypothesis,
                'query': query, 'intent_hypothesis': intent,
                'page_type_hypothesis': page_type, 'evidence_source': source,
                'evidence_note': note,
                'autocomplete_exact': str(query.lower() in {x.lower() for x in values}).lower(),
                'autocomplete_suggestion_count': len(values),
                'search_console_status': 'no_query_rows_post_verification',
                'search_console_clicks': '', 'search_console_impressions': '',
                'ads_volume_status': 'blocked_explorer_developer_token',
                'avg_monthly_searches': '', 'ads_competition': '',
                'research_state': 'candidate_not_prioritized'})

    print(f"{len(CANDIDATES)} candidates -> {OUT / 'candidates.csv'}")
    print(f"{len(suggestion_rows)} autocomplete rows -> {OUT / 'google-autocomplete-us.csv'}")


if __name__ == '__main__':
    main()
