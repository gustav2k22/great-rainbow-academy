-- ============================================================
-- 0002_cms.sql
-- Public-site CMS: settings, pages/sections, media, and all the
-- editable collections (departments, staff, gallery, events, etc.)
-- ============================================================

-- ---- Media library (everything lives in Supabase storage) -----
do $$
begin
  if not exists (select 1 from pg_type where typname = 'media_kind') then
    create type public.media_kind as enum ('image', 'video', 'document');
  end if;
end $$;

create table if not exists public.media_assets (
  id          uuid primary key default gen_random_uuid(),
  bucket      text not null default 'media',
  path        text not null,                 -- object path inside the bucket
  public_url  text not null,
  kind        public.media_kind not null default 'image',
  mime_type   text,
  title       text,
  alt         text,
  caption     text,
  folder      text default 'general',
  width       int,
  height      int,
  size_bytes  bigint,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  unique (bucket, path)
);

-- ---- Singleton site settings ----------------------------------
create table if not exists public.site_settings (
  id            int primary key default 1,
  school_name   text not null default 'Great Rainbow Academy',
  tagline       text not null default 'The Citadel of Learning',
  motto         text not null default 'Discipline and Commitment',
  logo_url      text,
  favicon_url   text,
  email         text,
  phones        text[] default '{}',
  address       text,
  whatsapp      text,
  social_links  jsonb not null default '{}'::jsonb,
  seo_title     text,
  seo_description text,
  og_image_url  text,
  primary_color text default '#6d28d9',
  data          jsonb not null default '{}'::jsonb,
  updated_at    timestamptz not null default now(),
  constraint site_settings_singleton check (id = 1)
);

drop trigger if exists trg_site_settings_updated on public.site_settings;
create trigger trg_site_settings_updated before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ---- Pages + flexible sections (SEO per page) -----------------
create table if not exists public.pages (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title           text not null,
  seo_title       text,
  seo_description text,
  og_image_url    text,
  is_published    boolean not null default true,
  sort_order      int not null default 0,
  updated_at      timestamptz not null default now()
);

drop trigger if exists trg_pages_updated on public.pages;
create trigger trg_pages_updated before update on public.pages
  for each row execute function public.set_updated_at();

create table if not exists public.page_sections (
  id           uuid primary key default gen_random_uuid(),
  page_slug    text not null,
  section_key  text not null,           -- e.g. 'hero', 'welcome', 'cta'
  heading      text,
  subheading   text,
  body         text,
  media_id     uuid references public.media_assets(id) on delete set null,
  data         jsonb not null default '{}'::jsonb,
  sort_order   int not null default 0,
  is_published boolean not null default true,
  updated_at   timestamptz not null default now(),
  unique (page_slug, section_key)
);

drop trigger if exists trg_page_sections_updated on public.page_sections;
create trigger trg_page_sections_updated before update on public.page_sections
  for each row execute function public.set_updated_at();

-- ---- Departments ----------------------------------------------
create table if not exists public.departments (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  tagline     text,
  description text,
  icon        text,
  color       text,
  image_id    uuid references public.media_assets(id) on delete set null,
  sort_order  int not null default 0,
  is_published boolean not null default true,
  updated_at  timestamptz not null default now()
);
drop trigger if exists trg_departments_updated on public.departments;
create trigger trg_departments_updated before update on public.departments
  for each row execute function public.set_updated_at();

-- ---- Subjects / academics -------------------------------------
create table if not exists public.subjects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  icon        text,
  sort_order  int not null default 0,
  is_published boolean not null default true
);

-- ---- Activities (indoor / outdoor) ----------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'activity_kind') then
    create type public.activity_kind as enum ('indoor', 'outdoor');
  end if;
end $$;

create table if not exists public.activities (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  kind        public.activity_kind not null default 'indoor',
  description text,
  icon        text,
  image_id    uuid references public.media_assets(id) on delete set null,
  sort_order  int not null default 0,
  is_published boolean not null default true
);

-- ---- Core values ----------------------------------------------
create table if not exists public.core_values (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  icon        text,
  sort_order  int not null default 0
);

