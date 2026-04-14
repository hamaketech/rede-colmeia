# Rede Colmeia Engineering Standards

## Purpose

Define coding, testing, and delivery standards for all modules in Rede Colmeia.

## Core Principles

- Solve product problems first; avoid code for code's sake.
- Keep implementations simple, explicit, and easy to maintain.
- Build in small increments with clear rollback paths.
- Security and observability are default requirements.
- No feature is complete without tests and docs.

## Coding Conventions

- Prefer readable code over clever code.
- Keep functions focused on one responsibility.
- Avoid long parameter lists; use typed structs/objects.
- Favor composition over inheritance where possible.
- Use domain-aligned names (`subscription`, `distribution`, `beneficiary`, `partner`).

## API Conventions

- Use REST semantics consistently.
- Return explicit error payloads with stable shapes.
- Validate all request inputs server-side.
- Add request IDs for traceability.

## Testing Conventions

- Add or update tests for every meaningful change.
- Cover happy path, edge cases, and failure paths.
- When fixing a bug, add a regression test that fails before the fix.
- Keep tests deterministic and isolated.

## Security Baseline

- Validate and sanitize untrusted input.
- Use parameterized queries only.
- Enforce authentication and authorization for non-public endpoints.
- Never log secrets or sensitive personal data.
- Apply least privilege to service/database credentials.

## Observability Baseline

- Use structured logging with consistent fields.
- Track request context (request ID, endpoint, actor when available).
- Capture unhandled errors and key business failures in Sentry.
- Ensure logs are actionable and avoid noise.

## Delivery and Documentation

- Every change must include related docs updates under `docs/`.
- Record architecture-impacting decisions in `docs/adr/`.
- Update operational runbooks when deploy/runtime behavior changes.
- Keep docs concise, practical, and current with implementation.

## Definition of Done

A task is done only when:

1. Code is implemented and reviewed for clarity.
2. Tests are added/updated and pass.
3. Security and observability checks are considered.
4. Documentation is updated in the same change set.
