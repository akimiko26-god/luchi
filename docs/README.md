# ЛУЧИ — Documentation Index

**Версия:** 1.0.0  
**Дата:** 2026-08-07  
**Статус:** Phase 0 Complete — Ready for Implementation  

---

## Project Overview

**ЛУЧИ** — enterprise social platform where value is measured by verified good deeds, not likes. Internal currency "Rays" (Лучи) uses double-entry ledger with bank-grade security.

---

## Documentation Map

### Vision & Scope

| Document | Description |
|----------|-------------|
| [VISION.md](./VISION.md) | Product vision, USP, long-term goals |
| [MISSION.md](./MISSION.md) | Mission, strategic goals, value model |
| [PROJECT_SCOPE.md](./PROJECT_SCOPE.md) | MVP scope, user stories, acceptance criteria |
| [ROADMAP.md](./ROADMAP.md) | Sprint plan, phases, timeline |

### Architecture

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Clean Architecture, domains, events, tech stack |
| [DATABASE.md](./DATABASE.md) | Full schema, ER diagrams, ledger design |
| [API.md](./API.md) | REST API specification, all endpoints |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Infrastructure, CI/CD, monitoring |

### Security & Access

| Document | Description |
|----------|-------------|
| [SECURITY.md](./SECURITY.md) | OWASP, encryption, audit, incident response |
| [AUTH.md](./AUTH.md) | JWT, refresh rotation, sessions, OAuth |
| [RBAC.md](./RBAC.md) | 12 roles, 80+ permissions, matrix |

### Core Modules

| Document | Description |
|----------|-------------|
| [REWARD_ENGINE.md](./REWARD_ENGINE.md) | Double-entry ledger, Rays currency |
| [SOCIAL_NETWORK.md](./SOCIAL_NETWORK.md) | Posts, comments, friends, feed |
| [CHAT.md](./CHAT.md) | Direct/group messaging, WebSocket |
| [STORE.md](./STORE.md) | Marketplace, orders, refunds |
| [MODERATION.md](./MODERATION.md) | Review queue, reports, bans |
| [ANTI_FRAUD.md](./ANTI_FRAUD.md) | Fraud detection, risk scoring |
| [MEDIA.md](./MEDIA.md) | Upload, storage, pHash |
| [SEARCH.md](./SEARCH.md) | Full-text search |
| [NOTIFICATIONS.md](./NOTIFICATIONS.md) | In-app, email, push |
| [ANALYTICS.md](./ANALYTICS.md) | Metrics, dashboards |
| [AI.md](./AI.md) | AI-assisted moderation, ML |

### UI & Admin

| Document | Description |
|----------|-------------|
| [UI_SYSTEM.md](./UI_SYSTEM.md) | Design system, colors, components |
| [ADMIN_PANEL.md](./ADMIN_PANEL.md) | Admin panel features, sections |

### Development

| Document | Description |
|----------|-------------|
| [TESTING.md](./TESTING.md) | Testing strategy, coverage, CI |
| [CODING_STANDARDS.md](./CODING_STANDARDS.md) | TypeScript, patterns, conventions |
| [CURSOR_RULES.md](./CURSOR_RULES.md) | AI assistant rules for development |

---

## Implementation Order

```
Phase 0: Documentation ✅ COMPLETE
    ↓
Phase 1 Sprint 0: Infrastructure (monorepo, Docker, CI)
    ↓
Phase 1 Sprint 1: IAM + Auth
    ↓
Phase 1 Sprint 2: Ledger Engine ⚠️ CRITICAL
    ↓
Phase 1 Sprint 3: Good Deeds + Reward integration
    ↓
Phase 1 Sprint 4: Social Core
    ↓
Phase 1 Sprint 5: Store + Moderation + Media
    ↓
Phase 1 Sprint 6: Admin + Anti-Fraud + Notifications
    ↓
Phase 1 Sprint 7: UI Polish + Demo Seed
    ↓
Phase 1 Sprint 8: Testing + Launch
```

---

## Key Architectural Decisions

1. **Modular Monolith** → Microservices when needed
2. **Double-Entry Ledger** — balance never stored as number
3. **Event-Driven** — domain events for cross-module communication
4. **Permission-Based RBAC** — 12 roles, 80+ permissions
5. **Bank-Grade Security** — OWASP Top 10, Argon2id, JWT rotation
6. **PostgreSQL** — primary store with domain schemas
7. **NestJS + Next.js** — TypeScript full-stack monorepo

---

## Demo Database Targets

| Entity | Count |
|--------|-------|
| Users | ≥ 500 |
| Posts | ≥ 2,000 |
| Comments | ≥ 10,000 |
| Organizations | ≥ 50 |
| Events | ≥ 150 |
| Tasks | ≥ 150 |
| Store items | ≥ 100 |
| Ledger entries | ≥ 100,000 |

---

*Phase 0 documentation is complete. Proceed to Phase 1 Sprint 0: Infrastructure.*
