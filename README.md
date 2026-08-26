# ЛУЧИ

> Социальная сеть, основанная на подтверждённых добрых делах.

## Stack

- **API:** NestJS (Modular Monolith, Clean Architecture)
- **Web:** Next.js 14 (user app)
- **Admin:** Next.js 14 (admin panel)
- **DB:** PostgreSQL 16, Redis 7, MinIO (S3)
- **Monorepo:** Turborepo + npm workspaces

## Quick Start

### 1. Prerequisites

- Node.js 20+
- Docker & Docker Compose

### 2. Install

```bash
npm install
cp .env.example .env
```

### 3. Start infrastructure

```bash
docker compose up -d
```

### 4. Initialize database schemas

```bash
# After postgres is ready
psql postgresql://luchi:luchi_dev@localhost:5432/luchi -f scripts/migrate/001_init_schemas.sql
cd apps/api && npm run db:generate && npm run db:push
```

### 5. Run development

```bash
npm run dev
```

| App | URL |
|-----|-----|
| Web | http://localhost:3000 |
| API | http://localhost:3001/api/v1 |
| API Docs | http://localhost:3001/api/docs |
| Admin | http://localhost:3002 |
| MinIO Console | http://localhost:9001 |

## Project Structure

```
apps/
  api/          NestJS backend
  web/          User-facing Next.js app
  admin/        Admin panel
packages/
  ui/           Design system
  shared-types/ Shared TypeScript types
  config/       Shared ESLint/TS configs
docs/           Architecture documentation
infra/          Docker, Terraform (Phase 2)
scripts/        Migrations, seeders
```

## Documentation

Full architecture docs: [docs/README.md](./docs/README.md)

## Development Phases

- **Phase 0:** Documentation ✅
- **Phase 1 Sprint 0:** Infrastructure ✅ (current)
- **Phase 1 Sprint 1:** IAM + Auth (next)

See [docs/ROADMAP.md](./docs/ROADMAP.md) for the full plan.
