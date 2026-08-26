# ЛУЧИ

Социальная платформа, где ценность человека измеряется **подтверждёнными добрыми делами**, а не лайками. Внутренняя валюта **Лучи** учитывается через двойную бухгалтерскую запись (ledger).

## Что внутри

| Часть | Технология | Назначение |
|--------|------------|------------|
| `apps/api` | NestJS | Backend: авторизация, Лучи, дела, лента, магазин, модерация |
| `apps/web` | Next.js 14 | Пользовательское приложение |
| `apps/admin` | Next.js 14 | Админ-панель |
| `packages/ui` | React | Дизайн-система |
| `docs/` | Markdown | Архитектура и спецификации **на русском** |

## Быстрый запуск

Локальные файлы окружения уже лежат в репозитории (`.env`, `apps/api/.env`, `apps/web/.env.local`, `apps/admin/.env.local`). Это значения для **локальной разработки**, не для продакшена.

Нужны **Node.js 20+** и **PostgreSQL 16** (пользователь `luchi` / пароль `luchi_dev`, база `luchi`).

```bash
npm install
cd apps/api
npx prisma db push
npm run db:seed
cd ../..
npm run dev
```

| Приложение | Адрес |
|------------|--------|
| Веб | http://localhost:3000 |
| API | http://localhost:3001/api/v1 |
| Swagger | http://localhost:3001/api/docs |
| Админка | http://localhost:3002 |

### Демо-аккаунты

Пароль у всех: `DemoP@ss123!`

| Роль | Email |
|------|--------|
| Пользователь | `demo@luchi.app` |
| Администратор | `admin@luchi.app` |
| Модератор | `moderator@luchi.app` |
| Получатель помощи | `olga@luchi.app` |

## Документация

Полный указатель на русском: **[docs/README.md](./docs/README.md)**

- [Видение](./docs/VISION.md)
- [Архитектура](./docs/ARCHITECTURE.md)
- [База данных](./docs/DATABASE.md)
- [API](./docs/API.md)
- [Движок наград (Лучи)](./docs/REWARD_ENGINE.md)
- [Безопасность](./docs/SECURITY.md)
- [Стандарты кода](./docs/CODING_STANDARDS.md)

## Структура репозитория

```
apps/
  api/          Backend NestJS
  web/          Приложение для пользователей
  admin/        Админ-панель
packages/
  ui/           Компоненты интерфейса
  shared-types/ Общие типы TypeScript
  config/       Общие настройки ESLint и TypeScript
docs/           Документация платформы
infra/          Docker
scripts/        SQL-миграции
```

## Этапы

- **Фаза 0:** документация
- **Фаза 1:** рабочий контур — вход, лента, добрые дела, Лучи, магазин, админка

Подробный план: [docs/ROADMAP.md](./docs/ROADMAP.md)