-- ---- Staff shown on the public site ---------------------------
create table if not exists public.staff_members (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  position    text,
  department  text,
  bio         text,
  photo_id    uuid references public.media_assets(id) on delete set null,
  socials     jsonb not null default '{}'::jsonb,
  is_leadership boolean not null default false,
  sort_order  int not null default 0,
  is_published boolean not null default true,
  updated_at  timestamptz not null default now()
);
drop trigger if exists trg_staff_members_updated on public.staff_members;
create trigger trg_staff_members_updated before update on public.staff_members
  for each row execute function public.set_updated_at();

-- ---- Testimonials ---------------------------------------------
create table if not exists public.testimonials (
  id          uuid primary key default gen_random_uuid(),
  author      text not null,
  role        text,
  quote       text not null,
  photo_id    uuid references public.media_assets(id) on delete set null,
  rating      int default 5,
  sort_order  int not null default 0,
  is_published boolean not null default true
);

-- ---- Gallery: albums + items ----------------------------------
create table if not exists public.gallery_albums (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text unique not null,
  description text,
  cover_id    uuid references public.media_assets(id) on delete set null,
  sort_order  int not null default 0,
  is_published boolean not null default true,
  updated_at  timestamptz not null default now()
);
drop trigger if exists trg_gallery_albums_updated on public.gallery_albums;
create trigger trg_gallery_albums_updated before update on public.gallery_albums
  for each row execute function public.set_updated_at();

create table if not exists public.gallery_items (
  id          uuid primary key default gen_random_uuid(),
  album_id    uuid references public.gallery_albums(id) on delete cascade,
  media_id    uuid not null references public.media_assets(id) on delete cascade,
  caption     text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- ---- Events / activities board --------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'publish_status') then
    create type public.publish_status as enum ('draft', 'published', 'archived');
  end if;
end $$;

create table if not exists public.events (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text unique not null,
  summary      text,
  body         text,
  category     text default 'General',
  location     text,
  start_at     timestamptz,
  end_at       timestamptz,
  cover_id     uuid references public.media_assets(id) on delete set null,
  is_featured  boolean not null default false,
  status       public.publish_status not null default 'published',
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
drop trigger if exists trg_events_updated on public.events;
create trigger trg_events_updated before update on public.events
  for each row execute function public.set_updated_at();

-- ---- Newsletter: campaigns + subscribers ----------------------
create table if not exists public.newsletter_subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  full_name   text,
  status      text not null default 'subscribed',  -- subscribed | unsubscribed
  source      text default 'website',
  token       uuid not null default gen_random_uuid(),
  created_at  timestamptz not null default now()
);

create table if not exists public.newsletters (
  id          uuid primary key default gen_random_uuid(),
  subject     text not null,
  preview     text,
  body        text,
  status      public.publish_status not null default 'draft',
  sent_at     timestamptz,
  recipients  int default 0,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
drop trigger if exists trg_newsletters_updated on public.newsletters;
create trigger trg_newsletters_updated before update on public.newsletters
  for each row execute function public.set_updated_at();

-- ---- Contact messages -----------------------------------------
create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text,
  subject     text,
  message     text not null,
  status      text not null default 'new',  -- new | read | archived
  created_at  timestamptz not null default now()
);

-- ---- FAQs (extra: helps SEO + admissions) ---------------------
create table if not exists public.faqs (
  id          uuid primary key default gen_random_uuid(),
  question    text not null,
  answer      text not null,
  category    text default 'General',
  sort_order  int not null default 0,
  is_published boolean not null default true
);

-- ---- Site statistics counters (homepage "by the numbers") -----
create table if not exists public.site_stats (
  id          uuid primary key default gen_random_uuid(),
  label       text not null,
  value       text not null,
  icon        text,
  sort_order  int not null default 0
);

-- ============================================================
-- Indexes
-- ============================================================
create index if not exists idx_page_sections_page on public.page_sections(page_slug);
create index if not exists idx_gallery_items_album on public.gallery_items(album_id);
create index if not exists idx_events_status_start on public.events(status, start_at desc);
create index if not exists idx_media_folder on public.media_assets(folder);
