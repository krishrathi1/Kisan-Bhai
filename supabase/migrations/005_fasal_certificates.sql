-- Migration: Fasal Certificates (off-chain storage)
-- Stores the human-readable certificate data.
-- The blockchain stores ONLY the certificate ID, data hash, and timestamp.

create table if not exists public.fasal_certificates (
  id text primary key,                         -- e.g. BM-WHT-2026-001
  user_id uuid not null,                       -- owner farmer
  crop text not null,
  quantity text not null,                       -- e.g. "18 Quintal"
  harvest_date text not null,                  -- ISO date string
  location text not null,
  photo_url text,                              -- optional crop photo
  data_hash text not null,                     -- SHA-256 fingerprint
  transaction_hash text,                       -- blockchain tx hash (null in demo)
  is_demo boolean not null default true,       -- true when no real blockchain tx
  created_at timestamptz not null default now()
);

create index if not exists fasal_certificates_user_idx
  on public.fasal_certificates (user_id, created_at desc);

create index if not exists fasal_certificates_hash_idx
  on public.fasal_certificates (data_hash);

alter table public.fasal_certificates enable row level security;

-- Anyone can read certificates (public verification)
drop policy if exists "fasal certificates are publicly readable" on public.fasal_certificates;
create policy "fasal certificates are publicly readable"
  on public.fasal_certificates for select
  using (true);

-- Authenticated users can insert their own certificates
drop policy if exists "fasal certificates insertable by owner" on public.fasal_certificates;
create policy "fasal certificates insertable by owner"
  on public.fasal_certificates for insert
  with check (auth.uid() = user_id);
