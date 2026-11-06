#!/usr/bin/env python3
"""Authenticated status, manual sync and non-collecting GA4 validation."""
import argparse
import json
import os
from pathlib import Path
import sys
import requests

URL = 'https://tib-booking-conversions.david-robertson67.workers.dev'

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=['status', 'run', 'validate'])
    args = parser.parse_args()
    try:
        token = os.environ.get('TIB_BOOKING_ADMIN_TOKEN')
        if not token:
            token = Path(__file__).with_name('.admin-token').read_text().strip()
        response = requests.request('GET' if args.command == 'status' else 'POST',
            URL + '/' + args.command, headers={'Authorization': 'Bearer ' + token}, timeout=150)
        response.raise_for_status()
        print(json.dumps(response.json(), indent=2))
        return 0
    except (OSError, requests.RequestException, ValueError):
        print('Worker request failed. Check the ignored admin token, network and Worker logs.', file=sys.stderr)
        return 1

if __name__ == '__main__':
    raise SystemExit(main())
