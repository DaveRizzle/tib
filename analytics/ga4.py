#!/usr/bin/env python3
"""Read-only GA4 diagnostics. Never infer API access from client creation."""
import argparse
import json
import os
from pathlib import Path
import sys

from google.auth.transport.requests import AuthorizedSession
from google.oauth2 import service_account

PROPERTY_ID = '562594130'
MEASUREMENT_ID = 'G-GMZT51K1VM'
KEY_FILE = Path(__file__).resolve().parent.parent / 'tib-market-intel-95b303aac178.json'


class GA4:
    def __init__(self):
        self.property = 'properties/' + os.environ.get('GA4_PROPERTY_ID', PROPERTY_ID)
        credentials = service_account.Credentials.from_service_account_file(
            os.environ.get('GOOGLE_APPLICATION_CREDENTIALS', str(KEY_FILE)),
            scopes=['https://www.googleapis.com/auth/analytics.readonly'])
        self.session = AuthorizedSession(credentials)

    def request(self, path, body=None, version='v1beta', data=False):
        host = 'analyticsdata' if data else 'analyticsadmin'
        response = self.session.request(
            'POST' if body is not None else 'GET',
            f'https://{host}.googleapis.com/{version}/{path}',
            json=body, timeout=30)
        if not response.ok:
            raise RuntimeError(f'GA4 request failed ({response.status_code}): {response.text}')
        return response.json()

    def report(self, start='30daysAgo', end='yesterday', dimensions=(),
               metrics=('eventCount', 'totalUsers', 'keyEvents')):
        return self.request(self.property + ':runReport', {
            'dateRanges': [{'startDate': start, 'endDate': end}],
            'dimensions': [{'name': name} for name in dimensions],
            'metrics': [{'name': name} for name in metrics],
        }, data=True)

    def audit(self):
        prop = self.request(self.property)
        streams = self.request(self.property + '/dataStreams')
        stream_info = []
        for stream in streams.get('dataStreams', []):
            item = {'stream': stream}
            if stream['type'] == 'WEB_DATA_STREAM':
                for resource in ('enhancedMeasurementSettings', 'eventCreateRules'):
                    item[resource] = self.request(stream['name'] + '/' + resource,
                                                  version='v1alpha')
            stream_info.append(item)
        matches = [s for s in streams.get('dataStreams', [])
                   if s.get('webStreamData', {}).get('measurementId') == MEASUREMENT_ID]
        if not matches:
            raise RuntimeError(f'Property has no stream matching expected tag {MEASUREMENT_ID}')
        return {'property': prop, 'streams': stream_info,
                'keyEvents': self.request(self.property + '/keyEvents'),
                'googleAdsLinks': self.request(self.property + '/googleAdsLinks'),
                'retention': self.request(self.property + '/dataRetentionSettings'),
                'events': self.report(dimensions=('eventName',)),
                'hosts': self.report(dimensions=('hostName',),
                                     metrics=('sessions', 'screenPageViews', 'keyEvents')),
                'links': self.report(dimensions=('eventName', 'linkUrl'))}


def main(default='audit'):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', nargs='?', default=default,
                        choices=['audit', 'today', 'events', 'realtime'])
    args = parser.parse_args()
    try:
        client = GA4()
        if args.command == 'audit':
            result = client.audit()
        elif args.command == 'today':
            result = client.report('today', 'today', metrics=(
                'activeUsers', 'sessions', 'screenPageViews'))
        elif args.command == 'events':
            result = client.report(dimensions=('eventName',))
        else:
            result = client.request(client.property + ':runRealtimeReport', {
                'dimensions': [{'name': 'eventName'}],
                'metrics': [{'name': 'eventCount'}]}, data=True)
        print(json.dumps(result, indent=2))
        print('Read-only API request(s) succeeded. Empty rows do not verify event delivery.',
              file=sys.stderr)
        return 0
    except Exception as error:
        print(f'ERROR: {error}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
