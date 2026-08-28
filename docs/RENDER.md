# Деплой ЛУЧИ на Render

**Версия:** 1.0.0  
**Дата:** 2026-08-26  

Инфраструктура описана в корневом файле [`render.yaml`](../render.yaml) (Render Blueprint). После подключения репозитория Render сам создаёт PostgreSQL и три веб-сервиса.

## Что поднимается

| Сервис | Имя | Назначение |
|--------|-----|------------|
| PostgreSQL 16 | `luchi-db` | База (схемы доменов + Prisma) |
| Web | `luchi-api` | NestJS API |
| Web | `luchi-web` | Пользовательское Next.js-приложение |
| Web | `luchi-admin` | Админ-панель Next.js |

Публичные адреса будут вида `https://luchi-api-xxxx.onrender.com` (точный суффикс назначает Render).

## Как задеплоить

1. Зарегистрируйтесь на [render.com](https://render.com) и войдите через **GitHub**.
2. Дайте Render доступ к репозиторию **akimiko26-god/luchi** (если репозиторий private — в настройках GitHub Apps разрешите этот repo).
3. В Dashboard: **New → Blueprint**.
4. Выберите репозиторий `luchi`, ветку `main`, файл `render.yaml`.
5. Нажмите **Apply**. Первый деплой занимает 10–20 минут: сборка трёх сервисов, `prisma db push`, затем однократный seed.

После успеха откройте URL сервиса **luchi-web**. Демо-пароль: `DemoP@ss123!`

| Роль | Email |
|------|--------|
| Пользователь | `demo@luchi.app` |
| Администратор | `admin@luchi.app` |
| Модератор | `moderator@luchi.app` |
| Получатель помощи | `olga@luchi.app` |

Админка — URL сервиса **luchi-admin**. Swagger API: `https://<luchi-api>/api/docs`.

## Что делает Blueprint

- Секреты (`JWT_SECRET`) генерирует Render, они **не** берутся из локальных `.env`.
- `DATABASE_URL` подставляется из Postgres по внутренней сети.
- CORS и `NEXT_PUBLIC_API_URL` берутся из публичных URL соседних сервисов.
- Перед каждым деплоем API: SQL-схемы (`scripts/migrate/001_init_schemas.sql`) + `prisma db push`.
- Seed выполняется **только при первом** успешном деплое API.

## Ограничения free-тарифа

- Бесплатный Postgres **истекает через 30 дней** (потом 14 дней на апгрейд, иначе данные удаляются). Один free-Postgres на workspace.
- Бесплатные веб-сервисы **засыпают после ~15 минут** без запросов. Первый запрос после сна — холодный старт (30–60 секунд).
- Три сервиса делят лимит часов workspace. Для демо это нормально: они спят, когда никто не заходит.
- Загруженные фото/видео лежат на диске инстанса API и **пропадут** при редеплое или сне. Для продакшена нужен объектный storage.
- Сборка Next.js на 512 MB RAM может не хватить памяти. Если билд падает с OOM — поднимите web/admin до **Starter**.

## Если деплой упал

1. Логи **luchi-api** → шаг predeploy: нет ли ошибки Prisma / `DATABASE_URL`.
2. Логи **luchi-web** / **luchi-admin**: есть ли `API_ORIGIN` и прошла ли сборка Next.js.
3. Health API: `GET /api/v1/health` должен отвечать `{"status":"ok",...}`.
4. CORS: в браузере Origin веб-приложения должен совпадать с `WEB_ORIGIN` у API.

Повторный seed вручную (если первый хук не сработал):

```text
Render Dashboard → luchi-api → Shell
npm run render:seed
```

## Регион

Сервисы в **Frankfurt** — ближе к UTC+5, чем Oregon. Регион нельзя сменить после создания: только новый Blueprint.
