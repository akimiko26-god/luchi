# ЛУЧИ — UI System & Design System

**Версия:** 1.0.0  
**Дата:** 2026-08-07  

---

## 1. Design Vision

ЛУЧИ — позитивная, минималистичная платформа с акцентом на добрые дела. UI должен мотивировать, а не отвлекать. Каждый элемент дизайна служит миссии: «делай добро и получай признание».

### Design Principles

| # | Principle | Application |
|---|-----------|-------------|
| 1 | Positivity | Warm colors, encouraging micro-copy, celebration animations |
| 2 | Clarity | Clean layouts, clear hierarchy, readable typography |
| 3 | Trust | Transparent data, visible verification badges, audit trails |
| 4 | Accessibility | WCAG 2.1 AA, keyboard navigation, screen reader support |
| 5 | Consistency | Unified components, spacing, colors across all apps |
| 6 | Performance | Optimized images, lazy loading, skeleton screens |

---

## 2. Color Palette

### Primary Colors

| Name | Hex | Usage |
|------|-----|-------|
| **White** | `#FFFFFF` | Backgrounds, cards |
| **Yellow (Sun)** | `#FFD93D` | Primary accent, Rays icon, CTAs, achievements |
| **Sky Blue** | `#4ECDC4` | Secondary accent, links, info states |
| **Green (Growth)** | `#6BCB77` | Success, approved deeds, positive actions |
| **Warm Gray 50** | `#FAFAFA` | Page backgrounds |
| **Warm Gray 100** | `#F5F5F5` | Card backgrounds, dividers |
| **Warm Gray 900** | `#1A1A2E` | Primary text |

### Semantic Colors

| Name | Hex | Usage |
|------|-----|-------|
| Success | `#6BCB77` | Approved, completed, success messages |
| Warning | `#FFD93D` | Pending, attention needed |
| Error | `#FF6B6B` | Rejected, errors, destructive actions |
| Info | `#4ECDC4` | Informational, tips |
| Rays Gold | `#FFB800` | Rays currency, balance, rewards |

### Gradients

```css
--gradient-sunrise: linear-gradient(135deg, #FFD93D 0%, #FF8E53 100%);
--gradient-sky: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%);
--gradient-growth: linear-gradient(135deg, #6BCB77 0%, #4ECDC4 100%);
--gradient-rays: linear-gradient(135deg, #FFD93D 0%, #FFB800 100%);
```

---

## 3. Typography

### Font Stack

