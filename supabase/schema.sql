-- =====================================================================
-- Acadia Care website: Supabase schema
-- Run once in Supabase Dashboard → SQL Editor → New query → Run.
-- Safe to re-run (idempotent).
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- Admins (by email) ----------
create table if not exists public.admins (
  email text primary key,
  created_at timestamptz not null default now()
);
insert into public.admins (email) values ('care@acadiacare.co.uk') on conflict do nothing;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins a where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------- CMS content ----------
create table if not exists public.site_content (
  key text primary key,                       -- 'global' or 'page:<name>'
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by text default (auth.jwt() ->> 'email')
);
insert into public.site_content (key, data) values ('global', '{}'::jsonb) on conflict do nothing;

create table if not exists public.pages (
  slug text primary key check (slug ~ '^[a-z0-9-]{1,80}$'),
  title text not null,
  intro text,
  body text,
  meta_description text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Form submissions (written by the server with the service key) ----------
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  form_type text, name text not null, email text not null, phone text,
  type text, type_label text, message text, page text,
  status text not null default 'new', notes text
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  first_name text not null, last_name text not null, email text not null, phone text,
  address text, city text, postcode text, role text,
  right_to_work text, driving_licence text, vehicle text, dbs text,
  experience_level text, experience_detail text, qualifications text,
  start_date text, work_pattern text, employment_type text, travel text, cover_note text,
  files jsonb not null default '[]'::jsonb,
  status text not null default 'new', notes text
);
create index if not exists applications_created_idx on public.applications (created_at desc);
create index if not exists enquiries_created_idx on public.enquiries (created_at desc);

-- ---------- Row Level Security ----------
alter table public.admins enable row level security;
alter table public.site_content enable row level security;
alter table public.pages enable row level security;
alter table public.enquiries enable row level security;
alter table public.applications enable row level security;

drop policy if exists "admins read" on public.admins;
create policy "admins read" on public.admins for select to authenticated using (public.is_admin());
drop policy if exists "admins manage" on public.admins;
create policy "admins manage" on public.admins for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "content public read" on public.site_content;
create policy "content public read" on public.site_content for select to anon, authenticated using (true);
drop policy if exists "content admin write" on public.site_content;
create policy "content admin write" on public.site_content for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "pages public read" on public.pages;
create policy "pages public read" on public.pages for select to anon, authenticated using (published or public.is_admin());
drop policy if exists "pages admin write" on public.pages;
create policy "pages admin write" on public.pages for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "enquiries admin" on public.enquiries;
create policy "enquiries admin" on public.enquiries for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "applications admin" on public.applications;
create policy "applications admin" on public.applications for all to authenticated using (public.is_admin()) with check (public.is_admin());

grant select on public.site_content, public.pages to anon;
grant select, insert, update, delete on public.site_content, public.pages, public.enquiries, public.applications, public.admins to authenticated;

-- ---------- Storage ----------
-- media: public images/videos used on the website (admins upload)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 52428800, array['image/jpeg','image/png','image/webp','image/gif','image/svg+xml','image/avif','video/mp4','video/webm'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- applications: PRIVATE CVs and documents. Visitors can upload, never read.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('applications', 'applications', false, 5242880, array['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','image/jpeg','image/png','application/octet-stream'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects for select to anon, authenticated using (bucket_id = 'media');
drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects for update to authenticated using (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects for delete to authenticated using (bucket_id = 'media' and public.is_admin());

drop policy if exists "applications visitor upload" on storage.objects;
create policy "applications visitor upload" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'applications' and name like 'incoming/%');
drop policy if exists "applications admin read" on storage.objects;
create policy "applications admin read" on storage.objects for select to authenticated using (bucket_id = 'applications' and public.is_admin());
drop policy if exists "applications admin delete" on storage.objects;
create policy "applications admin delete" on storage.objects for delete to authenticated using (bucket_id = 'applications' and public.is_admin());
