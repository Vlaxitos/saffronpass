# SaffronPass — Setup & Deployment Guide (Phases 1 & 2)

Follow these exact steps to connect **Supabase** (including the Phase 2 incremental migration & media storage) and deploy **SaffronPass** to **Vercel** (Next.js Runtime v5).

---

## 1. Supabase Setup

### Step 1.1 — Create a Supabase Project
1. Sign in to [Supabase](https://supabase.com/dashboard) and click **New Project**.
2. Choose a region closest to your primary guests (e.g., **South Asia / Mumbai `ap-south-1`** for Indian weddings).

### Step 1.2 — Run Phase 1 Base Schema (Fresh Databases)
1. In your Supabase project, open **SQL Editor** → **New query**.
2. Copy the entire contents of [`supabase/schema.sql`](./supabase/schema.sql) and paste it into the editor.
3. Click **Run** (safe & idempotent).

### Step 1.3 — Run Phase 2 Incremental Migration (Required for Phase 2 Features)
1. Open a new query in **Supabase SQL Editor**.
2. Copy the entire contents of [`supabase/migration_phase2.sql`](./supabase/migration_phase2.sql) and click **Run**.
   - **Non-destructive & idempotent**: Does NOT drop Phase 1 tables or lose any existing events, category links, or RSVPs.
   - Adds Phase 2 columns on `events` (`cover_image_url`, `gallery_images`, `particle_effect`, `scratch_reveal_enabled`, `music_track`, `custom_music_url`) and updates the `opening_animation` constraint to support `cinematic_scroll`.
   - Creates `public.event_cohosts` (max 3 co-hosts per event, lowercase email normalized).
   - Creates recursion-free `SECURITY DEFINER` RLS helpers (`public.can_manage_event` and `public.is_event_owner`) and updates RLS policies so Co-Hosts can manage shared events while **only the original `host_id`** can delete the event or add/remove Co-Hosts.
   - Creates the public **`event-media`** Supabase Storage bucket and storage policies for compressed WebP photos (< 300KB) and custom MP3 tracks (< 3MB).

### Step 1.4 — Configure Authentication Providers
1. Go to **Authentication** → **Providers**:
   - Ensure **Email** is enabled.
   - Enable **Google** and paste your Google OAuth Client ID & Secret from Google Cloud Console (Authorized Redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`).
2. Go to **Authentication** → **URL Configuration**:
   - **Site URL**: `http://localhost:3000` (update to your Vercel production URL once deployed).
   - **Redirect URLs**: Add both:
     - `http://localhost:3000/auth/callback`
     - `https://<your-vercel-domain>/auth/callback`

### Step 1.5 — Copy Your Supabase API Keys
Go to **Project Settings** → **API Keys**:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **Publishable key** (`sb_publishable_...`) → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` *(legacy `anon` key also supported via `NEXT_PUBLIC_SUPABASE_ANON_KEY` fallback)*
- **Secret key** (`sb_secret_...` or legacy `service_role` key) → `SUPABASE_SECRET_KEY` *(SERVER-ONLY — never prefix with `NEXT_PUBLIC_`)*

---

## 2. Local Development

```bash
cp .env.example .env.local
```

Fill in `.env.local` with the values from Step 1.5, then run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000):
- Test all 5 themes, Wax Seal / Palace Doors / Cinematic Scroll, Falling Petals, Gold-Foil Scratch-to-Reveal Date, and Royal Shehnai music right inside the landing page demo.
- Sign in at `/login` to test cover/gallery WebP compression, Co-Host invitations, manual phone RSVP entries, Excel/CSV caterer export, WhatsApp share links, and `/api/og` dynamic preview cards.

---

## 3. Vercel Deployment (Next.js Runtime v5)

1. Push this repository to GitHub.
2. In [Vercel](https://vercel.com/new), import your GitHub repository.
3. Framework Preset is auto-detected as **Next.js**. Keep defaults (`npm run build`).
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY` *(Server-side only — never expose to client)*
   - `NEXT_PUBLIC_SITE_URL` → your production URL (e.g., `https://saffronpass.vercel.app`, no trailing slash — required so WhatsApp Open Graph `/api/og` preview images resolve cleanly)
5. Click **Deploy**.
6. Update **Supabase → Authentication → URL Configuration** with your production Vercel URL and `/auth/callback` redirect URI.

---

## Security & Privacy Architecture Notes
- **Zero Anonymous Table Access**: None of the PostgreSQL tables expose `anon` read/write RLS policies.
- **Strict Sub-Event Privacy**: Both `/[slug]/[code]` and `POST /api/rsvp` validate `slug` + `code` exclusively on the server and only return sub-events inside `invite_categories.allowed_sub_event_ids`.
- **Zero Private Leakage in WhatsApp Previews**: `generateMetadata` and `/api/og` use only `host_names`, `title`, main `event_date`, and `cover_image_url` — private sub-events (like Haldi or Cocktail) and internal category names never appear in Open Graph tags.
- **Recursion-Free Co-Host RLS**: `public.can_manage_event(uuid)` and `public.is_event_owner(uuid)` run as `SECURITY DEFINER` functions, allowing family Co-Hosts to view and manage shared celebrations while restricting destructive event deletion and Co-Host management strictly to the primary `host_id`.
