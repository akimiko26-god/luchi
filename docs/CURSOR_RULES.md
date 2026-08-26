# ЛУЧИ — Cursor Rules

**Версия:** 1.0.0  
**Дата:** 2026-08-07  

---

Этот документ содержит правила для AI-ассистента (Cursor) при работе над проектом ЛУЧИ.  
Скопируйте содержимое секции «Rules Content» в `.cursor/rules/luchi.mdc` при начале реализации.

---

## Rules Content

```markdown
---
description: ЛУЧИ platform development rules
globs:
  - "**/*"
alwaysApply: true
---

# ЛУЧИ — Project Rules

## Project Context

ЛУЧИ — enterprise social platform where value is measured by verified good deeds, not likes.
Internal currency "Rays" (Лучи) uses double-entry ledger. Bank-grade security required.

## Architecture Rules

1. **Clean Architecture** — strict layer separation: Domain → Application → Infrastructure → Presentation
2. **Domain-Driven Design** — bounded contexts map to modules in `apps/api/src/modules/`
3. **Dependencies point INWARD** — domain layer has zero external dependencies
4. **Event-Driven** — cross-module communication via domain events, never direct DB access across modules
5. **Repository Pattern** — all data access through repository interfaces defined in domain layer
6. **Service Layer** — business logic in application services and domain services, NEVER in controllers
7. **DTO** — data transfer objects at layer boundaries, validated with class-validator
8. **Modular Monolith** — each module self-contained, ready for microservice extraction

## Module Structure

Every domain module follows this structure:
```
modules/{name}/
├── domain/           # Entities, VOs, Events, Repository interfaces, Domain services
├── application/      # Commands, Queries, Handlers, Application services, DTOs
├── infrastructure/   # Repository implementations, External service adapters
├── presentation/     # Controllers, Guards, WebSocket gateways
└── {name}.module.ts
```

## Code Quality — STRICTLY FORBIDDEN

- `any` type — use proper types or `unknown`
- `console.log` — use structured logger (NestJS Logger)
- Magic numbers — use named constants or enums
- Code duplication — extract shared logic
- Fat controllers — controllers only route, validate, and return
- Business logic in UI — frontend only displays and collects input
- Business logic in controllers — use application services
- Secrets in code — environment variables only
- Storing user balance as a number — always compute from ledger entries
- Direct SQL in services — use repository pattern

## Naming Conventions

- Files: `kebab-case.ts` (e.g., `credit-rays.command.ts`)
- Classes: `PascalCase` (e.g., `CreditRaysHandler`)
- Interfaces: `PascalCase` without `I` prefix (e.g., `TransactionRepository`)
- Constants: `UPPER_SNAKE_CASE`
- Database: `snake_case` for tables and columns
- API endpoints: `kebab-case` URLs, `camelCase` JSON
- Events: `{Domain}{Action}Event` (e.g., `RaysCreditedEvent`)
- Commands: `{Action}{Entity}Command` (e.g., `CreditRaysCommand`)
- Queries: `Get{Entity}Query` (e.g., `GetBalanceQuery`)

## Database Rules

- PostgreSQL schemas per domain: `iam`, `social`, `deeds`, `ledger`, `store`, etc.
- UUID primary keys everywhere
- Ledger entries are APPEND-ONLY — never UPDATE or DELETE
- Balance computed from entries, never stored as mutable field
- All mutations create audit_log entries
- Migrations must be backward-compatible (expand-contract)
- Use CHECK constraints for enums, NOT NULL for required fields

## API Rules

- REST JSON API at `/api/v1/`
- RFC 7807 error format
- Cursor-based pagination
- Idempotency-Key header for ledger/store mutations
- Every endpoint protected by auth + permission guard
- OpenAPI documentation from decorators

## Security Rules

- Argon2id for passwords
- JWT RS256 access tokens (15 min) + refresh rotation
- HttpOnly, Secure, SameSite=Strict cookies for refresh
- Input validation on ALL DTOs
- Rate limiting on all endpoints
- Audit log for every user action
- RBAC permission check on every endpoint

## Testing Rules

- Unit tests co-located with source (`*.spec.ts`)
- Integration tests in `test/integration/`
- E2E tests in `test/e2e/`
- Test factories for creating test data
- No test interdependencies
- Critical modules (ledger, auth, anti-fraud): 95% coverage

## Frontend Rules

- Components from `@luchi/ui` package only
- No business logic in components — use hooks and API client
- Tailwind CSS with design tokens (no hardcoded colors)
- Mobile-first responsive design
- Russian language primary

## Git Rules

- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- One feature per branch: `feat/ledger-transfer`, `fix/auth-refresh`
- PR required for main branch
- No force push to main

## When Implementing a Module

1. Read the corresponding doc in `/docs/` FIRST
2. Start with domain layer (entities, VOs, events, repository interfaces)
3. Then application layer (commands, queries, handlers)
4. Then infrastructure (repository implementations)
5. Then presentation (controllers, guards)
6. Write unit tests alongside each layer
7. Write integration tests for API endpoints
8. Update API.md if endpoints changed

## Key Documentation

- Architecture: docs/ARCHITECTURE.md
- Database: docs/DATABASE.md
- API: docs/API.md
- Security: docs/SECURITY.md
- Auth: docs/AUTH.md
- RBAC: docs/RBAC.md
- Ledger: docs/REWARD_ENGINE.md
- Coding Standards: docs/CODING_STANDARDS.md
- Testing: docs/TESTING.md
```

