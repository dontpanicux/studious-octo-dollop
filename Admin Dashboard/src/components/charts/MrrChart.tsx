import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, type TooltipProps
} from 'recharts'
import type { MetricsDaily } from '../../types'
import { useMetrics } from '../../hooks/useMetrics'

function fmt(v: number) {
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}K`
  return `$${v}`
}

function fmtDate(str: string) {
  const d = new Date(str + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[var(--color-surface-overlay)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] px-3 py-2 text-xs shadow-lg">
      <p className="text-[var(--color-text-tertiary)] mb-1">{fmtDate(label)}</p>
      <p className="font-mono font-medium text-[var(--color-text-brand)]">{fmt(payload[0].value as number)}</p>
    </div>
  )
}

const PERIODS: { label: string; days: number }[] = [
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: '180d', days: 180 },
]

interface MrrChartProps {
  initialDays?: number
}

export function MrrChart({ initialDays = 90 }: MrrChartProps) {
  const [days, setDays] = useState(initialDays)
  const { data, loading } = useMetrics(days)

  const chartData = data.map(d => ({ date: d.date, mrr: d.mrr }))

  // Sample for readability on narrow periods
  const thinned = chartData.filter((_, i) => i % Math.max(1, Math.floor(chartData.length / 30)) === 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-1">
        {PERIODS.map(p => (
          <button
            key={p.days}
            onClick={() => setDays(p.days)}
            className={`text-xs font-mono px-2.5 py-1 rounded-[var(--radius-sm)] transition-colors ${
              days === p.days
                ? 'bg-[var(--color-brand-900)] text-[var(--color-brand-400)]'
                : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-overlay)]'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-56 bg-[var(--color-surface-overlay)] rounded-[var(--radius-md)] animate-pulse" />
      ) : (
        <ResponsiveContainer width="100%" height={224}>
          <AreaChart data={thinned} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--color-brand-500)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--color-border-subtle)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: 'var(--color-text-tertiary)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={fmtDate}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: 'var(--color-text-tertiary)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={fmt}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-border-default)', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="mrr"
              stroke="var(--color-brand-500)"
              strokeWidth={2}
              fill="url(#mrrGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
