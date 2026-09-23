import { usePipeline } from '../hooks/usePipeline'
import { KpiCard } from '../components/ui/KpiCard'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { DataTable } from '../components/ui/DataTable'
import { FunnelChart } from '../components/charts/FunnelChart'
import type { Column } from '../components/ui/DataTable'
import type { SalesDeal, DealStage } from '../types'

function fmtVal(v: number) {
  return v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`
}
function fmtDate(s: string | null) {
  if (!s) return '—'
  return new Date(s + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const STAGE_VARIANT: Record<DealStage, 'neutral' | 'brand' | 'warning' | 'success' | 'danger'> = {
  lead: 'neutral', qualified: 'neutral', demo: 'brand', proposal: 'brand',
  negotiation: 'warning', closed_won: 'success', closed_lost: 'danger',
}

const SOURCE_LABEL: Record<string, string> = { inbound: 'Inbound', outbound: 'Outbound', referral: 'Referral', partner: 'Partner' }

export function Pipeline() {
  const { deals, byStage, loading } = usePipeline()

  const openDeals = deals.filter(d => d.stage !== 'closed_lost')
  const totalPipeline = openDeals.reduce((s, d) => s + d.deal_value, 0)
  const weightedPipeline = openDeals.reduce((s, d) => s + d.deal_value * (d.probability / 100), 0)
  const avgDealSize = openDeals.length > 0 ? totalPipeline / openDeals.length : 0

  const columns: Column<SalesDeal>[] = [
    {
      key: 'company',
      header: 'Company',
      render: d => (
        <div>
          <p className="text-xs font-medium text-[var(--color-text-primary)]">{d.company_name}</p>
          <p className="text-[10px] text-[var(--color-text-tertiary)]">{d.contact_name}</p>
        </div>
      ),
    },
    {
      key: 'stage',
      header: 'Stage',
      render: d => <Badge variant={STAGE_VARIANT[d.stage]}>{d.stage.replace('_', ' ')}</Badge>,
    },
    {
      key: 'value',
      header: 'Value',
      align: 'right',
      render: d => <span className="font-mono text-xs font-medium text-[var(--color-text-primary)]">{fmtVal(d.deal_value)}</span>,
    },
    {
      key: 'probability',
      header: 'Prob.',
      align: 'right',
      render: d => (
        <span className={`font-mono text-xs ${d.probability >= 70 ? 'text-[var(--color-success-700)]' : d.probability >= 40 ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-text-tertiary)]'}`}>
          {d.probability}%
        </span>
      ),
    },
    {
      key: 'close',
      header: 'Close Date',
      render: d => <span className="font-mono text-[10px] text-[var(--color-text-tertiary)]">{fmtDate(d.expected_close_date)}</span>,
    },
    {
      key: 'owner',
      header: 'Owner',
      render: d => <span className="text-xs text-[var(--color-text-secondary)]">{d.owner.split(' ')[0]}</span>,
    },
    {
      key: 'source',
      header: 'Source',
      render: d => d.source
        ? <Badge variant="neutral">{SOURCE_LABEL[d.source] ?? d.source}</Badge>
        : <span className="text-[var(--color-text-tertiary)] text-xs">—</span>,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Pipeline" value={fmtVal(totalPipeline)} loading={loading} />
        <KpiCard label="Weighted Pipeline" value={fmtVal(weightedPipeline)} loading={loading} />
        <KpiCard label="Avg Deal Size" value={fmtVal(avgDealSize)} loading={loading} />
        <KpiCard label="Open Deals" value={openDeals.length.toString()} loading={loading} />
      </div>

      {/* Funnel */}
      <Card title="Pipeline Funnel" subtitle="Deal value by stage">
        {loading ? (
          <div className="h-40 bg-[var(--color-surface-overlay)] rounded animate-pulse" />
        ) : (
          <FunnelChart byStage={byStage} />
        )}
      </Card>

      {/* Deals Table */}
      <Card title="Open Deals" subtitle="Active pipeline opportunities" padding="none">
        <DataTable
          columns={columns}
          data={openDeals}
          loading={loading}
          keyFn={d => d.id}
          emptyLabel="No open deals in pipeline"
        />
      </Card>
    </div>
  )
}