---

## Usage

1. Create file `.cursor/rules/luchi.mdc` in project root
2. Copy the content from "Rules Content" section above
3. Cursor will automatically apply these rules to all files

Additionally, create `AGENTS.md` in project root referencing this documentation:

```markdown
# ЛУЧИ — Agent Instructions

Before writing any code, read the relevant documentation in `/docs/`.

Priority reading order for new features:
1. ARCHITECTURE.md — understand the system
2. Module-specific doc (e.g., REWARD_ENGINE.md)
3. DATABASE.md — understand the schema
4. API.md — understand the endpoints
5. CODING_STANDARDS.md — follow the standards

Never start coding without reading the docs first.
Never store Rays balance as a number — always use ledger.
Never put business logic in controllers or UI components.
```

---

## 2. Workflow Rules

### Before Starting Any Task

1. Read relevant `/docs/` files
2. Understand which bounded context (module) is affected
3. Check if domain events need to be emitted/consumed
4. Verify RBAC permissions needed
5. Plan test cases

### During Implementation

1. Domain layer first, then outward
2. Write tests alongside code
3. Follow existing patterns in the codebase
4. Use dependency injection (NestJS)
5. Log with structured logger, not console.log

### After Implementation

1. Run linter and fix all errors
2. Run unit tests
3. Run integration tests for changed endpoints
4. Verify audit logging works
5. Update docs if API changed

---

## 3. Prompt Templates

### New Module

```
Implement the {ModuleName} module for ЛУЧИ platform.
Read docs/{MODULE}.md, docs/ARCHITECTURE.md, and docs/DATABASE.md first.
Follow Clean Architecture with domain/application/infrastructure/presentation layers.
Include unit tests and integration tests.
Do not put business logic in controllers.
```

### New API Endpoint

```
Add endpoint {METHOD} {PATH} to the {Module} module.
Read docs/API.md for conventions and docs/RBAC.md for permissions.
Include DTO validation, permission guard, audit logging, and tests.
Return RFC 7807 errors.
```

### Bug Fix

```
Fix {description} in {module}.
Read the module docs first. Write a test that reproduces the bug, then fix it.
Ensure the fix follows CODING_STANDARDS.md.
```

---

## 4. Связанные документы

- [CODING_STANDARDS.md](./CODING_STANDARDS.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [TESTING.md](./TESTING.md)
