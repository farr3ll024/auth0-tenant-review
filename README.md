# Tenant Lens

A portable single-page interface for comparing Auth0 tenant exports, reviewing configuration drift, and planning a migration.

> [!IMPORTANT]
> Tenant Lens is an independent open-source project. It is not affiliated with, endorsed by, or sponsored by Auth0 or Okta. Auth0 and Okta are trademarks of their respective owners.

## Run locally

Requires Node.js 20.14.0 or newer.

```bash
git clone <your-repository-url>
cd auth0-tenant-review
npm install
npm run dev
```

Open the local URL shown by Vite. To create a production bundle, run `npm run build`; the static output is written to `dist/` and can be hosted on any static web server.

## Current capabilities

- Local import of source and target JSON exports
- Normalized comparison of applications, connections, APIs, Actions, organizations, and Rules
- Search, resource tabs, and status filters
- Impact-weighted migration-readiness score
- Difference decisions, reviewer notes, and review queue
- Downloadable JSON migration report

Tenant Lens starts empty and contains no bundled tenant data. Import files are parsed entirely in the browser and are not transmitted or persisted.

## Supported JSON shape

Each file must contain a JSON object with one or more supported collection arrays: `clients` (or `applications`), `connections`, `resourceServers` (or `resource_servers`/`apis`), `actions`, `organizations`, and `rules`. Optional top-level `tenant`, `tenant_name`, and `domain` fields improve the tenant labels. Choose the source file first and target file second.

For safer comparison, volatile IDs, timestamps, client secrets, and signing keys are excluded from normalized equality checks. Raw secret values are never rendered in the interface or included in downloaded reports.

## Handling tenant data safely

Real tenant exports can disclose application URLs, connection names, custom Action or Rule code, organization details, and other security-relevant configuration. Never commit production exports, credentials, client secrets, access tokens, or unredacted review files.

The repository ignores the conventional local folders `tenant-exports/`, `auth0-exports/`, and `review-data/`, along with common export filename patterns. Before sharing a new fixture, confirm that it contains only synthetic or thoroughly redacted data.

## License

Licensed under the [MIT License](LICENSE).
