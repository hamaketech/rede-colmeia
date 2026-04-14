# Repository Setup Baseline

## Objective

Document the initial monorepo setup for Rede Colmeia and how to run each application.

## Implemented Structure

```text
apps/
  api/
    cmd/server
    internal/
      config
      database
      http
      middleware
      modules/users
      observability
    migrations
    tests
  web/
    src/
      app
      components
      features/{auth,dashboard,partners,transparency}
      lib/api
      hooks
    tests
packages/
  contracts
  tooling
docs/
  agent
  tech
  visual-identity
  product
  ops
  adr
```

## API Baseline

- Health endpoint: `GET /health`
- Sample module endpoint: `GET /api/v1/users/ping`
- Middleware: request ID + panic recovery
- Migration scaffold: SQL file discovery and baseline schema file
- Test coverage:
  - users service unit tests
  - users repository unit test
  - health endpoint integration test

## Web Baseline

- React + Vite + TypeScript scaffold
- Router with pages for:
  - dashboard
  - partners
  - transparency
  - auth
- API client scaffold with health request
- Global error boundary
- Vitest + Testing Library harness

## Run Commands

### API

- `cd apps/api`
- `go test ./...`
- `go run ./cmd/server`

### Web

- `cd apps/web`
- `npm install`
- `npm run lint`
- `npm run test -- --run`
- `npm run build`

## Notes

- Sentry integration points are placeholders in this phase.
- Database migrations are prepared as SQL baseline; migration execution against Turso is the next step.
