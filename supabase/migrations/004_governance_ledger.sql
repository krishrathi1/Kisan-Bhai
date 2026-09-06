create table if not exists public.farmers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  district text,
  state text,
  language text not null default 'en',
  phone text,
  land_size_acres numeric(12,2),
  crops text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists farmers_district_idx on public.farmers (district);

drop trigger if exists set_farmers_updated_at on public.farmers;
create trigger set_farmers_updated_at
before update on public.farmers
for each row
execute function public.set_updated_at();

alter table public.farmers enable row level security;

drop policy if exists "farmers are readable by owner" on public.farmers;
create policy "farmers are readable by owner"
on public.farmers
for select
using (auth.uid() = user_id);

drop policy if exists "farmers are insertable by owner" on public.farmers;
create policy "farmers are insertable by owner"
on public.farmers
for insert
with check (auth.uid() = user_id);

drop policy if exists "farmers are updatable by owner" on public.farmers;
create policy "farmers are updatable by owner"
on public.farmers
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create table if not exists public.government_officers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  department text not null,
  designation text not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

alter table public.government_officers enable row level security;

create or replace function public.is_government_officer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.government_officers go
    where go.user_id = auth.uid()
      and go.status = 'active'
  );
$$;

drop policy if exists "government officers are readable by owner" on public.government_officers;
create policy "government officers are readable by owner"
on public.government_officers
for select
using (auth.uid() = user_id or public.is_government_officer());

drop policy if exists "government officers are insertable by owner" on public.government_officers;
create policy "government officers are insertable by owner"
on public.government_officers
for insert
with check (auth.uid() = user_id);

drop policy if exists "government officers are updatable by owner" on public.government_officers;
create policy "government officers are updatable by owner"
on public.government_officers
for update
using (auth.uid() = user_id or public.is_government_officer())
with check (auth.uid() = user_id or public.is_government_officer());

