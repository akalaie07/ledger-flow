-- =============================================================================
-- Kalaie Ledger Beta — Initial Schema
--
-- Eigenständige Beta-Datenbank für den nativen Stripe-Checkout (1 Pilot-
-- Organisation). Bewusst klein gehalten — kein CSV-Import, kein Mahnwesen,
-- keine Closer/Sales-Partner. organization_id ist trotzdem überall dabei,
-- damit das Schema später ohne Umbau multi-tenant-fähig bleibt.
--
-- Eine Zahlung (Einmalbetrag ODER Anzahlung+Rate) ist immer eine Zeile in
-- `installments` — auch eine reine Einmalzahlung ist einfach eine einzelne
-- Installment-Zeile (sequence 1). Dadurch gibt es nur eine Quelle für
-- "was ist bezahlt/offen/überfällig" statt zwei parallele Konzepte.
-- =============================================================================

-- =============================================================================
-- 1. Enums
-- =============================================================================
create type payment_type_enum as enum ('one_time', 'installments');

-- =============================================================================
-- 2. Tabellen
-- =============================================================================

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  stripe_account_id text unique,
  stripe_connected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete restrict,
  email text not null,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index profiles_org_idx on profiles(organization_id);

create table products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  description text,
  price_amount numeric(12,2) not null check (price_amount >= 0),
  payment_type payment_type_enum not null default 'one_time',
  down_payment numeric(12,2) check (down_payment >= 0),
  installment_count int check (installment_count > 0),
  installment_interval_days int check (installment_interval_days > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_installment_fields_check check (
    payment_type <> 'installments'
    or (down_payment is not null and installment_count is not null and installment_interval_days is not null)
  )
);
create index products_org_idx on products(organization_id);

create table customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  email text not null,
  name text not null,
  phone text,
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, email)
);
create index customers_org_idx on customers(organization_id);

create table deals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete restrict,
  product_id uuid references products(id) on delete set null,
  -- Snapshot zum Kaufzeitpunkt — spätere Preisänderungen am Produkt dürfen
  -- bestehende Deals nicht verändern.
  total_price numeric(12,2) not null check (total_price >= 0),
  payment_type payment_type_enum not null,
  down_payment numeric(12,2) check (down_payment >= 0),
  stripe_checkout_session_id text unique,
  refunded boolean not null default false,
  cancelled boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index deals_org_idx on deals(organization_id, created_at);
create index deals_customer_idx on deals(customer_id);

create table installments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  deal_id uuid not null references deals(id) on delete cascade,
  sequence int not null check (sequence > 0),
  due_date date not null,
  amount numeric(12,2) not null check (amount >= 0),
  paid boolean not null default false,
  paid_at timestamptz,
  stripe_payment_intent_id text unique,
  failed_attempts int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (deal_id, sequence)
);
create index installments_org_due_idx on installments(organization_id, due_date);
create index installments_deal_idx on installments(deal_id);

create table webhook_events (
  id uuid primary key default gen_random_uuid(),
  -- Nullable: wird erst nach Account-Lookup aus dem Event gesetzt; ein Event
  -- für einen unbekannten Account soll trotzdem geloggt werden, nicht verworfen.
  organization_id uuid references organizations(id) on delete set null,
  stripe_event_id text unique not null,
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz,
  error text,
  created_at timestamptz not null default now()
);
create index webhook_events_org_idx on webhook_events(organization_id);

-- =============================================================================
-- 3. updated_at-Trigger
-- =============================================================================
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare t text;
begin
  for t in select unnest(array[
    'organizations','profiles','products','customers','deals','installments'
  ]) loop
    execute format(
      'create trigger %I_set_updated_at before update on %I for each row execute function set_updated_at()',
      t || '_uat', t
    );
  end loop;
end$$;

-- =============================================================================
-- 4. Auth-Helper — wird von den RLS-Policies verwendet
-- =============================================================================
create or replace function public.auth_org_id() returns uuid
language sql stable security definer set search_path = public
as $$ select organization_id from public.profiles where id = auth.uid() $$;

-- =============================================================================
-- 5. RLS aktivieren (force = auch für den Tabellen-Owner)
-- =============================================================================
alter table organizations  enable row level security;
alter table organizations  force row level security;
alter table profiles       enable row level security;
alter table profiles       force row level security;
alter table products       enable row level security;
alter table products       force row level security;
alter table customers      enable row level security;
alter table customers      force row level security;
alter table deals          enable row level security;
alter table deals          force row level security;
alter table installments   enable row level security;
alter table installments   force row level security;
alter table webhook_events enable row level security;
alter table webhook_events force row level security;

-- =============================================================================
-- 6. RLS-Policies
--
-- Bewusst einfach: in der Beta gibt es nur eine Organisation und keine
-- Rollen-Differenzierung. customers/deals/installments werden ausschließlich
-- vom Webhook-Handler über den Service-Role-Client geschrieben (umgeht RLS) —
-- eingeloggte User bekommen dafür nur SELECT.
-- =============================================================================

create policy organizations_select_own
  on organizations for select
  using (id = auth_org_id());

create policy profiles_select_own_org
  on profiles for select
  using (organization_id = auth_org_id());

create policy products_select_org
  on products for select
  using (organization_id = auth_org_id());
create policy products_modify_org
  on products for all
  using (organization_id = auth_org_id())
  with check (organization_id = auth_org_id());

create policy customers_select_org
  on customers for select
  using (organization_id = auth_org_id());

create policy deals_select_org
  on deals for select
  using (organization_id = auth_org_id());

create policy installments_select_org
  on installments for select
  using (organization_id = auth_org_id());

-- webhook_events: keine Policy für eingeloggte User. Nur der
-- Service-Role-Client (Webhook-Handler, Cron-Job) liest/schreibt hier.

-- =============================================================================
-- 7. View — Status wird berechnet, nicht manuell gepflegt
-- =============================================================================
create or replace view deal_balance with (security_invoker = on) as
select
  d.id as deal_id,
  d.organization_id,
  coalesce((select sum(amount) from installments where deal_id = d.id and paid), 0) as paid_sum,
  coalesce((select sum(amount) from installments where deal_id = d.id and not paid), 0) as open_sum,
  coalesce((select sum(amount) from installments where deal_id = d.id and not paid and due_date < current_date), 0) as overdue_sum,
  exists (select 1 from installments where deal_id = d.id and not paid and due_date < current_date) as has_overdue
from deals d;

create or replace view deals_with_status with (security_invoker = on) as
select
  d.*,
  b.paid_sum,
  b.open_sum,
  b.overdue_sum,
  b.has_overdue,
  case
    when d.refunded then 'refunded'
    when d.cancelled then 'cancelled'
    when b.open_sum = 0 then 'paid'
    when b.has_overdue then 'overdue'
    else 'open'
  end as computed_status
from deals d
left join deal_balance b on b.deal_id = d.id;
