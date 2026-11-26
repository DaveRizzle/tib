# Canonical hostname redirect

Cloudflare Worker route for the non-`www` production hostname. Every request to
`https://theinfinitebody.com/*` receives one permanent `301` redirect to the same
path and query string at `https://www.theinfinitebody.com/*`.

The route matches only the apex hostname. It does not intercept the canonical `www`
host, Pages preview domains, `app`, or `staging`.

Deploy from this directory while authenticated to Cloudflare account
`09dfe272fc0ceb9c2a545b1f624c9c0b`:

```sh
npx wrangler@4.158.0 deploy --config wrangler.jsonc
```

After deployment, test the root, a nested path, query preservation, and a canonical
`www` URL. A failed canonical-host request must not be mistaken for a redirect test.
