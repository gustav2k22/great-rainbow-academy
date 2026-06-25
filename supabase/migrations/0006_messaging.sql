-- ============================================================
-- 0006_messaging.sql
-- Email/SMS delivery: subscriber phones, newsletter channels,
-- notification preferences, and a delivery log.
-- ============================================================

-- Subscribers can opt in with a phone for SMS
alter table public.newsletter_subscribers add column if not exists phone text;

-- Newsletters: which channels were used + per-channel reach
alter table public.newsletters add column if not exists channels text[] not null default '{email}';
alter table public.newsletters add column if not exists email_count int not null default 0;
alter table public.newsletters add column if not exists sms_count int not null default 0;

-- Notification preferences live on the singleton settings row
alter table public.site_settings add column if not exists messaging jsonb not null default '{}'::jsonb;

update public.site_settings
set messaging = jsonb_build_object(
  'default_channels', jsonb_build_array('email'),
  'notify_emails', jsonb_build_array(coalesce(email, 'debbieasare8@gmail.com')),
  'notify_phones', jsonb_build_array(),
  'events', jsonb_build_object(
    'admission_submitted', jsonb_build_object('enabled', true, 'channels', jsonb_build_array('email'), 'ack_applicant', true),
    'contact_submitted',   jsonb_build_object('enabled', true, 'channels', jsonb_build_array('email')),
    'newsletter_subscribed', jsonb_build_object('enabled', false, 'channels', jsonb_build_array('email'), 'welcome', true)
  )
)
where id = 1 and (messaging is null or messaging = '{}'::jsonb);

-- Delivery log (auditing + admin visibility)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'delivery_status') then
    create type public.delivery_status as enum ('sent', 'failed', 'skipped');
  end if;
end $$;

create table if not exists public.notifications_log (
  id          uuid primary key default gen_random_uuid(),
  channel     text not null,                 -- email | sms
  category    text,                          -- admission | contact | newsletter | subscribe | test
  recipient   text not null,
  subject     text,
  status      public.delivery_status not null default 'sent',
  provider    text,                          -- resend | smtp | arkesel | twilio | none
  error       text,
  meta        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists idx_notifications_log_created on public.notifications_log(created_at desc);

-- RLS: staff can read the log; writes happen via service role only
alter table public.notifications_log enable row level security;
drop policy if exists "notif_log_staff_read" on public.notifications_log;
create policy "notif_log_staff_read" on public.notifications_log
  for select using (public.is_staff_member());
