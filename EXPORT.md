# ЛУЧИ — Export Manifest

**Дата экспорта:** 2026-08-10  
**Версия:** 0.1.0 (Phase 0 + Sprint 0 + Sprint 1 partial)

## Содержимое архива

### Документация (`/docs`) — 28 файлов
Полное проектирование: архитектура, БД, API, безопасность, RBAC, все модули, roadmap, coding standards.

### Код
- `apps/api` — NestJS API (Health + IAM/Auth Sprint 1)
- `apps/web` — Next.js пользовательское приложение
- `apps/admin` — Next.js admin panel
- `packages/ui` — Design System
- `packages/shared-types` — общие типы
- `packages/config` — ESLint/TS configs

### Инфраструктура
- `docker-compose.yml`
- `infra/docker/` — Dockerfiles
- `scripts/migrate/` — SQL миграции схем
- `.github/workflows/ci.yml`

### Конфигурация
- `.cursor/rules/luchi.mdc`
- `AGENTS.md`, `README.md`
- `.env.example` (шаблон переменных окружения)

### История чата Cursor (`/export/chat-history`)
- `LUCHI-chat-2026-08-10.jsonl` — полная переписка (JSONL, ~500 КБ)
- `LUCHI-chat-2026-08-10.md` — читаемая версия (сообщения пользователя и ассистента)
- `README.md` — описание файлов и ID чата

**ID чата:** `6fa8c378-fa6b-4cae-aaa3-4b29822c0837`

## Исключено из архива (восстанавливается)

- `node_modules/` — `npm install`
- `dist/`, `.next/` — `npm run build`
- `coverage/` — генерируется тестами

## Быстрый старт после распаковки

```powershell
cd LUCHI
copy .env.example .env
npm install
docker compose up -d
# PostgreSQL: применить scripts/migrate/001_init_schemas.sql
cd apps/api
npm run db:generate
npm run db:push
npm run db:seed
cd ../..
npm run dev
```

## Статус разработки

| Этап | Статус |
|------|--------|
| Phase 0 — Документация | ✅ Завершено |
| Sprint 0 — Infrastructure | ✅ Завершено |
| Sprint 1 — IAM + Auth | 🔶 Код написан, БД не настроена |
| Sprint 2+ | ⏸ Не начато |

## API endpoints (Sprint 1)

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`
- `GET /api/v1/health`
- `GET /api/v1/health/ready`
