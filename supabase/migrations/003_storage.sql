-- Supabase Storage Configuration for Profile Images

-- 1. Create or update the storage bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-images',
  'profile-images',
  true,
  5242880, -- 5MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 2. Drop existing policies to prevent conflicts
drop policy if exists "profile images are publicly readable" on storage.objects;
drop policy if exists "authenticated users can upload their own images" on storage.objects;
drop policy if exists "authenticated users can update their own images" on storage.objects;
drop policy if exists "authenticated users can delete their own images" on storage.objects;

-- 3. Public read policy for profile images
create policy "profile images are publicly readable"
on storage.objects
for select
using (bucket_id = 'profile-images');

-- 4. Authenticated insert policy (folder must match auth.uid)
create policy "authenticated users can upload their own images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'profile-images'
  and split_part(name, '/', 1) = auth.uid()::text
);

-- 5. Authenticated update policy
create policy "authenticated users can update their own images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'profile-images'
  and split_part(name, '/', 1) = auth.uid()::text
)
with check (
  bucket_id = 'profile-images'
  and split_part(name, '/', 1) = auth.uid()::text
);

-- 6. Authenticated delete policy
create policy "authenticated users can delete their own images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'profile-images'
  and split_part(name, '/', 1) = auth.uid()::text
);
