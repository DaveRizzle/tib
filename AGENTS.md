# AGENTS.md

Static marketing site for The Infinite Body (strength coaching). Live hosting is **Cloudflare Pages** (project `tib-marketing`, wrangler account `David.robertson67@gmail.com's Account`) — the README's "GitHub Pages" claim is stale.

## Two homepages (critical)
- `index.html` — old static WordPress (Avada) export. This was the previous live version; now replaced by V2.
- `index-v2.html` — new hand-coded homepage (embedded CSS, fonts via Google, local `assets/` favicon/logos). Now live as the main site; promoted from branch `feat/new-homepage`.

## Booking link status
All live pages use Google Appointment Schedules: `https://calendar.app.google/ZyW4qWin1iDgaxhX6` (bound to the admin@theinfinitebody.com Workspace calendar; swapped from Calendly in commit `6364e2b`). The correct booking link is now implemented throughout the site.

## Don't hand-edit scraped WordPress directories
`wp-content/`, `wp-includes/`, `wp-json/`, `work-with-me/`, `privacy-policy/`, `404_not_found/`, `feed/`, `author/` are raw exports of the site at `www.theinfinitebody.com` (absolute URLs to it, ~15 MB). Content changes belong in the WordPress CMS; edits here are re-scrapes, not hand-maintained.

## Other conventions
- GA tag `G-NSJ5MNTZNF` (gtag) is present on every page.
- Changes ship as feature/chore branches merged to `main` via PRs (see `chore/swap-booking-link`, `chore/cloudflare-pages-migration`).
- Deploy: `wrangler pages deploy` targeting project `tib-marketing` (state under `.wrangler/`, which is gitignored). No build step — plain static files.