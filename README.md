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

- Source and target tenant summary
- Migration-readiness overview
- Searchable and filterable Auth0 object comparison
- Status and impact indicators
- Difference inspector and reviewer notes
- JSON export picker for the next integration step

The current release is a UI prototype with representative data. Tenant-export parsing and Auth0 Management API connections are not yet implemented.

## Handling tenant data safely

Real tenant exports can disclose application URLs, connection names, custom Action or Rule code, organization details, and other security-relevant configuration. Never commit production exports, credentials, client secrets, access tokens, or unredacted review files.

The repository ignores the conventional local folders `tenant-exports/`, `auth0-exports/`, and `review-data/`, along with common export filename patterns. Before sharing a new fixture, confirm that it contains only synthetic or thoroughly redacted data.

## License

Licensed under the [MIT License](LICENSE).
