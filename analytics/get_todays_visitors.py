#!/usr/bin/env python3
"""Compatibility entry point for the read-only GA4 today command."""
from ga4 import main

if __name__ == '__main__':
    raise SystemExit(main('today'))
