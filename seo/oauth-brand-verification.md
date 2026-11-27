# Google OAuth brand-verification review packet

Prepared 27 November 2026 (Africa/Johannesburg). This is an implementation and review record, not an attestation or an application submission. No advertising delivery or spend change is authorised by this work.

## Exact branding values

Project: `calcium-market-496915-k2` (number `689968883544`). Keep the existing project and Desktop client 1.

| Google form field | Value |
| --- | --- |
| App name | `The Infinite Body` |
| User support email | `admin@theinfinitebody.com` |
| Application home page | `https://www.theinfinitebody.com/google-workspace-app/` |
| Application privacy policy link | `https://www.theinfinitebody.com/google-workspace-app/privacy/` |
| Application Terms of Service link | Leave blank; no app-specific Terms have been established. |
| Authorised domain | `theinfinitebody.com` |

The existing developer-notification contact is `david.robertson67@gmail.com`. It is distinct from the business support/authorising identity; no personal Google token was used for business reporting. Review the notification recipient before submission rather than assuming it already matches the support address. No app logo is currently configured; a logo is optional, and none was added.

## Suggested verification description

> The Infinite Body is a set of desktop scripts and AI-assisted business workflows operated by David Robertson for The Infinite Body strength-coaching business, using admin@theinfinitebody.com. Its intended user is the business operator. It reads Search Console and Google Analytics reports for website visibility and engagement, and uses Google Ads account reporting and keyword-demand research to support organic SEO content decisions. Keyword-planning API access is subject to Basic or Standard approval. The same existing OAuth client also supports operator-directed Gmail, Drive, Calendar, Contacts, Sheets, Docs, Slides, Forms and Workspace administration, including write and administrative capabilities. The public app-information and Google-data privacy pages explain these functions, storage, retention, processors and AI-assisted processing, revocation and deletion requests. There is no public sign-up flow. Advertising delivery or spend changes require separate explicit approval for the specific action.

Do not describe the entire OAuth app as read-only. The Ads `adwords` scope itself also permits management operations; read-only describes the inspected research scripts' behaviour.

## Verified implementation and account findings

- Live Cloud Console app name: **The Infinite Body**; support email: **admin@theinfinitebody.com**; audience: **Internal**. Branding and Verification centre state that verification is not required for Internal apps. This is an exemption, not an approved brand-verification result.
- At initial inspection, homepage, privacy and Terms fields and the authorised-domain list were empty. Do not assume a supplied domain was already registered in OAuth settings.
- Data access has **no declared scopes** in any category. This differs from the existing live grant. No scopes were removed or added during this work.
- The existing Desktop client matches the local business client file and project metadata. An in-memory refresh and Google's token-info response verified the existing business identity and the live scope set. Credential values were not printed or replaced.
- Existing business grant has 21 requested scopes (Google also reports the equivalent `email` identity alias). The public privacy page lists all 21 exact scope strings. It includes full Gmail and Drive access, Workspace product write scopes, six directory administration scopes, two read-only audit/usage scopes, identity, Ads, Search Console read-only and Analytics read-only. `cloud-platform` is absent from this grant; Cloud CLI credentials are separate.
- Business identity returned `siteOwner` for `sc-domain:theinfinitebody.com` from the Search Console API. Cloud IAM showed the same identity as project **Owner (legacy)** and inherited **Organisation Administrator**. This establishes the business account's association with both the domain and the Cloud project without new grants.
- Google Ads API Overview now shows **Explorer** approved, superseding the 26 November pending/Test result. Its Basic section explicitly requires completed brand verification. No Basic application was submitted.
- The Ads-specific [brand-verification guide](https://developers.google.com/google-ads/api/docs/api-policy/brand-verification) explicitly requires **External / In production**, even for internally used tools, and overrides the generic Internal exemption for this application. That audience change remains for explicit owner confirmation.
- `audit_blog_google.py` uses identity-guarded business OAuth for Search Console/Ads and a separate existing service account for GA4. Its Ads requests are reporting and historical-keyword requests, with no mutate operations. `search_console.py` can save local CSV reports. The legacy `keyword_volume.py` uses a personal token and is not the business workflow to submit as evidence.
- Existing Workspace tooling includes a Claude skill using the same business token. Reporting results have also been processed by OpenAI Codex. AI provider plan, training controls and processor-retention settings are not established by the source files; no blanket no-sharing/no-training claim is supported.
- No automatic expiry exists for local report files or the separate Cloudflare booking register. GA4 readback confirms **FOURTEEN_MONTHS** for event/user retention and reset-on-new-activity enabled. This does not set the lifetime of every aggregate, export or Google Workspace record.
- FileVault is on. The local business credential directory was tightened from 0755 to 0700, and the client JSON from 0644 to 0600; token JSON remains 0600. Contents, grants and integrations were preserved. Cloud CLI token refresh required reauthentication, so project role confirmation used the already signed-in business Cloud UI instead.

## Remaining owner decisions before submission

1. Explicitly approve any change from **Internal** to **External / In production**. Existing broad permissions must be reviewed in that expanded audience context. Do not create a replacement project or revoke existing grants to work around this.
2. Reconcile the empty Cloud Data access declaration with the actual scope list without silently dropping scopes or requesting new grants. Brand verification checks identity and public disclosures; sensitive/restricted scope verification is a separate review. Full Gmail/Drive scopes can introduce restricted-scope/security-assessment obligations when the app becomes External; Google's applicability decision is still required.
3. Confirm actual AI services, account plans, human-access/training controls and retention, and the manual deletion practice. The public disclosure states the known processing and limits. It deliberately does not make an unverified blanket compliance/no-training attestation. Google's Workspace policy requires an affirmative Limited Use statement; approve a truthful statement only after those processor controls are established. Suggested wording for owner review: “The Infinite Body's use and transfer of information received from Google APIs will adhere to the Google API Services User Data Policy, including the applicable Limited Use requirements.” This statement is **not** published or submitted as an attestation by the agent.
4. Owner to review final branding, click verification/publication controls, accept any required terms/attestations, and separately apply for Basic Ads API access. Basic approval is not scope approval or permission to run advertising. Explorer still restricts keyword-planning API methods.

No ad, campaign, delivery schedule, budget, bidding, automatically applied recommendation or Ads account setting was changed. This is not a claim about existing campaigns' delivery status; a campaign inventory was not needed for the brand-page task.

## Publication and validation

App pages are hand-maintained at `google-workspace-app/`, with shared CSS in `assets/tib-google-app.css`. Exported WordPress directories were not edited. The coaching homepage has one footer link to the app information; sales copy and existing consent behaviour are preserved. `tools/package-site.sh` explicitly copies the two HTML files into a public-only release and promotes `index-v2.html` to the deployed root index. Research, operational scripts and credentials remain excluded.

Publication IDs, final branding state and live-access results are recorded in the completion update below.

## References

- [Google authentication brand verification](https://developers.google.com/identity/verification/authentication-verification).
- [Google Ads brand verification, including Internal audience override](https://developers.google.com/google-ads/api/docs/api-policy/brand-verification).
- [Ads access levels and planning restrictions](https://developers.google.com/google-ads/api/docs/api-policy/access-levels).
- [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy).
- [Workspace data policy and Limited Use](https://developers.google.com/workspace/workspace-api-user-data-developer-policy).
