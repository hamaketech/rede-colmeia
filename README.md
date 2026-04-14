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
go run ./cmd/server
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
