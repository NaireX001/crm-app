# CRM App

Personal CRM platform. Next.js (App Router, TypeScript) + Tailwind CSS + Supabase.

## Setup (run these in VS Code's terminal, inside this folder)

```bash
npm install
```

This installs Next.js, React, Tailwind, and the Supabase client libraries listed in `package.json`.

Your Supabase credentials are already in `.env.local` (git-ignored, never committed). If you rotate keys later, update that file.

Start the dev server:

```bash
npm run dev
```

Then open http://localhost:3000 — you should see "Supabase env vars: detected" in green, confirming the app can read your Supabase config.

## Git

This folder isn't a git repo yet. Initialize it and make the first commit:

```bash
git init
git add -A
git commit -m "Initial commit: Next.js + Tailwind + Supabase scaffold"
```

Then create an empty repo on GitHub (no README/gitignore) and push:

```bash
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
```

## Project structure

```
app/                  Next.js App Router routes
  layout.tsx           Root layout
  page.tsx              Home page (Supabase connection check)
  globals.css            Tailwind entry point
components/
  ui/                     Reusable, unstyled-opinion UI primitives (Button, etc.)
  layout/                 Layout building blocks (Container, etc.)
lib/
  supabase/
    client.ts              Browser Supabase client (Client Components)
    server.ts               Server Supabase client (Server Components/Actions)
    middleware.ts             Session refresh helper used by middleware.ts
    admin.ts                   Service-role client — SERVER-ONLY, bypasses RLS
  types/                    Shared TypeScript types (e.g. generated DB types, later)
  utils.ts                  Shared helpers (cn() class merger)
middleware.ts           Refreshes the Supabase auth session on every request
```

## Environment variables

| Variable | Where used | Safe for browser? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | Yes (respects Row Level Security) |
| `SUPABASE_SERVICE_ROLE_KEY` | server only (`lib/supabase/admin.ts`) | **No — bypasses RLS, never expose** |

## Status

- [x] Next.js + TypeScript + App Router + Tailwind scaffolded
- [x] Project structure (app/components/lib) in place
- [x] Supabase client/server/admin helpers wired to your project
- [x] Database schema (contacts, companies, deals, pipeline stages, activities, tasks) — see `supabase/schema.sql`
- [x] Auth (login/signup, role-based access) — email/password via Supabase Auth, routes protected in `middleware.ts`
- [x] Core UI screens — dashboard (real data), contacts (list/search/detail/activities/tasks), companies (list/detail), deals (kanban pipeline, drag or dropdown to change stage), tasks (list, complete/delete)
- [x] Design pass (dashboard) — dark sidebar + top bar shell matching Figma, task priority field added
- [x] Advanced contacts features — sortable/paginated data table, bulk actions, filters, CSV import, custom fields, Smart Lists (saved views)
- [x] Contact detail v2 — prev/next navigation, followers, owner reassign, Do Not Disturb flags, collapsible/searchable fields, real file attachments (Supabase Storage), plus visual-only placeholders for Conversations/Calendar/Payments/Automations/AI so nothing looks missing from the layout
- [ ] Deploy to Vercel

## Required manual step: create the file storage bucket

Contact file attachments need a Storage bucket that doesn't exist by default:

1. Supabase Dashboard → Storage → "New bucket"
2. Name it exactly `contact-files`
3. Make it **private** (not public) — files are only ever accessed through signed URLs your account generates
4. Click Create

Until this bucket exists, uploads on a contact's page will show an error explaining this same thing.

## Contact detail v2 notes

- **Prev/Next**: arrows + position counter (e.g. "3/47") next to the delete button, ordered by creation date.
- **Owner**: visible to everyone; only admins get a dropdown to reassign it (matches the bulk-reassign permission model).
- **Followers**: separate from Owner — anyone on the team can be added as a follower for visibility. This required loosening the `profiles` table's read policy so any signed-in teammate can see the basic directory (name/email/role) — not their contacts/deals/tasks, just who's on the team. Re-run `supabase/schema.sql` to pick this up.
- **Do Not Disturb**: three simple checkboxes (no email/SMS/calls) stored on the contact — not enforced anywhere yet (there's no messaging system to enforce it on), just recorded for when one exists.
- **Collapsible + searchable fields**: click "Contact" to collapse/expand; the search box filters which fields show, client-side.
- **Files**: real uploads/downloads/deletes via Supabase Storage, once the bucket above exists.
- **Visual-only placeholders**: the middle "Conversations" panel, and the Calendar/Payments/Automations/AI icons in the right-hand rail, are non-functional by design — they need real third-party integrations (Twilio/email provider, Stripe, etc.) that come after the UI is settled, per your direction.

## Contacts feature notes

- **Data table**: click column headers (Name, Email, Created) to sort. Pagination controls at the bottom (10/20/50 per page).
- **Bulk actions**: check one or more rows — a toolbar appears to add a tag to all selected, delete them, or (admins only) reassign them to another user.
- **Filters**: search box, tag filter (exact tag match), company filter — combine freely, "Apply" to run.
- **Smart Lists**: with any filter active, name it and click "Save as Smart List" to create a reusable pill you can click to reapply that filter combo later. Delete via the small × on the pill.
- **Import**: `/contacts/import` — CSV with a header row. Recognized columns: `first_name` (required), `last_name`, `email`, `phone`, `company` (auto-created if it doesn't exist), `tags` (separate with `;` or `|`), `notes`.
- **Custom fields**: on a contact's detail page — free-form key/value pairs stored per contact, no need to predefine field types first (simpler than a full custom-field builder, but covers the common "store extra info" need).

## Design notes

- New dependency: `lucide-react` (icons). Run `npm install` after pulling this change.
- Schema change: `tasks` got a `priority` column (`low`/`medium`/`high`). Re-run `supabase/schema.sql` in the Supabase SQL Editor — it's additive/idempotent, safe to re-run on an existing database.
- The sidebar shows real features (Dashboard, Contacts, Companies, Deals, Tasks) as working links, plus extra items from the Figma reference (Inbox, Calendar, Marketing, etc.) as disabled "Soon" placeholders for visual density — none of those are wired up.
- The dashboard's "Email Open Rate" stat is a placeholder ("Soon") since there's no email-tracking feature. The other three stat cards show real numbers but intentionally have no trend arrows/percentages — we don't track historical snapshots yet, so I didn't fabricate growth numbers. Can add real trend tracking later if wanted.
- Top bar search box and notification bell are visual-only for now (not wired to real search/notifications).

## Auth notes

- New signups default to the `sales_rep` role. To make your own account an admin, run in the Supabase SQL Editor:
  ```sql
  update public.profiles set role = 'admin' where email = 'you@example.com';
  ```
- By default, Supabase requires email confirmation before a new user can log in. For local dev, either:
  - Confirm via the email Supabase sends (check spam), or
  - In Supabase Dashboard -> Authentication -> Providers -> Email, turn off "Confirm email" to skip this during development.
- `/dashboard` (and anything else outside `/`, `/login`, `/signup`) is protected — signed-out users get redirected to `/login` automatically.
