# Great Rainbow Academy 🌈

> The Citadel of Learning · Discipline and Commitment

A full-stack, production-grade **public website + School Management System (SMS)** for Great Rainbow Academy, built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Framer Motion and Supabase (Postgres + Auth + Storage).

Every section of the public website is editable from a role-aware admin dashboard, and the operational side of the school (students, classes, attendance, grades, fees, admissions) is managed from the same place.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Components, Server Actions) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + custom rainbow design system |
| Animation | Framer Motion (preloader, page transitions, reveals, lightbox) |
| Backend | Supabase Postgres (RLS), Auth, Storage |
| Validation | Zod |
| Icons | lucide-react |

Architecture is **feature-based clean architecture**: shared primitives in `src/components`, cross-cutting libs in `src/lib`, and self-contained features in `src/features/*` (auth, dashboard, gallery, media, public).

---

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

Environment variables live in `.env.local` (already provisioned for the project's Supabase instance).

### Database & content setup (already applied to the live project)

```bash
npm run db:migrate       # applies SQL in supabase/migrations (idempotent)
npm run media:upload     # uploads local assets to the Supabase 'media' bucket
npm run db:seed:users    # creates the four role accounts
```

The seed migration (`0005_seed.sql`) loads all real Great Rainbow Academy content.

---

## Staff portal accounts

Sign in at **/login**.

| Role | Email | Password | Access |
| --- | --- | --- | --- |
| System Administrator | `admin@greatrainbowacademy.com` | `Rainbow@Admin2025` | Everything (CMS, users, settings, SMS) |
| School Administrator | `principal@greatrainbowacademy.com` | `Rainbow@School2025` | CMS + SMS + fees |
| Teacher | `teacher@greatrainbowacademy.com` | `Rainbow@Teach2025` | Students, classes, attendance, grades |
| Staff | `staff@greatrainbowacademy.com` | `Rainbow@Staff2025` | Students, admissions, announcements, messages |

> Change these passwords from **Dashboard → Users & Roles** before going live.

---

## Features

### Public website (SEO-optimised, fully CMS-driven)
- Home, About, Departments, Academics, Activities, Admissions, Staff, Gallery, Events (+ detail), Contact
- Themed **preloader**, animated **page transitions**, scroll reveals
- **Aspect-ratio-aware** media containers, shimmer loading, blur-up fade-in
- Robust **lightbox / media viewer** (zoom, pan, keyboard nav, thumbnails, video)
- All media stored in **Supabase Storage** and served with long-lived caching + Next image optimisation
- Per-page metadata, `sitemap.xml`, `robots.txt`, Organization + Event **JSON-LD**
- Working **admission**, **contact** and **newsletter** forms

### Notifications & messaging (email + SMS)
- **Email** sends via **Resend** (primary) with automatic **SMTP** fallback. Set `RESEND_API_KEY` and/or `SMTP_*` in `.env.local`.
- **SMS** via a pluggable provider (`SMS_PROVIDER=arkesel|twilio|none`).
- Transactional notifications fire automatically on **new admission**, **new contact message** and **new subscriber** (with an applicant acknowledgement + subscriber welcome email).
- In **Dashboard → Site Settings → Notifications**, an admin chooses, per event, to deliver via **email, SMS, both or neither**, sets recipient emails/phones, and can send a **test** message.
- **Newsletters** are sent with a channel chooser (email / SMS / both); per-channel reach is recorded.
- Every send is written to a **delivery log** (`notifications_log`); when no provider is configured, sends are logged as `skipped` and nothing breaks.

### Role-aware dashboard
- **CMS:** Page content, Departments, Subjects, Activities, Core Values, Staff profiles, Testimonials, FAQs, Gallery, Media library, Site settings
- **Communications:** Announcements, Events, Newsletter (subscribers + campaigns), Messages inbox, Admissions pipeline
- **School Management:** Students, Classes, Attendance, Grades, Fees (invoices)
- **Administration:** Users & Roles, Site settings (system admin only)
- Access is enforced in the sidebar (per role), server-side via `requireAuth(roles)`, and by Postgres RLS.

---

## Project structure

```
src/
  app/
    (public)/      # marketing site (route group, public layout)
    (auth)/login/  # staff login
    dashboard/     # role-gated admin + SMS
    sitemap.ts robots.ts not-found.tsx
  components/      # ui primitives, media (smart-image, lightbox), dashboard, layout
  features/        # auth, public, gallery, media, dashboard (actions + UI)
  lib/             # supabase clients, auth guards, queries, types, utils
  proxy.ts         # session refresh + route protection (Next "proxy" middleware)
supabase/migrations/  # 0001 auth · 0002 cms · 0003 sms · 0004 rls · 0005 seed
scripts/           # migrate, upload-media, seed-users, e2e
```

---

## Testing

```bash
npm run build      # type-checks and builds the whole app
npm run e2e        # Playwright smoke test (home, contact write, login, CMS CRUD -> public site)
```

The e2e suite verifies a full vertical slice: a department created in the dashboard appears on the public site and is then removed.
