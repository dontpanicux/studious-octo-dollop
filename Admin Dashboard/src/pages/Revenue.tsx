import { useEffect, useState } from 'react'
import { useMetrics } from '../hooks/useMetrics'
import { fetchRevenueEvents } from '../lib/queries'
import { MrrChart } from '../components/charts/MrrChart'
import { RevenueBreakdown } from '../components/charts/RevenueBreakdown'
import { RetentionGrid } from '../components/charts/RetentionGrid'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { DataTable } from '../components/ui/DataTable'
import type { Column } from '../components/ui/DataTable'
import type { RevenueEvent, EventType } from '../types'

const EVENT_VARIANT: Record<EventType, 'success' | 'brand' | 'warning' | 'danger' | 'neutral'> = {
  new: 'success', expansion: 'brand', reactivation: 'brand', contraction: 'warning', churn: 'danger',
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtMrr(v: number) {
  const abs = Math.abs(v)
  return abs >= 1000 ? `$${(abs / 1000).toFixed(1)}K` : `$${abs}`
}

export function Revenue() {
  const { data: metrics } = useMetrics(180)
  const [events, setEvents] = useState<RevenueEvent[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 20

  useEffect(() => {
    setEventsLoading(true)
    fetchRevenueEvents(PAGE_SIZE, page * PAGE_SIZE).then(d => {
      setEvents(d)
      setEventsLoading(false)
    })
  }, [page])

  const columns: Column<RevenueEvent>[] = [
    {
      key: 'date',
      header: 'Date',
      render: r => <span className="font-mono text-xs text-[var(--color-text-secondary)]">{fmtDate(r.occurred_at)}</span>,
    },
    {
      key: 'customer',
      header: 'Account',
      render: r => <span className="text-xs font-medium text-[var(--color-text-primary)]">{r.customer_name}</span>,
    },
    {
      key: 'type',
      header: 'Type',
      render: r => <Badge variant={EVENT_VARIANT[r.event_type]}>{r.event_type}</Badge>,
    },
    {
      key: 'plan',
      header: 'Plan Change',
      render: r => r.plan_from && r.plan_to
        ? <span className="text-xs text-[var(--color-text-tertiary)] font-mono">{r.plan_from} → {r.plan_to}</span>
        : r.plan_to
        ? <span className="text-xs text-[var(--color-text-tertiary)] font-mono">{r.plan_to}</span>
        : <span className="text-[var(--color-text-tertiary)] text-xs">—</span>,
    },
    {
      key: 'change',
      header: 'MRR Δ',
      align: 'right',
      render: r => (
        <span className={`font-mono text-xs font-medium ${r.mrr_change >= 0 ? 'text-[var(--color-success-700)]' : 'text-[var(--color-danger-700)]'}`}>
          {r.mrr_change >= 0 ? '+' : '−'}{fmtMrr(r.mrr_change)}
        </span>
      ),
    },
    {
      key: 'newmrr',
      header: 'New MRR',
      align: 'right',
      render: r => r.new_mrr != null
        ? <span className="font-mono text-xs text-[var(--color-text-primary)]">{fmtMrr(r.new_mrr)}</span>
        : <span className="text-[var(--color-text-tertiary)] text-xs">—</span>,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* MRR Over Time */}
      <Card title="MRR Over Time" subtitle="Monthly recurring revenue trend">
        <div className="mt-2">
          <MrrChart initialDays={180} />
        </div>
      </Card>

      {/* Revenue Breakdown + Retention */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card title="Monthly Revenue Breakdown" subtitle="New · Expansion · Contraction · Churn">
            <div className="mt-2">
              {metrics.length > 0 ? <RevenueBreakdown data={metrics} /> : (
                <div className="h-56 bg-[var(--color-surface-overlay)] rounded animate-pulse" />
              )}
            </div>
          </Card>
        </div>
        <Card title="Cohort Retention" subtitle="% of MRR retained by cohort month">
          <div className="mt-2">
            <RetentionGrid />
          </div>
        </Card>
      </div>

      {/* Events Table */}
      <Card
        title="Revenue Events"
        subtitle="Subscription lifecycle events"
        padding="none"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="text-xs font-mono px-2 py-1 rounded-[var(--radius-sm)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-overlay)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>
            <span className="text-xs font-mono text-[var(--color-text-tertiary)]">Page {page + 1}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={events.length < PAGE_SIZE}
              className="text-xs font-mono px-2 py-1 rounded-[var(--radius-sm)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-overlay)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        }
      >
        <DataTable
          columns={columns}
          data={events}
          loading={eventsLoading}
          keyFn={r => r.id}
          emptyLabel="No revenue events found"
        />
      </Card>
    </div>
  )
}
