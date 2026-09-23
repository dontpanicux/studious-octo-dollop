import type { DealStage } from '../../types'

const OPEN_STAGES: DealStage[] = ['lead', 'qualified', 'demo', 'proposal', 'negotiation']

const STAGE_LABEL: Record<DealStage, string> = {
  lead: 'Lead', qualified: 'Qualified', demo: 'Demo',
  proposal: 'Proposal', negotiation: 'Negotiation',
  closed_won: 'Won', closed_lost: 'Lost',
}

function fmt(v: number) {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`
  return `$${v}`
}

interface FunnelChartProps {
  byStage: Partial<Record<DealStage, { count: number; value: number }>>
}

export function FunnelChart({ byStage }: FunnelChartProps) {
  const stages = OPEN_STAGES.map(s => ({ stage: s, ...((byStage[s]) ?? { count: 0, value: 0 }) }))
  const maxVal = Math.max(...stages.map(s => s.value), 1)

  return (
    <div className="flex items-end gap-3 h-40 px-2">
      {stages.map(({ stage, count, value }) => {
        const pct = Math.max(value / maxVal, 0.05)
        return (
          <div key={stage} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex items-end justify-center" style={{ height: '100%' }}>
              <div
                className="w-full rounded-t-[var(--radius-sm)] transition-all duration-500"
                style={{
                  height: `${pct * 100}%`,
                  background: 'linear-gradient(to top, var(--color-brand-800), var(--color-brand-600))',
                  minHeight: 8,
                }}
              />
            </div>
            <div className="text-center min-w-0 w-full">
              <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-tertiary)] font-mono truncate">{STAGE_LABEL[stage]}</p>
              <p className="text-xs font-mono font-medium text-[var(--color-text-primary)]">{fmt(value)}</p>
              <p className="text-[10px] text-[var(--color-text-tertiary)] font-mono">{count} deal{count !== 1 ? 's' : ''}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
