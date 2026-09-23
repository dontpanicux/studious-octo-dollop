import type { SupabaseClient } from '@supabase/supabase-js'

// Linear Congruential Generator — deterministic, seed=42
function makePrng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}
const rand = makePrng(42)
function rInt(min: number, max: number) { return Math.floor(rand() * (max - min + 1)) + min }
function rPick<T>(arr: T[]): T { return arr[Math.floor(rand() * arr.length)] }
function rId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const v = Math.floor(rand() * 16)
    return (c === 'x' ? v : (v & 0x3) | 0x8).toString(16)
  })
}

const COMPANIES = [
  'Acuity Systems', 'Beacon Health', 'Cascade Logistics', 'Delphi Finance',
  'Envoy Freight', 'Fulcrum Analytics', 'Greystone Capital', 'Harbinger Tech',
  'Inertia Labs', 'Juniper Commerce', 'Kinetic Health', 'Lattice Payments',
  'Meridian Ops', 'Nexus Retail', 'Orbit Software', 'Parallax Media',
  'Quantum Foods', 'Relay Networks', 'Stratum Insurance', 'Tessera Fintech',
  'Umbra Security', 'Vertex Logistics', 'Willow HR', 'Xenon Commerce',
  'Yonder Travel', 'Zenith Medical', 'Arclight Data', 'Bridgeway Capital',
  'Cobalt Systems', 'Drift Analytics', 'Echo Payments', 'Forge Logistics',
  'Graphite Health', 'Haven Insurance', 'Iris Commerce', 'Jetsam Media',
  'Keystone Fintech', 'Lumen Retail', 'Mainstay Software', 'Nova Health',
  'Outpost Networks', 'Pinnacle Capital', 'Quorum Data', 'Ridge Logistics',
  'Signal Commerce', 'Torque Analytics', 'Upland Insurance', 'Vault Finance',
  'Waypoint Retail', 'Apex Data', 'Borealis Systems', 'Current Health',
  'Datum Fintech', 'Ember Commerce', 'Flint Logistics', 'Gale Networks',
  'Hollow Analytics', 'Iron Capital', 'Jura Commerce', 'Keel Insurance',
  'Lode Retail', 'Mesa Payments', 'North Systems',
]

const INDUSTRIES = ['Fintech', 'Healthcare', 'Logistics', 'SaaS', 'E-commerce', 'Insurance', 'Media', 'Retail']
const COUNTRIES = ['US', 'US', 'US', 'US', 'CA', 'CA', 'GB', 'DE', 'AU', 'FR']
const AMS = ['Jordan Ellis', 'Morgan Blake', 'Sam Rivera', 'Taylor Quinn', 'Alex Chen']
const CONTACTS = [
  'Noah Patel', 'Avery Kim', 'Riley Johnson', 'Casey Morgan', 'Drew Martinez',
  'Finley Thompson', 'Harper Lee', 'Indigo Chen', 'Jamie Park', 'Keaton Reyes',
  'Logan Nguyen', 'Maya Robinson', 'Noel Garcia', 'Oakley White', 'Piper Davis',
  'Quinn Anderson', 'Reed Wilson', 'Sage Taylor', 'Tanner Brown', 'Uma Jackson',
  'Valor Harris', 'Winter Clark', 'Xander Lewis', 'Yuki Scott', 'Zara King',
  'Aiden Hall', 'Blair Young', 'Cleo Hernandez', 'Decker Wright',
]

const PLAN_MRR: Record<string, [number, number]> = {
  starter: [99, 199],
  growth: [399, 699],
  enterprise: [1200, 4800],
}

