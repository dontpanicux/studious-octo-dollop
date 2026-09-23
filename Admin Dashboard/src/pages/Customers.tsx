import { useState, useEffect } from 'react'
import { useCustomers } from '../hooks/useCustomers'
import { fetchFeatureUsageForCustomer } from '../lib/queries'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { DataTable } from '../components/ui/DataTable'
import type { Column } from '../components/ui/DataTable'
import type { Customer, CustomerFilters, CustomerStatus, PlanTier } from '../types'

function fmtMrr(v: number) {
  return v >= 1000 ? `$${(v / 1000).toFixed(1)}K` : `$${v}`
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

interface FeatureRow { feature_name: string; usage_count: number }

function CustomerModal({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const [features, setFeatures] = useState<FeatureRow[]>([])
  const maxUsage = Math.max(...features.map(f => f.usage_count), 1)

  useEffect(() => {
    fetchFeatureUsageForCustomer(customer.id).then(setFeatures)
  }, [customer.id])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[var(--color-surface-modal)]" />
      <div
        className="relative bg-[var(--color-surface-raised)] border border-[var(--color-border-default)] rounded-[var(--radius-xl)] w-full max-w-lg p-6"
        style={{ boxShadow: 'var(--shadow-xl)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <Avatar name={customer.name} size="lg" />
            <div>
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">{customer.name}</h2>
              <p className="text-xs text-[var(--color-text-tertiary)]">{customer.domain} · {customer.industry}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[var(--radius-md)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-text-secondary)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'MRR', value: fmtMrr(customer.mrr) },
            { label: 'Plan', value: customer.plan_tier },
            { label: 'Health', value: customer.health_score.toString() },
            { label: 'Country', value: customer.country },
            { label: 'Employees', value: customer.employee_count?.toString() ?? '—' },
            { label: 'AM', value: customer.account_manager ?? '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[var(--color-surface-overlay)] rounded-[var(--radius-md)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-tertiary)] font-mono mb-0.5">{label}</p>
              <p className="text-xs font-mono font-medium text-[var(--color-text-primary)] truncate">{value}</p>
            </div>
          ))}
        </div>

        {/* Feature usage */}
        {features.length > 0 && (
          <div>
            <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-3">Feature Usage · Current Month</p>
            <div className="space-y-2">
              {features.map(f => (
                <div key={f.feature_name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-[var(--color-text-secondary)] capitalize">{f.feature_name.replace(/_/g, ' ')}</span>
                    <span className="text-xs font-mono text-[var(--color-text-tertiary)]">{f.usage_count}</span>
                  </div>
                  <div className="h-1 rounded-full bg-[var(--color-border-subtle)] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(f.usage_count / maxUsage) * 100}%`,
                        background: 'var(--color-brand-500)',
                        opacity: 0.7 + (f.usage_count / maxUsage) * 0.3,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-[10px] text-[var(--color-text-tertiary)] mt-4 font-mono">
          Signed up {fmtDate(customer.signed_up_at)}
          {customer.churned_at && ` · Churned ${fmtDate(customer.churned_at)}`}
        </p>
      </div>
    </div>
  )
}

export function Customers() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<CustomerStatus | ''>('')
  const [plan, setPlan] = useState<PlanTier | ''>('')
  const [selected, setSelected] = useState<Customer | null>(null)

  const filters: CustomerFilters = {
    ...(search ? { search } : {}),
    ...(status ? { status } : {}),
    ...(plan ? { plan } : {}),
    sortBy: 'mrr',
    sortDir: 'desc',
  }

  const { customers, loading } = useCustomers(filters)

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      header: 'Account',
      render: c => (
        <div className="flex items-center gap-2">
          <Avatar name={c.name} size="sm" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-[var(--color-text-primary)] truncate">{c.name}</p>
            <p className="text-[10px] text-[var(--color-text-tertiary)] truncate">{c.domain}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'plan',
      header: 'Plan',
      render: c => (
        <Badge variant={c.plan_tier === 'enterprise' ? 'warning' : c.plan_tier === 'growth' ? 'brand' : 'neutral'}>
          {c.plan_tier}
        </Badge>
      ),
    },
    {
      key: 'mrr',
      header: 'MRR',
      align: 'right',
      render: c => <span className="font-mono text-xs font-medium text-[var(--color-text-primary)]">{fmtMrr(c.mrr)}</span>,
    },
    {
      key: 'health',
      header: 'Health',
      align: 'right',
      render: c => (
        <div className="flex items-center justify-end gap-2">
          <div className="w-12 h-1 rounded-full bg-[var(--color-border-default)] overflow-hidden">
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
          <span className="font-mono text-[10px] text-[var(--color-text-secondary)] w-5 text-right">{c.health_score}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: c => (
        <Badge
          variant={c.status === 'active' ? 'success' : c.status === 'at_risk' ? 'warning' : 'danger'}
          dot
        >
          {c.status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'signed_up',
      header: 'Since',
      render: c => <span className="font-mono text-[10px] text-[var(--color-text-tertiary)]">{fmtDate(c.signed_up_at)}</span>,
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search accounts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs bg-[var(--color-surface-raised)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:border-[var(--color-brand-700)] transition-colors"
          />
        </div>

        <select
          value={status}
          onChange={e => setStatus(e.target.value as CustomerStatus | '')}
          className="text-xs bg-[var(--color-surface-raised)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] px-3 py-2 text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-brand-700)] transition-colors"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="at_risk">At Risk</option>
          <option value="churned">Churned</option>
        </select>

        <select
          value={plan}
          onChange={e => setPlan(e.target.value as PlanTier | '')}
          className="text-xs bg-[var(--color-surface-raised)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] px-3 py-2 text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-brand-700)] transition-colors"
        >
          <option value="">All Plans</option>
          <option value="starter">Starter</option>
          <option value="growth">Growth</option>
          <option value="enterprise">Enterprise</option>
        </select>

        <span className="text-xs font-mono text-[var(--color-text-tertiary)] ml-auto">
          {loading ? '…' : `${customers.length} accounts`}
        </span>
      </div>

      <Card padding="none">
        <DataTable
          columns={columns}
          data={customers}
          loading={loading}
          keyFn={c => c.id}
          emptyLabel="No accounts match your filters"
          onRowClick={setSelected}
        />
      </Card>

      {selected && <CustomerModal customer={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
