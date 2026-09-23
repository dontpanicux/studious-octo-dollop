# Meridian Analytics — Internal BI Admin Dashboard

## Context

Building a full-featured internal BI/reporting admin panel for a fictional B2B SaaS company called **Meridian Analytics**. The dashboard is used by an internal RevOps team to monitor revenue, customers, and sales pipeline. The stack is React 19 + Vite + Tailwind CSS v4 + Supabase JS client.

The user also asked two product questions:
- **"Can I create Figma designs from what's built in Make?"** — Yes, in two ways: (1) the CSS design tokens (`--color-*` etc.) are named to map 1:1 to Figma Variables (collection → group → name), so a designer can recreate them in Figma's Local Variables panel; (2) the published Make preview can be inspected via Figma Dev Mode. There's no automatic push, but the token naming system is the bridge.
- **"Set up my code's design system to work with Figma's token system"** — Addressed via the `@theme` block in `src/index.css` with hierarchical token naming (`--color-brand-500`, `--color-surface-sidebar`, `--color-text-primary`, etc.) that maps directly to Figma Variable path conventions.

## Aesthetic Stance

**Full dark mode, precision-analytical.** Deep desaturated navy ground (`#0D1117`), elevated card surfaces (`#161C26`), electric amber accent (avoids the SaaS-blue default). All metric values rendered in `DM Mono` for data precision; UI labels and body text in `Inter`. Sharp borders (no bloated radius), tight grid layouts, Bloomberg Terminal-meets-modern-software energy.

**Fonts (Google Fonts, Vite path):**
- `Inter` — UI labels, body copy, navigation
- `DM Mono` — All KPI values, table numbers, status codes

## Supabase Requirement

Before implementation begins, the user needs to connect a Supabase project and set two env vars:
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```
The code degrades gracefully: when env vars are missing, a `<SetupScreen>` component renders instead of the dashboard, showing connection instructions.

## Packages to Install

```
pnpm add @supabase/supabase-js recharts
```

## Implementation Sequence

### 1. `src/index.css` — Design Tokens + Fonts

Google Fonts `@import` first (DM Mono + Inter), then `@import 'tailwindcss'`, then `@theme {}` block with:

```
Figma Collection: Colors/Brand      → --color-brand-{50..900}
Figma Collection: Colors/Surface    → --color-surface-{base,raised,overlay,sidebar}
Figma Collection: Colors/Border     → --color-border-{subtle,default,strong}
Figma Collection: Colors/Text       → --color-text-{primary,secondary,tertiary,inverse,brand}
Figma Collection: Colors/Status     → --color-{success,warning,danger,neutral}-{50,100,500,700}
Figma Collection: Typography        → --font-sans, --font-mono
Figma Collection: Radius            → --radius-{xs,sm,md,lg,xl,2xl,full}
Figma Collection: Shadow            → --shadow-{xs,sm,md,lg,xl}
```

Dark mode: `--color-surface-base: oklch(9% 0.015 252)` (near-black navy)  
Accent: electric amber `--color-brand-500: oklch(75% 0.18 75)` (amber, not blue)  

`@layer base` sets `html { font-family: var(--font-sans) }` and `body { background: var(--color-surface-base); color: var(--color-text-primary) }`.

### 2. `src/types/index.ts`

All TypeScript interfaces:
- `Page` = `'overview' | 'revenue' | 'customers' | 'pipeline'`
- `Customer`, `MetricsDaily`, `RevenueEvent`, `SalesDeal`, `FeatureUsage`, `KpiSummary`
- `PlanTier`, `CustomerStatus`, `EventType`, `DealStage`, `DealSource` union types

### 3. `src/lib/supabase.ts`

```ts
export const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
export function isSupabaseConfigured(): boolean
```

### 4. `src/lib/queries.ts`

Pure async functions (no React):
- `fetchKpiSummary()` — compares latest vs 30-day-ago metric row
- `fetchMrrTimeSeries(days)` — ordered by date asc
- `fetchRevenueEvents(limit, offset)`
- `fetchCustomers(opts)` — supports status/plan/search/sort filters
- `fetchPipeline()` and `fetchPipelineByStage()`

All functions catch errors and return typed empty fallbacks.

### 5. `src/lib/seed.ts`

`runSeed(supabase)` — upserts all fixture data using Supabase JS. Called from a dev-only "Seed Database" button on the SetupScreen.

**Seed data volume:**
- 63 customers (55 active, 8 churned): real company-style names, fintech/healthcare/logistics industries, 5 account managers, health scores 30–97
- 210 `metrics_daily` rows (2026-03-01 → 2026-09-21): MRR grows $62,100 → $89,240
- ~180 revenue events over 18 months
- 28 sales pipeline deals across all stages
- Feature usage rows for 8 features × active customers

Uses a simple deterministic PRNG (LCG, seed=42) for reproducible data.

### 6. `src/hooks/`

- `useKpi.ts` → `{ summary, loading, error }`
- `useMetrics.ts` → `{ data, loading, error, refetch }` (accepts `days` param)
- `useCustomers.ts` → `{ customers, loading, error, refetch }` (accepts filter object)
- `usePipeline.ts` → `{ deals, byStage, loading, error }`

All hooks bail out early when `!isSupabaseConfigured()`.

### 7. `src/components/ui/`

Seven primitives, all using `--color-*` and `--radius-*` tokens:
- `Card.tsx` — `title`, `subtitle`, `action` slot, `padding` prop
- `Badge.tsx` — `variant: success|warning|danger|neutral|brand`, `dot?` prefix
- `KpiCard.tsx` — label + large mono value + trend badge + optional sparkline + loading skeleton
- `DataTable.tsx` — generic `Column<T>[]` + sortable + loading state + empty state
- `Avatar.tsx` — deterministic color from name hash + initials
- `Skeleton.tsx` — `animate-pulse` shimmer
- `EmptyState.tsx` — inline SVG illustration + message

### 8. `src/components/layout/`

- `Shell.tsx` — `flex h-screen`: fixed dark sidebar (w-56) + right column (TopBar + scrollable main)
- `Sidebar.tsx` — amber "M" logomark + "Meridian" wordmark + 4 inline-SVG nav items + bottom user pill. Active state: amber highlight. Background: `--color-surface-sidebar` (very dark navy).
- `TopBar.tsx` — page title + date + notification bell icon + avatar. Thin bottom border.

### 9. `src/components/charts/`

All use `recharts`. Styled to match dark mode tokens.

- `SparkLine.tsx` — no axes, no grid, responsive `LineChart` (used inside KpiCard)
- `MrrChart.tsx` — `AreaChart` with gradient fill, amber line, period selector tabs (30d/90d/180d)
- `RevenueBreakdown.tsx` — stacked `BarChart`: new_mrr (success), expansion (brand), contraction (warning), churn (danger)
- `FunnelChart.tsx` — custom CSS/div funnel (no recharts Funnel), trapezoid step-down bars, stage labels + value below
- `RetentionGrid.tsx` — pure CSS grid, cells colored success→danger by retention %, no recharts

### 10. `src/pages/`

**Overview.tsx:**
```
Row 1: 6 KpiCards (grid-cols-2 → grid-cols-3 → grid-cols-6)
Row 2: MrrChart 2/3 + RecentActivityFeed 1/3 (last 10 revenue events)
Row 3: Top Customers table (5 rows) + Feature Adoption list
```

**Revenue.tsx:**
```
Row 1: Period selector tabs
Row 2: MrrChart (full width)
Row 3: RevenueBreakdown 2/3 + MRR Composition donut 1/3
Row 4: Revenue Events DataTable (paginated, 20/page)
```

**Customers.tsx:**
```
Row 1: Search + Plan filter + Status filter + Sort dropdown (filter bar)
Row 2: Customer DataTable — Company | Plan | MRR | Health | Status | Signed Up
        Row click → CustomerDetailModal (feature usage breakdown)
