# Supabase Setup

This project now uses Supabase for:

- Authentication
- User profiles
- Transaction tracking
- Profile image storage

## Environment Variables

Add these to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=profile-images
```

## Database Schema

Run this in the Supabase SQL editor:

```sql
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  uid uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  photo_url text,
  location text default 'Pune, Maharashtra',
  language text default 'en',
  crops text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

alter table public.profiles enable row level security;
alter table public.transactions enable row level security;

create policy "profiles are readable by owner"
on public.profiles
for select
using (auth.uid() = uid);

create policy "profiles are insertable by owner"
on public.profiles
for insert
with check (auth.uid() = uid);

create policy "profiles are updatable by owner"
on public.profiles
for update
using (auth.uid() = uid)
with check (auth.uid() = uid);

create policy "transactions are readable by owner"
on public.transactions
for select
using (auth.uid() = user_id);

create policy "transactions are insertable by owner"
on public.transactions
for insert
with check (auth.uid() = user_id);

create policy "transactions are updatable by owner"
on public.transactions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "transactions are deletable by owner"
on public.transactions
for delete
using (auth.uid() = user_id);
```

## Storage

Create a public bucket named `profile-images`.

Recommended storage policy:

- Allow authenticated users to upload into paths prefixed with their own user id.

The app stores uploaded profile photos at:

```text
profile-images/<user-id>/<timestamp>-<filename>
```

## Auth Notes

- Email/password works immediately if email confirmation is disabled.
- If email confirmation is enabled, users may need to verify before a session is created.
- Google OAuth is now wired through the app, but you still need to add your redirect URL in Supabase Auth settings.
- Add these redirect URLs in Supabase:
  - `http://localhost:9002/auth/callback`
  - Your production callback URL, for example `https://your-domain.com/auth/callback`
- Make sure the Google provider is enabled in Supabase Auth and the OAuth client is configured in the Google Cloud console.
