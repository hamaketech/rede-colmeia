# ADR 0001: Initial Architecture Baseline

- Status: accepted
- Date: 2026-04-13

## Context

Rede Colmeia starts as a new project with clear product goals and initial technical direction in existing docs. The project needs a low-complexity architecture that supports quick delivery, high clarity, and future evolution.

## Decision

Adopt a monorepo structure with:

- `apps/api` for Go backend (modular monolith)
- `apps/web` for React frontend
- `packages/contracts` for cross-app contracts
- `docs/` as single source of truth for technical, product, and operational decisions

Use Turso/libSQL as operational datastore. Start with REST APIs and avoid premature service splitting.

## Consequences

### Positive

- Fast onboarding and clear folder ownership.
- Consistent cross-layer changes in one repository.
- Reduced operational overhead at MVP stage.

### Negative

- Single repository may grow quickly and need stricter boundaries.
- Future service extraction will require planned refactoring.

## Alternatives Considered

1. Separate repositories for API and Web.
   - Rejected due to increased coordination overhead for early phase.
2. Microservices from day one.
   - Rejected due to unnecessary complexity for current scope.