```

**Pipeline.tsx:**
```
Row 1: 4 KpiCards (Total / Weighted / Avg Deal Size / Open Count)
Row 2: FunnelChart (full width)
Row 3: Open Deals DataTable — Company | Stage | Value | Probability | Close Date | Owner
```

### 11. `src/App.tsx`

```tsx
const NavigationContext = createContext<{ currentPage: Page; navigate: (p: Page) => void }>()

export default function App() {
  const [currentPage, setPage] = useState<Page>('overview')
  if (!isSupabaseConfigured()) return <SetupScreen />
  return (
    <NavigationContext.Provider value={{ currentPage, navigate: setPage }}>
      <Shell>
        {currentPage === 'overview' && <Overview />}
        {/* ... */}
      </Shell>
    </NavigationContext.Provider>
  )
}
```

`SetupScreen` — full-page dark screen with amber logo, step-by-step env var instructions, and a "Seed Database" button (calls `runSeed`).

### 12. Supabase SQL Files

`supabase/migrations/001_schema.sql` — DDL for all 5 tables + RLS policies (anon SELECT on all tables for demo mode).

`supabase/seed.sql` — static INSERT statements (SQL editor friendly alternative to the JS seed).

## File List

```
src/
├── App.tsx
├── main.tsx (unchanged)
├── index.css (tokens + fonts)
├── types/index.ts
├── lib/supabase.ts, queries.ts, seed.ts
├── hooks/useKpi.ts, useMetrics.ts, useCustomers.ts, usePipeline.ts
├── components/
│   ├── layout/ Shell.tsx, Sidebar.tsx, TopBar.tsx
│   ├── charts/ SparkLine.tsx, MrrChart.tsx, RevenueBreakdown.tsx, FunnelChart.tsx, RetentionGrid.tsx
│   └── ui/ Card.tsx, Badge.tsx, KpiCard.tsx, DataTable.tsx, Avatar.tsx, Skeleton.tsx, EmptyState.tsx
└── pages/ Overview.tsx, Revenue.tsx, Customers.tsx, Pipeline.tsx
supabase/migrations/001_schema.sql
supabase/seed.sql
```

## Navigation

State-based (`useState<Page>`) via `NavigationContext`. No react-router needed — 4 pages, no URL sharing requirement.

## Figma Design Tokens Guide (for the user)

After build, to recreate the design system in Figma:
1. Open Figma → Local Variables → + Create collection named **Colors**
2. Create groups: `Brand/`, `Surface/`, `Border/`, `Text/`, `Status/Success/`, `Status/Warning/`, `Status/Danger/`
3. Each CSS token `--color-brand-500` → Figma variable `Brand/500`
4. Create collections: **Radius**, **Shadow**, **Typography** using the same pattern
5. Optionally use the **Tokens Studio** Figma plugin to import from a `tokens.json` file (can be exported from the CSS tokens)

## Verification

1. Run `figma logs` to confirm dev server is running
2. Open preview — should show SetupScreen (no Supabase yet)
3. Add Supabase env vars → should show full dashboard shell
4. Click "Seed Database" → should populate all tables
5. Navigate all 4 pages — verify KPIs load, charts render, tables paginate
6. Test filter bar on Customers page
7. Test period selector on Revenue page MrrChart
