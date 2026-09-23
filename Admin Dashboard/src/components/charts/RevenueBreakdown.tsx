import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, type TooltipProps
} from 'recharts'
import type { MetricsDaily } from '../../types'

function aggregateByMonth(data: MetricsDaily[]) {
  const map = new Map<string, { new_mrr: number; expansion_mrr: number; contraction_mrr: number; churn_mrr: number }>()
  for (const d of data) {
    const month = d.date.slice(0, 7)
    const cur = map.get(month) ?? { new_mrr: 0, expansion_mrr: 0, contraction_mrr: 0, churn_mrr: 0 }
    cur.new_mrr += d.new_mrr
    cur.expansion_mrr += d.expansion_mrr
    cur.contraction_mrr += d.contraction_mrr
    cur.churn_mrr += d.churn_mrr
    map.set(month, cur)
  }
  return Array.from(map.entries()).map(([month, v]) => ({
    month,
    New: Math.round(v.new_mrr),
    Expansion: Math.round(v.expansion_mrr),
    Contraction: -Math.round(v.contraction_mrr),
    Churn: -Math.round(v.churn_mrr),
  }))
}

function fmtK(v: number) { return `$${Math.abs(Math.round(v / 100) * 100) >= 1000 ? (v / 1000).toFixed(1) + 'K' : v}` }

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[var(--color-surface-overlay)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] px-3 py-2.5 text-xs shadow-lg space-y-1">
      <p className="text-[var(--color-text-tertiary)] mb-1">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: p.color }} />
          <span className="text-[var(--color-text-secondary)]">{p.name}</span>
          <span className="font-mono font-medium text-[var(--color-text-primary)] ml-auto">{fmtK(p.value as number)}</span>
        </div>
      ))}
    </div>
  )
}

interface RevenueBreakdownProps {
  data: MetricsDaily[]
}

export function RevenueBreakdown({ data }: RevenueBreakdownProps) {
  const chartData = aggregateByMonth(data)
  return (
    <ResponsiveContainer width="100%" height={224}>
      <BarChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} barSize={10} barGap={2}>
        <CartesianGrid stroke="var(--color-border-subtle)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: 'var(--color-text-tertiary)', fontSize: 10, fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: 'var(--color-text-tertiary)', fontSize: 10, fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} tickFormatter={fmtK} width={48} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-surface-overlay)' }} />
        <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'var(--font-mono)', paddingTop: 8 }} />
        <Bar dataKey="New" fill="var(--color-success-500)" radius={[2, 2, 0, 0]} />
        <Bar dataKey="Expansion" fill="var(--color-brand-500)" radius={[2, 2, 0, 0]} />
        <Bar dataKey="Contraction" fill="var(--color-warning-500)" radius={[0, 0, 2, 2]} />
        <Bar dataKey="Churn" fill="var(--color-danger-500)" radius={[0, 0, 2, 2]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
