import { supabase } from './supabase'
import type { Customer, CustomerFilters, KpiSummary, MetricsDaily, RevenueEvent, SalesDeal, DealStage } from '../types'

export async function fetchMrrTimeSeries(days: number): Promise<MetricsDaily[]> {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const { data, error } = await supabase
    .from('metrics_daily')
    .select('*')
    .gte('date', since.toISOString().split('T')[0])
    .order('date', { ascending: true })
  if (error) { console.error(error); return [] }
  return data ?? []
}

export async function fetchKpiSummary(): Promise<KpiSummary | null> {
  // Compute KPIs directly from source tables — resilient even if metrics_daily is empty
  const [
    { data: customers },
    { data: recentEvents },
    { data: pipelineRows },
    { data: latestMetrics },
  ] = await Promise.all([
    supabase.from('customers').select('mrr, status, signed_up_at, churned_at'),
    supabase
      .from('revenue_events')
      .select('event_type, mrr_change, occurred_at')
      .gte('occurred_at', new Date(Date.now() - 30 * 86400000).toISOString()),
    supabase
      .from('sales_pipeline')
      .select('deal_value, probability, stage')
      .not('stage', 'in', '(closed_won,closed_lost)'),
    supabase
      .from('metrics_daily')
      .select('mrr, dau, mau, active_customers')
      .order('date', { ascending: false })
      .limit(1),
  ])

  if (!customers || customers.length === 0) return null

  // MRR from active customers
  const activeCustomers = customers.filter(c => c.status === 'active')
  const currentMrr = activeCustomers.reduce((s, c) => s + Number(c.mrr), 0)

  // MRR 30 days ago: subtract recent new MRR, add back recent churn MRR
  const thirtyDayNewMrr = (recentEvents ?? [])
    .filter(e => e.event_type === 'new' || e.event_type === 'expansion' || e.event_type === 'reactivation')
    .reduce((s, e) => s + Number(e.mrr_change), 0)
  const thirtyDayLostMrr = (recentEvents ?? [])
    .filter(e => e.event_type === 'churn' || e.event_type === 'contraction')
    .reduce((s, e) => s + Math.abs(Number(e.mrr_change)), 0)
  const prevMrr = Math.max(currentMrr - thirtyDayNewMrr + thirtyDayLostMrr, 1)
  const mrrChange = currentMrr - prevMrr
  const mrrChangePct = (mrrChange / prevMrr) * 100

  // New / churned this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  const newCustomersThisMonth = customers.filter(
    c => c.signed_up_at && new Date(c.signed_up_at) >= startOfMonth
  ).length
  const churnedThisMonth = customers.filter(
    c => c.churned_at && new Date(c.churned_at) >= startOfMonth
  ).length

  // NRR: (starting MRR + expansion - churn - contraction) / starting MRR
  const expansionMrr = (recentEvents ?? [])
    .filter(e => e.event_type === 'expansion').reduce((s, e) => s + Number(e.mrr_change), 0)
  const churnMrr = (recentEvents ?? [])
    .filter(e => e.event_type === 'churn').reduce((s, e) => s + Math.abs(Number(e.mrr_change)), 0)
  const contractionMrr = (recentEvents ?? [])
    .filter(e => e.event_type === 'contraction').reduce((s, e) => s + Math.abs(Number(e.mrr_change)), 0)
  const nrr = prevMrr > 0
    ? ((prevMrr + expansionMrr - churnMrr - contractionMrr) / prevMrr) * 100
    : 100

  // Churn rate
  const totalBase = activeCustomers.length + churnedThisMonth
  const churnRate = totalBase > 0 ? (churnedThisMonth / totalBase) * 100 : 0

  // DAU/MAU from metrics_daily if available, else estimate
  const latestRow = latestMetrics?.[0]
  const dauMauRatio = latestRow && latestRow.mau > 0
    ? (latestRow.dau / latestRow.mau) * 100
    : 32 // reasonable SaaS benchmark fallback

  // Weighted pipeline
  const pipelineValue = (pipelineRows ?? []).reduce(
    (s, r) => s + Number(r.deal_value) * (Number(r.probability) / 100), 0
  )

  return {
    currentMrr,
    mrrChange,
    mrrChangePct,
    activeCustomers: activeCustomers.length,
    newCustomersThisMonth,
    churnedThisMonth,
    nrr,
    churnRate,
    dauMauRatio,
    pipelineValue,
  }
}

export async function fetchRevenueEvents(limit = 20, offset = 0): Promise<RevenueEvent[]> {
  const { data, error } = await supabase
    .from('revenue_events')
    .select('*')
    .order('occurred_at', { ascending: false })
    .range(offset, offset + limit - 1)
  if (error) { console.error(error); return [] }
  return data ?? []
}

export async function fetchCustomers(opts: CustomerFilters = {}): Promise<Customer[]> {
  let q = supabase.from('customers').select('*')
  if (opts.status) q = q.eq('status', opts.status)
  if (opts.plan) q = q.eq('plan_tier', opts.plan)
  if (opts.search) q = q.ilike('name', `%${opts.search}%`)
  const sortBy = (opts.sortBy as string) || 'mrr'
  const ascending = opts.sortDir === 'asc'
  q = q.order(sortBy, { ascending })
  const { data, error } = await q
  if (error) { console.error(error); return [] }
  return data ?? []
}

export async function fetchTopCustomers(limit = 5): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('status', 'active')
    .order('mrr', { ascending: false })
    .limit(limit)
  if (error) { console.error(error); return [] }
  return data ?? []
}

export async function fetchPipeline(): Promise<SalesDeal[]> {
  const { data, error } = await supabase
    .from('sales_pipeline')
    .select('*')
    .not('stage', 'in', '("closed_won","closed_lost")')
    .order('deal_value', { ascending: false })
  if (error) { console.error(error); return [] }
  return data ?? []
}

export async function fetchPipelineByStage(): Promise<Record<DealStage, { count: number; value: number }>> {
  const stages: DealStage[] = ['lead', 'qualified', 'demo', 'proposal', 'negotiation', 'closed_won', 'closed_lost']
  const empty = Object.fromEntries(stages.map(s => [s, { count: 0, value: 0 }])) as Record<DealStage, { count: number; value: number }>

  const { data, error } = await supabase.from('sales_pipeline').select('stage, deal_value')
  if (error) { console.error(error); return empty }

  for (const row of data ?? []) {
    const s = row.stage as DealStage
    if (empty[s]) {
      empty[s].count += 1
      empty[s].value += row.deal_value
    }
  }
  return empty
}

export async function fetchFeatureUsageForCustomer(customerId: string): Promise<{ feature_name: string; usage_count: number }[]> {
  const { data, error } = await supabase
    .from('feature_usage')
    .select('feature_name, usage_count')
    .eq('customer_id', customerId)
    .order('usage_count', { ascending: false })
  if (error) { console.error(error); return [] }
  return data ?? []
}
