import { Skeleton } from './Skeleton'
import { SparkLine } from '../charts/SparkLine'

interface KpiCardProps {
  label: string
  value: string
  change?: number
  changeSuffix?: string
  invertTrend?: boolean
  sparkData?: number[]
  loading?: boolean
}

export function KpiCard({ label, value, change, changeSuffix = '%', invertTrend = false, sparkData, loading = false }: KpiCardProps) {
  const isPositive = change !== undefined ? (invertTrend ? change < 0 : change > 0) : null
  const trendColor = isPositive === null
    ? 'text-[var(--color-text-tertiary)]'
    : isPositive
    ? 'text-[var(--color-success-700)]'
    : 'text-[var(--color-danger-700)]'

  return (
    <div
      className="bg-[var(--color-surface-raised)] border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] p-5 flex flex-col gap-3"
      style={{ boxShadow: 'var(--shadow-xs)' }}
    >
      <p className="text-xs font-medium tracking-wide uppercase text-[var(--color-text-tertiary)]">{label}</p>

      {loading ? (
        <div className="flex flex-col gap-2">
          <Skeleton height="h-7" width="w-28" />
          <Skeleton height="h-3" width="w-16" />
        </div>
      ) : (
        <>
          <p className="font-mono text-2xl font-medium text-[var(--color-text-primary)] leading-none">{value}</p>
          {change !== undefined && (
            <p className={`text-xs font-mono font-medium ${trendColor}`}>
              {change > 0 ? '+' : ''}{change.toFixed(1)}{changeSuffix}
              <span className="text-[var(--color-text-tertiary)] font-sans font-normal ml-1">vs 30d</span>
            </p>
          )}
        </>
      )}

      {sparkData && sparkData.length > 0 && !loading && (
        <div className="h-10 -mx-1">
          <SparkLine data={sparkData} />
        </div>
      )}
    </div>
  )
}
