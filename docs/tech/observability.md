# 🐝 Colmeia Network — Observability & Debugging

---

# 1. 🎯 Objective

Provide visibility into system behavior with minimal complexity and zero cost at early stages.

Focus on:

- Error tracking
- Debugging
- Basic performance insights

---

# 2. 🧠 Observability Strategy

Instead of adopting a full monitoring stack early, the system will use a **layered approach**:

### Phase 1 (MVP)
- Error tracking → Sentry
- Logs → Render native logs
- Metrics → not required

### Phase 2 (Growth)
- Add metrics and tracing (OpenTelemetry)

### Phase 3 (Scale)
- Full observability stack (optional)

---

# 3. 🐞 Sentry — Core Tool

## Purpose

Centralized error tracking and debugging.

---

## Responsibilities

- Capture backend errors (Golang)
- Capture frontend errors (React)
- Store stack traces
- Provide context for debugging
- Track performance (basic APM)

---

## Requirements

- Must be integrated in both backend and frontend
- Must capture:
  - unhandled exceptions
  - request failures
  - critical system errors

---

## Benefits

- Zero-cost entry tier
- Fast integration
- High signal-to-noise ratio
- Reduces debugging time significantly

---

# 4. ⚙️ Backend Integration (Golang)

## Requirements

- Global error handler
- Middleware for request tracking
- Panic recovery with reporting

---

## Capture rules

The system MUST report:

- panics
- database errors
- failed business logic operations
- unexpected states

---

## Context to include

- request ID
- user ID (if available)
- partner ID (if applicable)
- endpoint name

---

# 5. 🌐 Frontend Integration (React)

## Requirements

- Global error boundary
- API error capturing
- UI crash reporting

---

## Capture rules

The system MUST report:

- runtime errors
- failed API calls (important ones)
- UI rendering crashes

---

## Context to include

- user session (if logged)
- route/page
- action performed

---

# 6. 📜 Logging Strategy

## Source

- Native logs from Render

---

## Format

Structured logs only:

{
"level": "error",
"message": "failed to create distribution",
"module": "logistics",
"timestamp": "...",
"context": {}
}


---

## Levels

- info → normal operations
- warn → unexpected but handled
- error → failure cases

---

## Rules

- No console spam
- No sensitive data
- Clear, actionable messages

---

# 7. 🔗 Error + Log Relationship

- Logs explain **what happened**
- Sentry shows **where it broke**

Both must be consistent and correlated when possible.

---

# 8. 🧩 Future Evolution (Optional)

When system grows:

## Add OpenTelemetry

- tracing
- distributed context
- performance metrics

---

## Possible future tools

- Grafana (metrics + dashboards)
- SigNoz (full observability)

---

# 9. ⚠️ What to Avoid

- Over-instrumentation early
- Logging sensitive data
- Excessive noise (too many logs)
- Complex monitoring setup before real usage

---

# 10. 🧭 Guiding Principle

Observability should:

- help debug quickly
- stay lightweight
- grow with the system

Not slow down development.

---

# 11. ✅ Final Definition

The Colmeia Network observability stack is:

- Simple
- Effective
- Low-cost
- Expandable

Built around Sentry as the core debugging tool.

---