```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-display: 'Inter', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Scale

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `display-xl` | 48px | 700 | 1.1 | Hero headings |
| `display-lg` | 36px | 700 | 1.2 | Page titles |
| `heading-lg` | 24px | 600 | 1.3 | Section headings |
| `heading-md` | 20px | 600 | 1.4 | Card titles |
| `heading-sm` | 16px | 600 | 1.4 | Subsection titles |
| `body-lg` | 18px | 400 | 1.6 | Lead text |
| `body-md` | 16px | 400 | 1.6 | Body text |
| `body-sm` | 14px | 400 | 1.5 | Secondary text |
| `caption` | 12px | 400 | 1.4 | Labels, timestamps |
| `overline` | 12px | 600 | 1.4 | Category labels (uppercase) |

---

## 4. Spacing System

Base unit: **4px**

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight gaps |
| `space-2` | 8px | Icon gaps, inline spacing |
| `space-3` | 12px | Compact padding |
| `space-4` | 16px | Standard padding |
| `space-5` | 20px | Medium gaps |
| `space-6` | 24px | Section spacing |
| `space-8` | 32px | Large gaps |
| `space-10` | 40px | Section margins |
| `space-12` | 48px | Page sections |
| `space-16` | 64px | Hero spacing |

---

## 5. Component Library

Shared package: `packages/ui`

### 5.1 Core Components

| Component | Variants | Usage |
|-----------|----------|-------|
| `Button` | primary, secondary, ghost, danger, rays | Actions |
| `Input` | text, email, password, search, textarea | Forms |
| `Card` | default, elevated, outlined, deed, post | Content containers |
| `Avatar` | sm, md, lg, xl + badge (level, verified) | User representation |
| `Badge` | default, success, warning, error, category | Status indicators |
| `Modal` | default, confirm, fullscreen | Dialogs |
| `Toast` | success, error, warning, info | Notifications |
| `Tabs` | underline, pills | Navigation |
| `Dropdown` | menu, select | Selection |
| `Skeleton` | text, card, avatar, post | Loading states |
| `EmptyState` | default, search, error | Empty views |
| `Pagination` | cursor-based | Lists |
| `Tooltip` | top, bottom, left, right | Hints |

### 5.2 Domain Components

| Component | Description |
|-----------|-------------|
| `RayBalance` | Rays balance display with icon and animation |
| `RayTransfer` | Transfer Rays form/modal |
| `DeedCard` | Good deed task card with category, reward, location |
| `DeedBadge` | Verified deed badge for posts |
| `SubmissionProof` | Photo gallery + GPS map for proofs |
| `PostCard` | Social post with reactions, comments |
| `ReactionBar` | Reaction picker and display |
| `UserRank` | Level + Rays rank display |
| `AchievementBadge` | Achievement icon with tooltip |
| `CategoryIcon` | Category icon with color |
| `StoreProductCard` | Product card with price in Rays |
| `NotificationItem` | Notification list item |
| `ModerationReview` | Review panel for moderators |
| `StatCard` | Dashboard statistic card |
| `ActivityChart` | Line/bar chart for analytics |

---

## 6. Iconography

**Library:** Lucide Icons (consistent, MIT license)

### Custom Icons

| Icon | Usage |
|------|-------|
| `RayIcon` | Лучи currency (custom SVG — stylized sun ray) |
| `DeedIcon` | Good deed indicator |
| `LevelIcon` | User level badge |

### Icon Sizes

| Token | Size |
|-------|------|
| `icon-sm` | 16px |
| `icon-md` | 20px |
| `icon-lg` | 24px |
| `icon-xl` | 32px |

---

## 7. Layout System

### Grid

```css
--grid-columns: 12;
--grid-gap: 24px;
--container-max: 1200px;
--container-narrow: 640px;
--container-wide: 1440px;
```

### Breakpoints

| Token | Value | Target |
|-------|-------|--------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Wide desktop |
| `2xl` | 1536px | Ultra-wide |

### App Layouts

**User App (`apps/web`):**

```
┌─────────────────────────────────────────────┐
│ Header (logo, search, notifications, avatar)│
├──────────┬──────────────────────────────────┤
│          │                                  │
│ Sidebar  │         Main Content             │
│ (nav)    │                                  │
│          │                                  │
│          │                                  │
├──────────┴──────────────────────────────────┤
│ Mobile Bottom Nav (sm only)                 │
└─────────────────────────────────────────────┘
```

**Admin App (`apps/admin`):**

```
┌─────────────────────────────────────────────┐
│ Admin Header (logo, user, logout)           │
├──────────┬──────────────────────────────────┤
│ Admin    │                                  │
│ Sidebar  │         Content Area             │
│ (full    │                                  │
│  nav)    │                                  │
└──────────┴──────────────────────────────────┘
```

---

## 8. Key Pages — User App

### 8.1 Feed (Home)

```
┌─────────────────────────────────────────┐
│ 🌟 Create Post                          │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ @user · 2h · 🌿 Экология            │ │
│ │ Сегодня посадила 10 деревьев! 🌳   │ │
│ │ [Photo Grid]                        │ │
│ │ ✨ Deed Verified · +35 Rays         │ │
│ │ 🤝 24  💬 8  ✨ 12                 │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ @org · 5h · 🤝 Социальная помощь    │ │
│ │ ...                                 │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 8.2 Good Deeds

```
┌─────────────────────────────────────────┐
│ Good Deeds                    [Filter ▾]│
├─────────────────────────────────────────┤
│ [🌿 Ecology] [🤝 Social] [📚 Education]│
├─────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐      │
│ │ 🌿 Уборка    │ │ 🤝 Помощь    │      │
│ │ парка        │ │ пожилым      │      │
│ │ ☀ 20-50 Rays│ │ ☀ 15-80 Rays│      │
│ │ 📍 Москва    │ │ 📍 Москва    │      │
│ │ [Join Task]  │ │ [Join Task]  │      │
│ └──────────────┘ └──────────────┘      │
└─────────────────────────────────────────┘
```

