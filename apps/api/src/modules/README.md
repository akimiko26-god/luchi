# API Domain Modules

Planned bounded contexts (Sprint 1+):

| Module | Sprint | Doc |
|--------|--------|-----|
| `iam/` | Sprint 1 | docs/AUTH.md, docs/RBAC.md |
| `ledger/` | Sprint 2 | docs/REWARD_ENGINE.md |
| `good-deeds/` | Sprint 3 | docs/MISSION.md |
| `social/` | Sprint 4 | docs/SOCIAL_NETWORK.md |
| `store/` | Sprint 5 | docs/STORE.md |
| `moderation/` | Sprint 5 | docs/MODERATION.md |
| `media/` | Sprint 5 | docs/MEDIA.md |
| `anti-fraud/` | Sprint 6 | docs/ANTI_FRAUD.md |
| `notifications/` | Sprint 6 | docs/NOTIFICATIONS.md |
| `chat/` | Phase 2 | docs/CHAT.md |
| `analytics/` | Sprint 6 | docs/ANALYTICS.md |
| `search/` | Sprint 4 | docs/SEARCH.md |
| `ai/` | Phase 2 | docs/AI.md |

Each module follows Clean Architecture:

```
modules/{name}/
├── domain/
├── application/
├── infrastructure/
├── presentation/
└── {name}.module.ts
```

Currently implemented: `health/` (Sprint 0)
