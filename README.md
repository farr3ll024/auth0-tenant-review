# Tenant Lens

A portable single-page interface for comparing Auth0 tenant exports, reviewing configuration drift, and planning a migration.

## Run locally

Requires Node.js 20 or newer.

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
