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
- [ ] Database schema (contacts, companies, deals, pipeline stages, activities, tasks)
- [ ] Auth (login/signup, role-based access)
- [ ] Core UI screens (dashboard, contacts, deals/pipeline, companies, tasks)
- [ ] Deploy to Vercel
