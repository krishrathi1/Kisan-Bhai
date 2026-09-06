create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  amount numeric(12,2) not null check (amount > 0),
  type text not null check (type in ('income', 'expense')),
  category text not null,
  date timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists transactions_user_date_idx
on public.transactions (user_id, date desc);

create index if not exists transactions_user_created_idx
on public.transactions (user_id, created_at desc);

drop trigger if exists set_transactions_updated_at on public.transactions;
create trigger set_transactions_updated_at
before update on public.transactions
for each row
execute function public.set_updated_at();

alter table public.transactions enable row level security;

drop policy if exists "transactions are readable by owner" on public.transactions;
create policy "transactions are readable by owner"
on public.transactions
for select
using (auth.uid() = user_id);

drop policy if exists "transactions are insertable by owner" on public.transactions;
create policy "transactions are insertable by owner"
on public.transactions
for insert
with check (auth.uid() = user_id);

drop policy if exists "transactions are updatable by owner" on public.transactions;
create policy "transactions are updatable by owner"
on public.transactions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "transactions are deletable by owner" on public.transactions;
create policy "transactions are deletable by owner"
on public.transactions
for delete
using (auth.uid() = user_id);