export async function runSeed(supabase: SupabaseClient) {
  console.log('[seed] Starting...')

  // ── Customers ──────────────────────────────────────────────
  const customers: Record<string, string>[] = []
  const customerIds: string[] = []
  const activeIds: string[] = []

  const baseDate = new Date('2025-01-15')

  for (let i = 0; i < 63; i++) {
    const id = rId()
    customerIds.push(id)
    const planTier = i < 26 ? 'starter' : i < 47 ? 'growth' : 'enterprise'
    const [mrrMin, mrrMax] = PLAN_MRR[planTier]
    const mrr = rInt(mrrMin, mrrMax)
    const isChurned = i >= 55
    const signedUpDaysAgo = rInt(30, 540)
    const signedUpAt = new Date(baseDate)
    signedUpAt.setDate(signedUpAt.getDate() + rInt(0, 200) - signedUpDaysAgo)
    const churnedAt = isChurned ? new Date(signedUpAt.getTime() + rInt(30, 120) * 86400000) : null
    const healthScore = isChurned ? rInt(20, 49) : (planTier === 'enterprise' ? rInt(72, 97) : rInt(52, 95))
    const status = isChurned ? 'churned' : healthScore < 55 ? 'at_risk' : 'active'
    const name = COMPANIES[i]
    const domain = name.toLowerCase().replace(/\s+/g, '') + '.io'

    customers.push({
      id,
      name,
      domain,
      plan_tier: planTier,
      mrr: mrr.toString(),
      health_score: healthScore.toString(),
      status,
      employee_count: rInt(10, 800).toString(),
      industry: rPick(INDUSTRIES),
      country: rPick(COUNTRIES),
      account_manager: rPick(AMS),
      signed_up_at: signedUpAt.toISOString(),
      churned_at: churnedAt?.toISOString() ?? null,
      created_at: signedUpAt.toISOString(),
    })

    if (!isChurned) activeIds.push(id)
  }

  await supabase.from('customers').upsert(customers, { onConflict: 'id' })
  console.log('[seed] customers done')

  // ── Metrics Daily ──────────────────────────────────────────
  const metrics: Record<string, unknown>[] = []
  let mrr = 62100
  let activeCust = 28
  const metricStart = new Date('2026-03-01')
  const metricEnd = new Date('2026-09-21')

  for (let d = new Date(metricStart); d <= metricEnd; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]
    const dayOfWeek = d.getDay()
    const isWeekday = dayOfWeek > 0 && dayOfWeek < 6

    const newMrr = isWeekday ? rInt(0, 2) * rInt(99, 699) : 0
    const expansionMrr = rand() < 0.06 ? rInt(100, 300) : 0
    const contractionMrr = rand() < 0.03 ? rInt(50, 200) : 0
    const churnMrr = rand() < 0.02 ? rInt(99, 499) : 0

    const newCust = newMrr > 0 ? 1 : 0
    const churnedCust = churnMrr > 0 ? 1 : 0

    mrr = Math.max(mrr + newMrr + expansionMrr - contractionMrr - churnMrr, 62000)
    activeCust = Math.max(activeCust + newCust - churnedCust, 28)

    const mau = activeCust * rInt(6, 9)
    const dau = Math.floor(mau * (0.28 + rand() * 0.12))

    metrics.push({
      id: rId(),
      date: dateStr,
      mrr: Math.round(mrr),
      new_mrr: Math.round(newMrr),
      expansion_mrr: Math.round(expansionMrr),
      contraction_mrr: Math.round(contractionMrr),
      churn_mrr: Math.round(churnMrr),
      active_customers: activeCust,
      new_customers: newCust,
      churned_customers: churnedCust,
      dau,
      mau,
    })
  }

  // Batch in chunks of 50 to avoid payload size limits
  for (let i = 0; i < metrics.length; i += 50) {
    const chunk = metrics.slice(i, i + 50)
    const { error } = await supabase.from('metrics_daily').upsert(chunk, { onConflict: 'date' })
    if (error) console.error('[seed] metrics_daily chunk error', error)
  }
  console.log('[seed] metrics_daily done')

  // ── Revenue Events ─────────────────────────────────────────
  const events: Record<string, unknown>[] = []
  const eventStart = new Date('2025-02-01')
  const eventEnd = new Date('2026-09-21')

  for (let d = new Date(eventStart); d <= eventEnd; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) continue

    // 1-3 new events per week
    if (rand() < 0.4) {
      const custName = rPick(COMPANIES)
      const plan = rPick(['starter', 'growth', 'enterprise']) as keyof typeof PLAN_MRR
      const [mMin, mMax] = PLAN_MRR[plan]
      const mrrVal = rInt(mMin, mMax)
      events.push({
        id: rId(),
        customer_id: rPick(customerIds),
        customer_name: custName,
        event_type: 'new',
        mrr_change: mrrVal,
        previous_mrr: null,
        new_mrr: mrrVal,
        plan_from: null,
        plan_to: plan,
        occurred_at: new Date(d).toISOString(),
      })
    }

    if (rand() < 0.12) {
      const custIdx = rInt(0, activeIds.length - 1)
      const custId = activeIds[custIdx]
      const custName = COMPANIES[customerIds.indexOf(custId)] ?? rPick(COMPANIES)
      const prev = rInt(399, 999)
      const next = prev + rInt(100, 400)
      events.push({
        id: rId(),
        customer_id: custId,
        customer_name: custName,
        event_type: 'expansion',
        mrr_change: next - prev,
        previous_mrr: prev,
        new_mrr: next,
        plan_from: 'growth',
        plan_to: 'enterprise',
        occurred_at: new Date(d).toISOString(),
      })
    }

    if (rand() < 0.05) {
      const custName = rPick(COMPANIES)
      const prev = rInt(399, 1200)
      const next = prev - rInt(100, 300)
      events.push({
        id: rId(),
        customer_id: rPick(customerIds),
        customer_name: custName,
        event_type: 'contraction',
        mrr_change: -(prev - next),
        previous_mrr: prev,
        new_mrr: Math.max(next, 99),
        plan_from: 'enterprise',
        plan_to: 'growth',
        occurred_at: new Date(d).toISOString(),
      })
    }

    if (rand() < 0.03) {
      const custName = rPick(COMPANIES)
      const mrrVal = rPick([149, 499, 1499])
      events.push({
        id: rId(),
        customer_id: rPick(customerIds),
        customer_name: custName,
        event_type: 'churn',
        mrr_change: -mrrVal,
        previous_mrr: mrrVal,
        new_mrr: 0,
        plan_from: mrrVal === 149 ? 'starter' : mrrVal === 499 ? 'growth' : 'enterprise',
        plan_to: null,
        occurred_at: new Date(d).toISOString(),
      })
    }
  }

  for (let i = 0; i < events.length; i += 50) {
    const chunk = events.slice(i, i + 50)
    const { error } = await supabase.from('revenue_events').upsert(chunk, { onConflict: 'id' })
    if (error) console.error('[seed] revenue_events chunk error', error)
  }
  console.log('[seed] revenue_events done')

  // ── Sales Pipeline ─────────────────────────────────────────
  const STAGES = ['lead', 'qualified', 'demo', 'proposal', 'negotiation', 'closed_won', 'closed_lost'] as const
  const STAGE_PROBS: Record<string, number> = {
    lead: 10, qualified: 25, demo: 40, proposal: 60, negotiation: 80,
    closed_won: 100, closed_lost: 0,
  }
  const OWNERS = ['Jordan Ellis', 'Morgan Blake', 'Sam Rivera', 'Taylor Quinn']
  const SOURCES = ['inbound', 'outbound', 'referral', 'partner'] as const

  const deals: Record<string, unknown>[] = [
    // Lead (4)
    ...Array.from({ length: 4 }, () => ({ stage: 'lead', deal_value: rInt(8000, 28000) })),
    // Qualified (6)
    ...Array.from({ length: 6 }, () => ({ stage: 'qualified', deal_value: rInt(15000, 45000) })),
    // Demo (5)
    ...Array.from({ length: 5 }, () => ({ stage: 'demo', deal_value: rInt(20000, 60000) })),
    // Proposal (5)
    ...Array.from({ length: 5 }, () => ({ stage: 'proposal', deal_value: rInt(25000, 75000) })),
    // Negotiation (4)
    ...Array.from({ length: 4 }, () => ({ stage: 'negotiation', deal_value: rInt(35000, 85000) })),
    // Closed Won (6)
    ...Array.from({ length: 6 }, () => ({ stage: 'closed_won', deal_value: rInt(12000, 72000) })),
    // Closed Lost (3)
    ...Array.from({ length: 3 }, () => ({ stage: 'closed_lost', deal_value: rInt(8000, 40000) })),
  ].map(d => {
    const closeDate = new Date()
    closeDate.setDate(closeDate.getDate() + rInt(7, 90))
    const createdAt = new Date()
    createdAt.setDate(createdAt.getDate() - rInt(5, 60))
    const contactIdx = rInt(0, CONTACTS.length - 1)
    const companyName = rPick(COMPANIES)
    return {
      id: rId(),
      company_name: companyName,
      contact_name: CONTACTS[contactIdx],
      contact_email: `${CONTACTS[contactIdx].split(' ')[0].toLowerCase()}@${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
      stage: d.stage,
      deal_value: d.deal_value,
      probability: STAGE_PROBS[d.stage as string],
      expected_close_date: closeDate.toISOString().split('T')[0],
      owner: rPick(OWNERS),
      source: rPick(SOURCES),
      notes: null,
      created_at: createdAt.toISOString(),
      updated_at: new Date().toISOString(),
    }
  })

  await supabase.from('sales_pipeline').upsert(deals, { onConflict: 'id' })
  console.log('[seed] sales_pipeline done')

  // ── Feature Usage ──────────────────────────────────────────
  const FEATURES = ['dashboards', 'alerts', 'api_access', 'data_export', 'connectors', 'ai_insights', 'team_sharing', 'audit_log']
  const usageRows: Record<string, unknown>[] = []
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  for (const custId of activeIds) {
    const numFeatures = rInt(4, 8)
    const shuffled = [...FEATURES].sort(() => rand() - 0.5).slice(0, numFeatures)
    for (const feat of shuffled) {
      const lastUsed = new Date()
      lastUsed.setDate(lastUsed.getDate() - rInt(0, 14))
      usageRows.push({
        id: rId(),
        customer_id: custId,
        feature_name: feat,
        usage_count: rInt(5, 480),
        last_used_at: lastUsed.toISOString(),
        month: currentMonth,
      })
    }
  }

  await supabase.from('feature_usage').upsert(usageRows, { onConflict: 'id' })
  console.log('[seed] feature_usage done')
  console.log('[seed] Complete!')
}
