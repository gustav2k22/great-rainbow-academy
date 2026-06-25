-- ============================================================
-- 0004_rls.sql
-- Row Level Security for every table.
-- Note: privileged dashboard writes go through the service-role
-- client (bypasses RLS); these policies are defense-in-depth and
-- enable safe direct reads from the public/anon client.
-- ============================================================

-- Helper: enable RLS + drop existing policies for a clean re-run
create or replace function public._reset_rls(tbl text)
returns void language plpgsql as $$
declare p record;
begin
  execute format('alter table public.%I enable row level security', tbl);
  for p in select policyname from pg_policies where schemaname='public' and tablename=tbl loop
    execute format('drop policy if exists %I on public.%I', p.policyname, tbl);
  end loop;
end $$;

-- ---------- GROUP A: public-readable CMS content ----------------
-- anyone can read; only admins can write.
do $$
declare t text;
begin
  foreach t in array array[
    'site_settings','pages','page_sections','departments','subjects',
    'activities','core_values','staff_members','testimonials',
    'gallery_albums','gallery_items','events','faqs','site_stats','media_assets'
  ] loop
    perform public._reset_rls(t);
    execute format('create policy "%s_public_read" on public.%I for select using (true)', t, t);
    execute format('create policy "%s_admin_write" on public.%I for all using (public.is_admin()) with check (public.is_admin())', t, t);
  end loop;
end $$;

-- ---------- GROUP B: public can submit, staff can manage --------
-- newsletter_subscribers
select public._reset_rls('newsletter_subscribers');
create policy "subs_public_insert" on public.newsletter_subscribers
  for insert with check (true);
create policy "subs_self_update" on public.newsletter_subscribers
  for update using (true) with check (true);
create policy "subs_admin_read" on public.newsletter_subscribers
  for select using (public.is_staff_member());
create policy "subs_admin_delete" on public.newsletter_subscribers
  for delete using (public.is_admin());

-- contact_messages
select public._reset_rls('contact_messages');
create policy "contact_public_insert" on public.contact_messages
  for insert with check (true);
create policy "contact_staff_read" on public.contact_messages
  for select using (public.is_staff_member());
create policy "contact_staff_manage" on public.contact_messages
  for update using (public.is_staff_member()) with check (public.is_staff_member());
create policy "contact_admin_delete" on public.contact_messages
  for delete using (public.is_admin());

-- admission_applications (public apply, staff manage)
select public._reset_rls('admission_applications');
create policy "adm_public_insert" on public.admission_applications
  for insert with check (true);
create policy "adm_staff_read" on public.admission_applications
  for select using (public.is_staff_member());
create policy "adm_staff_manage" on public.admission_applications
  for update using (public.is_staff_member()) with check (public.is_staff_member());
create policy "adm_admin_delete" on public.admission_applications
  for delete using (public.is_admin());

-- ---------- GROUP C: staff-only operational data ----------------
do $$
declare t text;
begin
  foreach t in array array[
    'academic_years','terms','school_classes','students','attendance',
    'exams','grades','timetable_entries','announcements'
  ] loop
    perform public._reset_rls(t);
    execute format('create policy "%s_staff_read" on public.%I for select using (public.is_staff_member())', t, t);
    execute format('create policy "%s_staff_write" on public.%I for all using (public.is_staff_member()) with check (public.is_staff_member())', t, t);
  end loop;
end $$;

-- ---------- GROUP D: admin-only finance + campaigns -------------
do $$
declare t text;
begin
  foreach t in array array[
    'fee_structures','fee_invoices','payments','newsletters'
  ] loop
    perform public._reset_rls(t);
    execute format('create policy "%s_staff_read" on public.%I for select using (public.is_staff_member())', t, t);
    execute format('create policy "%s_admin_write" on public.%I for all using (public.is_admin()) with check (public.is_admin())', t, t);
  end loop;
end $$;
