-- Meridian Analytics — BI Dashboard Schema
-- Run this in your Supabase SQL Editor before seeding.

create extension if not exists "pgcrypto";

-- ── customers ──────────────────────────────────────────────────────────────
create table if not exists customers (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  domain          text,
  plan_tier       text not null check (plan_tier in ('starter','growth','enterprise')),
  mrr             numeric(10,2) not null default 0,
  health_score    integer not null default 100
                    check (health_score between 0 and 100),
  status          text not null default 'active'
                    check (status in ('active','at_risk','churned')),
  employee_count  integer,
  industry        text,
  country         text not null default 'US',
  account_manager text,
  signed_up_at    timestamptz not null,
  churned_at      timestamptz,
  created_at      timestamptz not null default now()
);

-- ── metrics_daily ──────────────────────────────────────────────────────────
create table if not exists metrics_daily (
  id                 uuid primary key default gen_random_uuid(),
  date               date not null unique,
  mrr                numeric(10,2) not null,
  new_mrr            numeric(10,2) not null default 0,
  expansion_mrr      numeric(10,2) not null default 0,
  contraction_mrr    numeric(10,2) not null default 0,
  churn_mrr          numeric(10,2) not null default 0,
  active_customers   integer not null,
  new_customers      integer not null default 0,
  churned_customers  integer not null default 0,
  dau                integer not null default 0,
  mau                integer not null default 0,
  created_at         timestamptz not null default now()
);

-- ── revenue_events ─────────────────────────────────────────────────────────
create table if not exists revenue_events (
  id            uuid primary key default gen_random_uuid(),
  customer_id   uuid references customers(id) on delete set null,
  customer_name text not null,
  event_type    text not null
                  check (event_type in ('new','expansion','contraction','churn','reactivation')),
  mrr_change    numeric(10,2) not null,
  previous_mrr  numeric(10,2),
  new_mrr       numeric(10,2),
  plan_from     text,
  plan_to       text,
  occurred_at   timestamptz not null,
  created_at    timestamptz not null default now()
);

-- ── sales_pipeline ─────────────────────────────────────────────────────────
create table if not exists sales_pipeline (
  id                   uuid primary key default gen_random_uuid(),
  company_name         text not null,
  contact_name         text not null,
  contact_email        text,
  stage                text not null
                         check (stage in ('lead','qualified','demo','proposal',
                                          'negotiation','closed_won','closed_lost')),
  deal_value           numeric(10,2) not null,
  probability          integer not null default 50
                         check (probability between 0 and 100),
  expected_close_date  date,
  owner                text not null,
  source               text check (source in ('inbound','outbound','referral','partner')),
  notes                text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ── feature_usage ──────────────────────────────────────────────────────────
create table if not exists feature_usage (
  id            uuid primary key default gen_random_uuid(),
  customer_id   uuid not null references customers(id) on delete cascade,
  feature_name  text not null,
  usage_count   integer not null default 0,
  last_used_at  timestamptz,
  month         date not null,
  created_at    timestamptz not null default now(),
  unique(customer_id, feature_name, month)
);

-- ── RLS: read-only for anon ────────────────────────────────────────────────
alter table customers       enable row level security;
alter table metrics_daily   enable row level security;
alter table revenue_events  enable row level security;
alter table sales_pipeline  enable row level security;
alter table feature_usage   enable row level security;

create policy "anon_read_customers"
  on customers for select to anon using (true);
create policy "anon_read_metrics_daily"
  on metrics_daily for select to anon using (true);
create policy "anon_read_revenue_events"
  on revenue_events for select to anon using (true);
create policy "anon_read_sales_pipeline"
  on sales_pipeline for select to anon using (true);
create policy "anon_read_feature_usage"
  on feature_usage for select to anon using (true);

-- Allow anon INSERT for seeding (remove in production)
create policy "anon_insert_customers"
  on customers for insert to anon with check (true);
create policy "anon_insert_metrics_daily"
  on metrics_daily for insert to anon with check (true);
create policy "anon_insert_revenue_events"
  on revenue_events for insert to anon with check (true);
create policy "anon_insert_sales_pipeline"
  on sales_pipeline for insert to anon with check (true);
create policy "anon_insert_feature_usage"
  on feature_usage for insert to anon with check (true);

-- Allow upsert (update for seed re-runs)
create policy "anon_update_customers"
  on customers for update to anon using (true);
create policy "anon_update_metrics_daily"
  on metrics_daily for update to anon using (true);
create policy "anon_update_revenue_events"
  on revenue_events for update to anon using (true);
create policy "anon_update_sales_pipeline"
  on sales_pipeline for update to anon using (true);
create policy "anon_update_feature_usage"
  on feature_usage for update to anon using (true);
