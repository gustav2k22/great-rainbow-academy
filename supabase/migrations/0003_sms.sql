-- ============================================================
-- 0003_sms.sql
-- School Management System core: academic calendar, classes,
-- students, admissions, attendance, exams/grades, fees, timetable.
-- ============================================================

-- ---- Academic years & terms -----------------------------------
create table if not exists public.academic_years (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,          -- "2024/2025"
  start_date  date,
  end_date    date,
  is_current  boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists public.terms (
  id               uuid primary key default gen_random_uuid(),
  academic_year_id uuid references public.academic_years(id) on delete cascade,
  name             text not null,     -- "First Term"
  start_date       date,
  end_date         date,
  is_current       boolean not null default false
);

-- ---- Classes (e.g. Basic 1, JHS 2) ----------------------------
create table if not exists public.school_classes (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  level        text,                  -- Nursery | KG | Primary | JHS
  capacity     int default 40,
  teacher_id   uuid references public.profiles(id) on delete set null,
  academic_year_id uuid references public.academic_years(id) on delete set null,
  created_at   timestamptz not null default now()
);

-- ---- Students -------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'student_status') then
    create type public.student_status as enum ('active', 'graduated', 'withdrawn', 'suspended');
  end if;
  if not exists (select 1 from pg_type where typname = 'gender_type') then
    create type public.gender_type as enum ('male', 'female', 'other');
  end if;
end $$;

create table if not exists public.students (
  id             uuid primary key default gen_random_uuid(),
  student_no     text unique not null,
  first_name     text not null,
  last_name      text not null,
  gender         public.gender_type,
  date_of_birth  date,
  class_id       uuid references public.school_classes(id) on delete set null,
  photo_id       uuid references public.media_assets(id) on delete set null,
  guardian_name  text,
  guardian_phone text,
  guardian_email text,
  address        text,
  admission_date date default now(),
  status         public.student_status not null default 'active',
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
drop trigger if exists trg_students_updated on public.students;
create trigger trg_students_updated before update on public.students
  for each row execute function public.set_updated_at();

-- ---- Admissions pipeline --------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'admission_stage') then
    create type public.admission_stage as enum
      ('new', 'under_review', 'assessment', 'accepted', 'rejected', 'enrolled');
  end if;
end $$;

create table if not exists public.admission_applications (
  id              uuid primary key default gen_random_uuid(),
  reference       text unique not null default ('GRA-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
  child_first_name text not null,
  child_last_name  text not null,
  gender          public.gender_type,
  date_of_birth   date,
  applying_for    text,               -- target class/level
  parent_name     text not null,
  parent_phone    text not null,
  parent_email    text,
  previous_school text,
  address         text,
  message         text,
  documents       jsonb not null default '[]'::jsonb,  -- array of media refs
  stage           public.admission_stage not null default 'new',
  notes           text,
  reviewed_by     uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
drop trigger if exists trg_admissions_updated on public.admission_applications;
create trigger trg_admissions_updated before update on public.admission_applications
  for each row execute function public.set_updated_at();

-- ---- Attendance -----------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'attendance_status') then
    create type public.attendance_status as enum ('present', 'absent', 'late', 'excused');
  end if;
end $$;

create table if not exists public.attendance (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.students(id) on delete cascade,
  class_id    uuid references public.school_classes(id) on delete set null,
  date        date not null default now(),
  status      public.attendance_status not null default 'present',
  recorded_by uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  unique (student_id, date)
);
create index if not exists idx_attendance_class_date on public.attendance(class_id, date);

-- ---- Exams & grades -------------------------------------------
create table if not exists public.exams (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,          -- "Mid-Term Exam"
  term_id     uuid references public.terms(id) on delete set null,
  class_id    uuid references public.school_classes(id) on delete cascade,
  max_score   numeric default 100,
  created_at  timestamptz not null default now()
);

create table if not exists public.grades (
  id          uuid primary key default gen_random_uuid(),
  exam_id     uuid references public.exams(id) on delete cascade,
  student_id  uuid references public.students(id) on delete cascade,
  subject_id  uuid references public.subjects(id) on delete set null,
  subject_name text,
  score       numeric,
  grade       text,
  remark      text,
  recorded_by uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists idx_grades_student on public.grades(student_id);

-- ---- Fees -----------------------------------------------------
create table if not exists public.fee_structures (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  level       text,
  term_id     uuid references public.terms(id) on delete set null,
  amount      numeric not null default 0,
  description text,
  created_at  timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_type where typname = 'invoice_status') then
    create type public.invoice_status as enum ('unpaid', 'partial', 'paid', 'overdue');
  end if;
end $$;

create table if not exists public.fee_invoices (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.students(id) on delete cascade,
  fee_structure_id uuid references public.fee_structures(id) on delete set null,
  term_id     uuid references public.terms(id) on delete set null,
  amount      numeric not null default 0,
  amount_paid numeric not null default 0,
  due_date    date,
  status      public.invoice_status not null default 'unpaid',
  created_at  timestamptz not null default now()
);
create index if not exists idx_invoices_student on public.fee_invoices(student_id);

create table if not exists public.payments (
  id          uuid primary key default gen_random_uuid(),
  invoice_id  uuid references public.fee_invoices(id) on delete cascade,
  amount      numeric not null,
  method      text default 'cash',
  reference   text,
  paid_at     timestamptz not null default now(),
  recorded_by uuid references public.profiles(id) on delete set null
);

-- ---- Timetable ------------------------------------------------
create table if not exists public.timetable_entries (
  id          uuid primary key default gen_random_uuid(),
  class_id    uuid references public.school_classes(id) on delete cascade,
  day_of_week int not null,           -- 1=Mon .. 7=Sun
  start_time  time,
  end_time    time,
  subject_name text not null,
  teacher_id  uuid references public.profiles(id) on delete set null,
  room        text
);

-- ---- Internal announcements / notices -------------------------
create table if not exists public.announcements (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  body        text,
  audience    text not null default 'all',  -- all | staff | teachers | parents
  is_pinned   boolean not null default false,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);
