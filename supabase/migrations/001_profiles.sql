create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  uid uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  photo_url text,
  location text not null default 'Pune, Maharashtra',
  language text not null default 'en',
  crops text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles (email);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (uid, email, display_name, photo_url, location, language, crops)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', new.email),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', null),
    'Pune, Maharashtra',
    'en',
    ''
  )
  on conflict (uid) do update
    set email = excluded.email,
        display_name = excluded.display_name,
        photo_url = excluded.photo_url;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;

drop policy if exists "profiles are readable by owner" on public.profiles;
create policy "profiles are readable by owner"
on public.profiles
for select
using (auth.uid() = uid);

drop policy if exists "profiles are insertable by owner" on public.profiles;
create policy "profiles are insertable by owner"
on public.profiles
for insert
with check (auth.uid() = uid);

drop policy if exists "profiles are updatable by owner" on public.profiles;
create policy "profiles are updatable by owner"
on public.profiles
for update
using (auth.uid() = uid)
with check (auth.uid() = uid);

drop policy if exists "profiles are deletable by owner" on public.profiles;
create policy "profiles are deletable by owner"
on public.profiles
for delete
using (auth.uid() = uid);

