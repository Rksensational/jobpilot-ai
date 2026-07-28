-- ============================================================
-- JobPilot AI — Level 1 Schema
-- Run this in Supabase SQL Editor (free tier project)
-- Covers: auth (handled by Supabase Auth itself) + Resume Analyzer
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- RESUMES
-- ============================================================
create table if not exists public.resumes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_type text not null check (file_type in ('pdf', 'docx')),
  raw_text text,
  parsed_json jsonb,
  is_active boolean default true,
  created_at timestamptz default now()
);

create index if not exists idx_resumes_user on public.resumes(user_id);

-- ============================================================
-- SKILLS (normalized, shared across users)
-- ============================================================
create table if not exists public.skills (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null
);

create table if not exists public.resume_skills (
  resume_id uuid references public.resumes(id) on delete cascade,
  skill_id uuid references public.skills(id) on delete cascade,
  primary key (resume_id, skill_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.resumes enable row level security;
alter table public.resume_skills enable row level security;
alter table public.skills enable row level security;

create policy "own resumes" on public.resumes
  for all using (auth.uid() = user_id);

create policy "own resume skills" on public.resume_skills
  for all using (
    auth.uid() = (select user_id from public.resumes where id = resume_id)
  );

create policy "read skills" on public.skills
  for select using (auth.role() = 'authenticated');

-- Skills are written by the backend using the service-role key, which
-- bypasses RLS entirely, so no insert policy is needed for normal users.

-- ============================================================
-- STORAGE BUCKET
-- Run this separately if the SQL editor errors on storage schema access —
-- otherwise create the bucket manually in Dashboard > Storage instead:
--   Name: resumes | Public: OFF
-- ============================================================
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

create policy "users manage own resume files"
on storage.objects for all
using (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1])
with check (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);
