# SaffronPass — Phase 1 Setup & Deployment Guide

Follow these exact steps to connect **Supabase** and deploy **SaffronPass** to **Vercel** (Next.js Runtime v5).

---

## 1. Supabase Setup

### Step 1.1 — Create a Supabase Project
1. Sign in to [Supabase](https://supabase.com/dashboard) and click **New Project**.
2. Choose a region closest to your primary guests (e.g., **South Asia / Mumbai `ap-south-1`** for Indian weddings).

### Step 1.2 — Run the Complete Database Schema & Strict RLS Policies
1. In your Supabase project, open **SQL Editor** → **New query**.
2. Copy the entire contents of [`supabase/schema.sql`](./supabase/schema.sql) and paste it into the editor.
3. Click **Run**.
   - The script is **idempotent** (safe to re-run).
   - It creates all 6 tables (`profiles`, `events`, `sub_events`, `invite_categories`, `rsvps`, `rsvp_sub_events`), triggers, constraints, and enables strict **Row Level Security (RLS)** with **zero anonymous access** on all tables.

### Step 1.3 — Configure Authentication Providers
1. Go to **Authentication** → **Providers**:
   - Ensure **Email** is enabled (you can optionally disable *"Confirm email"* during local testing for instant login).
   - Enable **Google** and paste your Google OAuth Client ID & Secret from Google Cloud Console (set Google's Authorized Redirect URI to `https://<your-project-ref>.supabase.co/auth/v1/callback`).
2. Go to **Authentication** → **URL Configuration**:
   - **Site URL**: `http://localhost:3000` (update to your Vercel production URL once deployed).
   - **Redirect URLs**: Add both:
     - `http://localhost:3000/auth/callback`
     - `https://<your-vercel-domain>/auth/callback`

### Step 1.4 — Copy Your Supabase API Keys
Go to **Project Settings** → **API Keys**:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **Publishable key** (`sb_publishable_...`) → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` *(legacy `anon` key also supported via `NEXT_PUBLIC_SUPABASE_ANON_KEY` fallback)*
- **Secret key** (`sb_secret_...` or legacy `service_role` key) → `SUPABASE_SECRET_KEY` *(SERVER-ONLY — never prefix with `NEXT_PUBLIC_`)*

---

## 2. Local Development

```bash
cp .env.example .env.local
```

Fill in `.env.local` with the values from Step 1.4, then run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000):
- Test the **Wax-Seal Envelope** & **Royal Palace Doors** live demo right on `/`.
- Sign up at `/login` to access `/dashboard`, create an event, add sub-events, generate private category links, and test guest RSVPs at `/[slug]/[code]`.

---

## 3. Vercel Deployment (Next.js Runtime v5)

1. Push this repository to GitHub.
2. In [Vercel](https://vercel.com/new), import your GitHub repository.
3. Framework Preset is auto-detected as **Next.js**. Keep defaults (`npm run build`).
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY` *(Server-side only — keep unchecked/hidden from browser exposure)*
   - `NEXT_PUBLIC_SITE_URL` → set to your production URL (e.g., `https://saffronpass.vercel.app`, no trailing slash)
5. Click **Deploy**.
6. Once deployed, return to **Supabase → Authentication → URL Configuration** and add `https://<your-production-domain>/auth/callback` to **Redirect URLs** and update **Site URL** to `https://<your-production-domain>`.

---

## Security Architecture Notes
- **Zero Anonymous Table Access**: None of the 6 PostgreSQL tables allow `anon` queries via PostgREST.
- **Strict Sub-Event Privacy**: Public guest invitations (`/[slug]/[code]`) and RSVP submissions (`POST /api/rsvp`) run exclusively on the server using `SUPABASE_SECRET_KEY`, validating **both** `slug` and `code` and returning **only** sub-events listed in `invite_categories.allowed_sub_event_ids`.
- **Server-Enforced Seat Caps & Free Plan Quota**: Solo/Couple/Family seat caps, anti-duplicate phone upserts, and the 5-guest Free Preview RSVP limit are enforced strictly server-side in `POST /api/rsvp`.
