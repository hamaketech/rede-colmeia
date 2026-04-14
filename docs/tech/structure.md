# 🐝 Colmeia Network — Technical Architecture (Base)

---

# 1. 🎯 Objective

Define a simple, high-performance, and scalable architecture from the start using:

- Golang (backend)
- React + shadcn/ui (frontend)
- Turso (database)
- Render (infrastructure)

Focus: clarity, speed, and long-term scalability without early complexity.

---

# 2. 🧱 System Overview

Initial architecture:

- 1 backend service (Golang)
- 1 frontend application (React)
- 1 database (Turso)

Model:

→ Modular monolith (backend)  
→ Decoupled frontend

---

# 3. 📦 Repository Structure

Recommended monorepo:

/colmeia
/apps
/api (Golang backend)
/web (React frontend)
/packages
/ui (shared UI components - optional)
/types (shared schemas/types - optional)


---

# 4. ⚙️ Backend — Golang

## Principles

- Simplicity over complexity
- Explicit code over magic
- Low coupling
- High readability
- Minimal abstractions

---

## Internal Structure

/api
/cmd
/server
main.go

/internal
/modules
/auth
/users
/partners
/beneficiaries
/finance
/logistics

/database
/http
/config
/pkg
(reusable utilities)


---

## Core Modules

### Auth
- authentication
- authorization

### Users
- subscribers
- account management

### Partners
- local partners
- regions
- distribution capacity

### Beneficiaries
- registration
- validation

### Finance
- funds tracking
- basket calculation

### Logistics
- distribution flow
- delivery tracking

---

## Module Pattern

/module
handler.go
service.go
repository.go
model.go


---

## Internal Communication

- Service layer = source of truth
- Handlers orchestrate only
- Repositories isolated

---

# 5. 🗄️ Database — Turso

## Model

- Distributed SQLite (libSQL)
- Edge-friendly
- Cost-efficient

---

## Principles

- Simple schema
- Explicit queries
- Avoid heavy ORM abstraction

---

## Core Tables

- users
- subscriptions
- partners
- beneficiaries
- distributions
- transactions

---

## Best Practices

- versioned migrations
- indexes on critical queries
- avoid early complex joins

---

# 6. 🌐 Frontend — React + shadcn/ui

## Stack

- React
- shadcn/ui
- preset: `--preset b3RGQONEe`

---

## Structure

/web
/app
/components
/features
/auth
/dashboard
/partners
/transparency
/lib
/hooks


---

## Feature-Based Organization

Prefer:

/features/partners
/components
/hooks
/services


Avoid type-based structure.

---

## UI/UX Principles

- Modular interface
- Reusable components
- Clear visual hierarchy
- Strong feedback states

---

# 7. 🎨 Design System

## Foundation

- Built on shadcn/ui
- Customized with Colmeia identity

---

## Color Tokens

- primary → #F2B705 (honey yellow)
- background → #0D0D0D (deep black)
- surface → #F5E9D0 (warm off-white)
- secondary → #3A5A40 (moss green)
- accent → #D96C06 (burnt orange)

---

## Rules

- High contrast
- Controlled use of yellow
- Clear hierarchy

---

## Core Components

- Button
- Card
- Badge
- Table
- Modal
- Toast
- Input

---

# 8. 🚀 Infrastructure — Render

## Setup

- 1 backend service (Go)
- 1 frontend service (React build)
- Turso database connection

---

## Deployment

- Git-based deploys
- Automatic on push

---

## Environments

- production
- staging (optional)

---

## Requirements

- well-defined environment variables
- accessible logs
- automatic restarts

---

# 9. 🔐 Configuration

## Required Environment Variables

- DATABASE_URL (Turso)
- AUTH_SECRET
- ENV (dev / production)

---

# 10. 📡 API Design

## Principles

- Simple REST
- Predictable
- Consistent

---

## Endpoints

- `/users`
- `/partners`
- `/beneficiaries`
- `/distributions`
- `/finance`

---

## Conventions

- GET → read
- POST → create
- PUT/PATCH → update
- DELETE → remove

---

# 11. 🔄 Scalability (Future)

When needed:

- split services
- introduce queues
- add caching layer

---

## Potential Future Services

- payments
- notifications
- reporting

---

# 12. ⚠️ Avoid Early

- microservices
- kubernetes
- complex event-driven systems
- unnecessary abstractions

---

# 13. 🧭 Build Philosophy

- Fast to build
- Easy to deploy
- Easy to debug
- Continuous evolution

---

# 14. ✅ Final Definition

Colmeia Network architecture should be:

- simple to operate
- fast to evolve
- cost-efficient
- ready to scale

Without sacrificing clarity or performance.

---