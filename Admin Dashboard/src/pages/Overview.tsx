import { useEffect, useState } from 'react'
import { useKpi } from '../hooks/useKpi'
import { useMetrics } from '../hooks/useMetrics'
import { fetchRevenueEvents, fetchTopCustomers } from '../lib/queries'
import { isSupabaseConfigured } from '../lib/supabase'
import { KpiCard } from '../components/ui/KpiCard'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { Skeleton } from '../components/ui/Skeleton'
import type { RevenueEvent, Customer, EventType } from '../types'

function fmtMrr(v: number) {
  return v >= 1000 ? `$${(v / 1000).toFixed(1)}K` : `$${v}`
}

function fmtPct(v: number) { return `${v.toFixed(1)}%` }

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diff / 86400000)
  if (d === 0) return 'today'
  if (d === 1) return '1d ago'
  if (d < 30) return `${d}d ago`
  return `${Math.floor(d / 30)}mo ago`
}

const EVENT_VARIANT: Record<EventType, 'success' | 'brand' | 'warning' | 'danger' | 'neutral'> = {
  new: 'success',
  expansion: 'brand',
  reactivation: 'brand',
  contraction: 'warning',
  churn: 'danger',
}

const EVENT_SIGN: Record<EventType, string> = {
  new: '+', expansion: '+', reactivation: '+', contraction: '−', churn: '−',
}

export function Overview() {
  const { summary, loading: kpiLoading } = useKpi()
  const { data: metrics } = useMetrics(90)
  const [events, setEvents] = useState<RevenueEvent[]>([])
  const [topCustomers, setTopCustomers] = useState<Customer[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [custLoading, setCustLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setEventsLoading(false)
      setCustLoading(false)
      return
    }
    fetchRevenueEvents(10).then(d => { setEvents(d); setEventsLoading(false) })
    fetchTopCustomers(5).then(d => { setTopCustomers(d); setCustLoading(false) })
  }, [])

  const mrrSpark = metrics.slice(-30).map(d => d.mrr)
  const dauSpark = metrics.slice(-30).map(d => d.dau)

  // Feature adoption summary
  const FEATURES = ['Dashboards', 'Alerts', 'API Access', 'Data Export', 'Connectors', 'AI Insights', 'Team Sharing', 'Audit Log']
  const ADOPTION = [92, 78, 61, 55, 44, 38, 31, 22]

  return (
    <div className="flex flex-col gap-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          label="MRR"
          value={summary ? fmtMrr(summary.currentMrr) : '—'}
          change={summary?.mrrChangePct}
          sparkData={mrrSpark}
          loading={kpiLoading}
        />
        <KpiCard
          label="Active Customers"
          value={summary ? summary.activeCustomers.toString() : '—'}
          change={summary?.newCustomersThisMonth}
          changeSuffix=" new"
          loading={kpiLoading}
        />
        <KpiCard
          label="Net Rev. Retention"
          value={summary ? fmtPct(summary.nrr) : '—'}
          change={summary ? summary.nrr - 100 : undefined}
          loading={kpiLoading}
        />
        <KpiCard
          label="Monthly Churn"
          value={summary ? fmtPct(summary.churnRate) : '—'}
          change={summary?.churnRate ? -summary.churnRate : undefined}
          invertTrend
          loading={kpiLoading}
        />
        <KpiCard
          label="DAU / MAU"
          value={summary ? fmtPct(summary.dauMauRatio) : '—'}
          sparkData={dauSpark}
          loading={kpiLoading}
        />
        <KpiCard
          label="Pipeline (Wtd)"
          value={summary ? fmtMrr(summary.pipelineValue) : '—'}
          loading={kpiLoading}
        />
      </div>

      {/* Main row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top customers */}
        <div className="lg:col-span-2">
          <Card title="Top Accounts by MRR" padding="none">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border-subtle)]">
                  {['Account', 'Plan', 'MRR', 'Health', 'Status'].map(h => (
                    <th key={h} className={`px-4 py-3 text-[10px] uppercase tracking-wide font-medium text-[var(--color-text-tertiary)] ${h === 'MRR' || h === 'Health' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {custLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-[var(--color-border-subtle)]">
                      {[1, 2, 3, 4, 5].map(j => <td key={j} className="px-4 py-3"><Skeleton /></td>)}
                    </tr>
                  ))
                  : topCustomers.map(c => (
                    <tr key={c.id} className="border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-overlay)] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={c.name} size="sm" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-[var(--color-text-primary)] truncate">{c.name}</p>
                            <p className="text-[10px] text-[var(--color-text-tertiary)] truncate">{c.domain}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={c.plan_tier === 'enterprise' ? 'warning' : c.plan_tier === 'growth' ? 'brand' : 'neutral'}>
                          {c.plan_tier}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs font-medium text-[var(--color-text-primary)]">
                        {fmtMrr(c.mrr)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1 rounded-full bg-[var(--color-border-default)] overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${c.health_score}%`,
                                background: c.health_score >= 80
                                  ? 'var(--color-success-500)'
                                  : c.health_score >= 60
                                  ? 'var(--color-warning-500)'
                                  : 'var(--color-danger-500)',
                              }}
                            />
                          </div>
                          <span className="font-mono text-[10px] text-[var(--color-text-secondary)] w-6">{c.health_score}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={c.status === 'active' ? 'success' : c.status === 'at_risk' ? 'warning' : 'danger'}
                          dot
                        >
                          {c.status.replace('_', ' ')}
                        </Badge>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </Card>
        </div>

        {/* Activity feed */}
        <Card title="Recent Activity" padding="none">
          <div className="divide-y divide-[var(--color-border-subtle)]">
            {eventsLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="px-4 py-3 flex gap-3">
                  <Skeleton height="h-5" width="w-5" className="rounded-full shrink-0" />
                  <div className="flex-1 flex flex-col gap-1.5">
                    <Skeleton height="h-3" width="w-32" />
                    <Skeleton height="h-3" width="w-20" />
                  </div>
                </div>
              ))
              : events.map(ev => (
                <div key={ev.id} className="px-4 py-3 flex items-start gap-3">
                  <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                    ev.event_type === 'new' || ev.event_type === 'expansion' || ev.event_type === 'reactivation'
                      ? 'bg-[var(--color-success-500)]'
                      : 'bg-[var(--color-danger-500)]'
                  }`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-[var(--color-text-primary)] truncate">{ev.customer_name}</p>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <Badge variant={EVENT_VARIANT[ev.event_type]}>{ev.event_type}</Badge>
                      <span className="font-mono text-[10px] font-medium text-[var(--color-text-secondary)]">
                        {EVENT_SIGN[ev.event_type]}{fmtMrr(Math.abs(ev.mrr_change))}
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5">{timeAgo(ev.occurred_at)}</p>
                  </div>
                </div>
              ))
            }
          </div>
        </Card>
      </div>

      {/* Feature adoption */}
      <Card title="Feature Adoption" subtitle="Current month · active accounts">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-1">
          {FEATURES.map((feat, i) => (
            <div key={feat}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-[var(--color-text-secondary)]">{feat}</span>
                <span className="text-xs font-mono text-[var(--color-text-primary)]">{ADOPTION[i]}%</span>
              </div>
              <div className="h-1 rounded-full bg-[var(--color-border-subtle)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${ADOPTION[i]}%`,
                    background: ADOPTION[i] >= 70 ? 'var(--color-success-500)' : ADOPTION[i] >= 40 ? 'var(--color-brand-500)' : 'var(--color-border-strong)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