create table if not exists public.blockchain_records (
  transaction_id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id text not null,
  action text not null,
  actor text not null,
  actor_id uuid,
  actor_role text,
  timestamp timestamptz not null,
  previous_hash text not null,
  current_hash text not null unique,
  status text not null,
  metadata_hash text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists blockchain_records_entity_idx
on public.blockchain_records (entity_id, timestamp desc);

create index if not exists blockchain_records_current_hash_idx
on public.blockchain_records (current_hash);

alter table public.blockchain_records enable row level security;

drop policy if exists "blockchain records are publicly readable" on public.blockchain_records;
create policy "blockchain records are publicly readable"
on public.blockchain_records
for select
using (true);

drop policy if exists "blockchain records are insertable by authenticated users" on public.blockchain_records;
create policy "blockchain records are insertable by authenticated users"
on public.blockchain_records
for insert
with check (auth.role() = 'authenticated');

drop policy if exists "blockchain records are updatable by authenticated users" on public.blockchain_records;
create policy "blockchain records are updatable by authenticated users"
on public.blockchain_records
for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create table if not exists public.benefit_applications (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references public.farmers(user_id) on delete cascade,
  scheme_name text not null,
  scheme_code text,
  requested_amount numeric(12,2),
  approved_amount numeric(12,2),
  status text not null default 'pending',
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  officer_id uuid references auth.users(id) on delete set null,
  remarks text,
  ledger_transaction_id uuid references public.blockchain_records(transaction_id) on delete set null
);

create index if not exists benefit_applications_farmer_idx
on public.benefit_applications (farmer_id, submitted_at desc);

create index if not exists benefit_applications_status_idx
on public.benefit_applications (status, submitted_at desc);

alter table public.benefit_applications enable row level security;

drop policy if exists "benefit applications are readable by owner or officer" on public.benefit_applications;
create policy "benefit applications are readable by owner or officer"
on public.benefit_applications
for select
using (auth.uid() = farmer_id or public.is_government_officer());

drop policy if exists "benefit applications are insertable by owner" on public.benefit_applications;
create policy "benefit applications are insertable by owner"
on public.benefit_applications
for insert
with check (auth.uid() = farmer_id);

drop policy if exists "benefit applications are updatable by owner or officer" on public.benefit_applications;
create policy "benefit applications are updatable by owner or officer"
on public.benefit_applications
for update
using (auth.uid() = farmer_id or public.is_government_officer())
with check (auth.uid() = farmer_id or public.is_government_officer());

create table if not exists public.benefit_transactions (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.benefit_applications(id) on delete cascade,
  amount numeric(12,2) not null,
  transaction_ref text,
  status text not null default 'pending',
  paid_at timestamptz,
  ledger_transaction_id uuid references public.blockchain_records(transaction_id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists benefit_transactions_application_idx
on public.benefit_transactions (application_id, created_at desc);

alter table public.benefit_transactions enable row level security;

drop policy if exists "benefit transactions are readable by owner or officer" on public.benefit_transactions;
create policy "benefit transactions are readable by owner or officer"
on public.benefit_transactions
for select
using (
  exists (
    select 1
    from public.benefit_applications ba
    where ba.id = application_id
      and (ba.farmer_id = auth.uid() or public.is_government_officer())
  )
);

drop policy if exists "benefit transactions are insertable by authenticated users" on public.benefit_transactions;
create policy "benefit transactions are insertable by authenticated users"
on public.benefit_transactions
for insert
with check (auth.role() = 'authenticated');

drop policy if exists "benefit transactions are updatable by authenticated users" on public.benefit_transactions;
create policy "benefit transactions are updatable by authenticated users"
on public.benefit_transactions
for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create table if not exists public.produce_lots (
  lot_id text primary key,
  farmer_id uuid not null references public.farmers(user_id) on delete cascade,
  crop text not null,
  quantity numeric(12,2) not null,
  unit text not null,
  harvest_date date not null,
  location text not null,
  notes text,
  status text not null default 'registered',
  blockchain_record_id uuid references public.blockchain_records(transaction_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists produce_lots_farmer_idx
on public.produce_lots (farmer_id, created_at desc);

drop trigger if exists set_produce_lots_updated_at on public.produce_lots;
create trigger set_produce_lots_updated_at
before update on public.produce_lots
for each row
execute function public.set_updated_at();

alter table public.produce_lots enable row level security;

drop policy if exists "produce lots are publicly readable" on public.produce_lots;
create policy "produce lots are publicly readable"
on public.produce_lots
for select
using (true);

drop policy if exists "produce lots are insertable by owner" on public.produce_lots;
create policy "produce lots are insertable by owner"
on public.produce_lots
for insert
with check (auth.uid() = farmer_id);

drop policy if exists "produce lots are updatable by owner or officer" on public.produce_lots;
create policy "produce lots are updatable by owner or officer"
on public.produce_lots
for update
using (auth.uid() = farmer_id or public.is_government_officer())
with check (auth.uid() = farmer_id or public.is_government_officer());

create table if not exists public.supply_chain_events (
  id uuid primary key default gen_random_uuid(),
  lot_id text not null references public.produce_lots(lot_id) on delete cascade,
  stage text not null,
  actor_name text not null,
  actor_role text,
  location text,
  notes text,
  event_time timestamptz not null default now(),
  blockchain_record_id uuid references public.blockchain_records(transaction_id) on delete set null
);

create index if not exists supply_chain_events_lot_idx
on public.supply_chain_events (lot_id, event_time asc);

alter table public.supply_chain_events enable row level security;

drop policy if exists "supply chain events are publicly readable" on public.supply_chain_events;
create policy "supply chain events are publicly readable"
on public.supply_chain_events
for select
using (true);

drop policy if exists "supply chain events are insertable by authenticated users" on public.supply_chain_events;
create policy "supply chain events are insertable by authenticated users"
on public.supply_chain_events
for insert
with check (auth.role() = 'authenticated');

drop policy if exists "supply chain events are updatable by authenticated users" on public.supply_chain_events;
create policy "supply chain events are updatable by authenticated users"
on public.supply_chain_events
for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create table if not exists public.certifications (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references public.farmers(user_id) on delete cascade,
  lot_id text references public.produce_lots(lot_id) on delete set null,
  certification_type text not null,
  status text not null default 'pending',
  issued_at timestamptz,
  verified_at timestamptz,
  expiry_date timestamptz,
  blockchain_record_id uuid references public.blockchain_records(transaction_id) on delete set null
);

alter table public.certifications enable row level security;

drop policy if exists "certifications are publicly readable" on public.certifications;
create policy "certifications are publicly readable"
on public.certifications
for select
using (true);

drop policy if exists "certifications are insertable by authenticated users" on public.certifications;
create policy "certifications are insertable by authenticated users"
on public.certifications
for insert
with check (auth.role() = 'authenticated');

drop policy if exists "certifications are updatable by authenticated users" on public.certifications;
create policy "certifications are updatable by authenticated users"
on public.certifications
for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  actor_name text not null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_entity_idx
on public.audit_logs (entity_type, entity_id, created_at desc);

alter table public.audit_logs enable row level security;

drop policy if exists "audit logs are readable by owner or officer" on public.audit_logs;
create policy "audit logs are readable by owner or officer"
on public.audit_logs
for select
using (actor_id = auth.uid() or public.is_government_officer());

drop policy if exists "audit logs are insertable by authenticated users" on public.audit_logs;
create policy "audit logs are insertable by authenticated users"
on public.audit_logs
for insert
with check (auth.role() = 'authenticated');

