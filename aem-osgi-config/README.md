# AEM OSGi configuration — Shared Header & Footer

This folder contains AEM Publish-tier OSGi configuration referenced by
`Shared_Header_Footer_Technical_Design.docx` (Section 8 — CORS).

> These files **do not belong in the EDS repo**. They are kept here as ready-to-copy
> reference content. They must be deployed via the **AEM Sites Maven project** that
> backs the AEM Author/Publish instance at `*-p153424-e1601770.adobeaemcloud.com`.

## Contents

| File | Purpose |
| --- | --- |
| `config.publish/com.adobe.granite.cors.impl.CORSPolicyImpl~shared-graphql.cfg.json` | Allows the EDS origin(s) to read `/graphql/execute.json/shared/*` from AEM Publish. Fixes the CORS error the `header-logo` block currently reports. |

## Where to deploy

Copy the file into the AEM Sites project, under your app's `ui.config` module, e.g.:

```
ui.config/
  src/main/content/jcr_root/apps/<your-project>/osgiconfig/
    config.publish/
      com.adobe.granite.cors.impl.CORSPolicyImpl~shared-graphql.cfg.json
```

Commit, then run a Cloud Manager pipeline. After the pipeline succeeds, AEM Publish
will start returning `Access-Control-Allow-Origin` for the configured origins.

## Customisation (before deploying)

Edit `alloworigin` in the `.cfg.json` and replace the placeholders:

| Placeholder | What to put |
| --- | --- |
| `<repo>` | The GitHub repository name backing this EDS site (e.g. `aem-boilerplate-xcom`) |
| `<owner>` | The GitHub owner / org (e.g. `hlxsites` for Adobe Helix-hosted projects, or your company org) |
| `<your-domain>.com` | Production custom domain. Remove the entry entirely if no custom domain yet. |

`alloworiginregexp` already covers:
- any `main--*--*.aem.page` / `.aem.live` (preview + live)
- any `main--*--*.hlx.page` / `.hlx.live` (legacy Helix URLs)
- `http://localhost[:port]` and `http://127.0.0.1[:port]` for `aem up` local dev

So during the POC phase you can leave `alloworigin` mostly empty and rely on the
regex list. For production rollout, populate `alloworigin` with the explicit
brand domain(s).

## Verification

After the pipeline succeeds, run from PowerShell:

```powershell
curl.exe -i `
  -H "Origin: http://localhost:3000" `
  "https://publish-p153424-e1601770.adobeaemcloud.com/graphql/execute.json/shared/Header"
```

You should now see in the response headers:

```
access-control-allow-origin: http://localhost:3000
vary: Origin
```

Reload the EDS page that hosts the `header-logo` block — the dev-only red CORS
error badge will disappear and the logo will render.

## Note on property names in the architect's design doc

`Shared_Header_Footer_Technical_Design.docx` Section 8 lists the properties as
`allowedheaders` and `allowedmethods`. The actual `com.adobe.granite.cors.impl.CORSPolicyImpl`
factory in AEMaaCS reads them as **`supportedheaders`** and **`supportedmethods`**
(see Adobe's "Cross-Origin Resource Sharing (CORS)" documentation under AEMaaCS
Security). This file uses the AEM-recognised names so the config will be picked up.

Consider amending the design doc to use the AEM-spec property names to prevent
future copy-paste deployments from silently failing.

## Why this isn't fixable from the EDS repo

EDS runs on a separate CDN and only serves static content + your block JS. The
GraphQL request from the browser goes **directly** to `publish-p153424-...adobeaemcloud.com`,
so the `Access-Control-Allow-Origin` header has to be emitted by the AEM Publish
tier. There is no way to inject the header from the EDS side; any "fix" in the
EDS code can only mask the problem (e.g. via a proxy worker — Section 12 Q4 in
the design doc — which the architect has flagged as optional and only required
for auth/CSP scenarios).
