# Rede Colmeia

Rede Colmeia is a decentralized mutual-aid platform where recurring contributions are transformed into basic food baskets distributed through local partners.

## Repository Layout

- `apps/api` -> Go backend (modular monolith baseline)
- `apps/web` -> React frontend
- `packages/contracts` -> cross-app contracts (planned usage)
- `docs/` -> product, technical, operational, ADR, and agent documentation

## Quick Start

### API

```bash
cd apps/api
go test ./...
AUTH_CREDENTIALS=admin:admin@redecolmeia.dev:admin-pass,contributor:contributor@redecolmeia.dev:contributor-pass,partner:partner@redecolmeia.dev:partner-pass go run ./cmd/server
# optional Turso remote DB:
# DATABASE_URL=libsql://<your-db>.turso.io DATABASE_AUTH_TOKEN=<token> AUTH_CREDENTIALS=admin:admin@redecolmeia.dev:admin-pass go run ./cmd/server
```

Shortcut script (loads DB credentials from `scripts/credentials.<env>.env`):

```bash
# first time setup:
cp scripts/credentials.dev.env.example scripts/credentials.dev.env
cp scripts/credentials.stag.env.example scripts/credentials.stag.env
cp scripts/credentials.prod.env.example scripts/credentials.prod.env

./scripts/run-api.sh dev
./scripts/run-api.sh stag
./scripts/run-api.sh prod
```

### Web

```bash
cd apps/web
npm install
npm run lint
npm run test -- --run
npm run build
npm run dev
```
