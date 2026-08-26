# ЛУЧИ — Agent Instructions

Before writing any code, read the relevant documentation in `/docs/`.

## Priority reading order

1. [ARCHITECTURE.md](./docs/ARCHITECTURE.md) — system structure
2. Module-specific doc (e.g. [REWARD_ENGINE.md](./docs/REWARD_ENGINE.md))
3. [DATABASE.md](./docs/DATABASE.md) — schema
4. [API.md](./docs/API.md) — endpoints
5. [CODING_STANDARDS.md](./docs/CODING_STANDARDS.md) — conventions

## Critical rules

- Never store Rays balance as a number — always use double-entry ledger
- Never put business logic in controllers or UI components
- Never use `any` or `console.log`
- Every module: domain → application → infrastructure → presentation
- Read docs before implementing any feature

## Project structure

```
apps/api/     — NestJS modular monolith
apps/web/     — Next.js user app
apps/admin/   — Next.js admin panel
packages/ui/  — Design system
docs/         — Full architecture documentation
```

See [docs/README.md](./docs/README.md) for the complete documentation index.
