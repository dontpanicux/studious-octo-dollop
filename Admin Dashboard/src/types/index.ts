export type Page = 'overview' | 'revenue' | 'customers' | 'pipeline'

export type PlanTier = 'starter' | 'growth' | 'enterprise'
export type CustomerStatus = 'active' | 'at_risk' | 'churned'
export type EventType = 'new' | 'expansion' | 'contraction' | 'churn' | 'reactivation'
export type DealStage = 'lead' | 'qualified' | 'demo' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
export type DealSource = 'inbound' | 'outbound' | 'referral' | 'partner'

export interface Customer {
  id: string
  name: string
  domain: string | null
  plan_tier: PlanTier
  mrr: number
  health_score: number
  status: CustomerStatus
  employee_count: number | null
  industry: string | null
  country: string
  account_manager: string | null
  signed_up_at: string
  churned_at: string | null
  created_at: string
}

export interface MetricsDaily {
  id: string
  date: string
  mrr: number
  new_mrr: number
  expansion_mrr: number
  contraction_mrr: number
  churn_mrr: number
  active_customers: number
  new_customers: number
  churned_customers: number
  dau: number
  mau: number
}

export interface RevenueEvent {
  id: string
  customer_id: string | null
  customer_name: string
  event_type: EventType
  mrr_change: number
  previous_mrr: number | null
  new_mrr: number | null
  plan_from: string | null
  plan_to: string | null
  occurred_at: string
}

export interface SalesDeal {
  id: string
  company_name: string
  contact_name: string
  contact_email: string | null
  stage: DealStage
  deal_value: number
  probability: number
  expected_close_date: string | null
  owner: string
  source: DealSource | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface FeatureUsage {
  id: string
  customer_id: string
  feature_name: string
  usage_count: number
  last_used_at: string | null
  month: string
}

export interface KpiSummary {
  currentMrr: number
  mrrChange: number
  mrrChangePct: number
  activeCustomers: number
  newCustomersThisMonth: number
  churnedThisMonth: number
  nrr: number
  churnRate: number
  dauMauRatio: number
  pipelineValue: number
}

export interface CustomerFilters {
  status?: CustomerStatus | ''
  plan?: PlanTier | ''
  search?: string
  sortBy?: keyof Customer
  sortDir?: 'asc' | 'desc'
}