### 8.3 Profile

```
┌─────────────────────────────────────────┐
│        [Avatar]                          │
│     @username · Level 5                  │
│     ☀ 340 Rays · Rank #142              │
│     "Люблю помогать!"                    │
├─────────────────────────────────────────┤
│ 23 Deeds · 45 Friends · 120 Followers   │
├─────────────────────────────────────────┤
│ [Posts] [Deeds] [Achievements]          │
│ ...content...                            │
└─────────────────────────────────────────┘
```

### 8.4 Store

```
┌─────────────────────────────────────────┐
│ Store               Your balance: ☀ 340 │
├─────────────────────────────────────────┤
│ [All] [Electronics] [Books] [Eco]      │
├─────────────────────────────────────────┤
│ ┌────────────┐ ┌────────────┐          │
│ │ [Product]  │ │ [Product]  │          │
│ │ Name       │ │ Name       │          │
│ │ ☀ 150 Rays │ │ ☀ 80 Rays  │          │
│ │ [Buy]      │ │ [Buy]      │          │
│ └────────────┘ └────────────┘          │
└─────────────────────────────────────────┘
```

---

## 9. Motion & Animation

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| Fade in | 200ms | ease-out | Content appear |
| Slide up | 300ms | ease-out | Modal, toast |
| Scale | 200ms | spring | Button press |
| Ray earn | 800ms | ease-out | Rays credited celebration |
| Level up | 1200ms | spring | Level up animation |
| Skeleton pulse | 1500ms | ease-in-out | Loading state |

### Ray Earn Animation

```
1. Rays number counts up (odometer effect)
2. Golden particles burst from balance
3. Toast: "You earned 35 Rays! ✨"
4. Optional: confetti for milestone rewards
```

---

## 10. Accessibility (WCAG 2.1 AA)

| Requirement | Implementation |
|-------------|---------------|
| Color contrast | 4.5:1 minimum for text |
| Focus indicators | Visible focus ring on all interactive elements |
| Keyboard navigation | Full tab order, skip links |
| Screen readers | ARIA labels, roles, live regions |
| Motion | `prefers-reduced-motion` respected |
| Images | Alt text required |
| Forms | Labels, error messages linked to fields |
| Language | `lang="ru"` on html element |

---

## 11. Dark Mode (Phase 2)

CSS variables prepared for dark mode toggle:

```css
[data-theme="dark"] {
  --color-bg-primary: #1A1A2E;
  --color-bg-secondary: #16213E;
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #A0A0B0;
  /* Yellow, Blue, Green remain similar with adjusted saturation */
}
```

---

## 12. Package Structure

```
packages/ui/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.stories.tsx
│   │   │   └── Button.test.tsx
│   │   ├── Input/
│   │   ├── Card/
│   │   ├── Avatar/
│   │   ├── RayBalance/
│   │   ├── DeedCard/
│   │   ├── PostCard/
│   │   └── ...
│   ├── tokens/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── shadows.ts
│   ├── hooks/
│   │   └── useTheme.ts
│   ├── utils/
│   │   └── cn.ts                  # clsx + tailwind-merge
│   └── index.ts
├── tailwind.config.ts             # Shared Tailwind config
├── package.json
└── tsconfig.json
```

---

## 13. Technology

| Tool | Purpose |
|------|---------|
| Tailwind CSS | Utility-first styling |
| CSS Variables | Theming tokens |
| Radix UI | Accessible primitives (Dialog, Dropdown, Tabs) |
| Framer Motion | Animations |
| Lucide Icons | Icon library |
| Storybook | Component documentation |

---

## 14. Business Rules

1. All UI components in `packages/ui` — no duplicate components in apps
2. Apps import from `@luchi/ui` only
3. No business logic in UI components
4. All colors via CSS variables / Tailwind tokens — no hardcoded hex in components
5. Responsive: mobile-first approach
6. Russian language primary, i18n-ready structure

---

## 15. Связанные документы

- [ADMIN_PANEL.md](./ADMIN_PANEL.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [CODING_STANDARDS.md](./CODING_STANDARDS.md)
