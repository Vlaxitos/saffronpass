-- =============================================================================
-- SaffronPass — Phase 1 Complete Supabase PostgreSQL Schema
-- Idempotent: Safe to paste and re-run directly in the Supabase SQL Editor.
-- Designed cleanly so Phases 2–5 can extend without breaking changes.
-- =============================================================================

-- Required extension for gen_random_uuid()
create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- 1. PROFILES
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user'
    check (role in ('user', 'agency', 'admin')),
  agency_credits integer not null default 0
    check (agency_credits >= 0),
  agency_brand_name text,
  ai_uses_count integer not null default 0
    check (ai_uses_count >= 0),
  created_at timestamptz not null default now()
);

-- Auto-create a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
      split_part(coalesce(new.email, ''), '@', 1)
    )
  )
  on conflict (id) do update
  set
    email = coalesce(excluded.email, public.profiles.email),
    full_name = coalesce(nullif(public.profiles.full_name, ''), excluded.full_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for any pre-existing auth.users rows (idempotent)
insert into public.profiles (id, email, full_name)
select
  u.id,
  u.email,
  coalesce(
    nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(u.raw_user_meta_data ->> 'name'), ''),
    split_part(coalesce(u.email, ''), '@', 1)
  )
from auth.users u
on conflict (id) do nothing;

-- Prevent client-side privilege escalation on sensitive profile columns
create or replace function public.protect_profile_sensitive_fields()
returns trigger
language plpgsql
as $$
begin
  if auth.role() = 'authenticated' then
    if new.role is distinct from old.role
       or new.agency_credits is distinct from old.agency_credits
       or new.ai_uses_count is distinct from old.ai_uses_count then
      raise exception 'Insufficient permissions to modify protected profile fields';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_profile_sensitive_fields on public.profiles;
create trigger trg_protect_profile_sensitive_fields
  before update on public.profiles
  for each row execute function public.protect_profile_sensitive_fields();

-- -----------------------------------------------------------------------------
-- 2. EVENTS
-- -----------------------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles (id) on delete cascade,
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) between 3 and 80),
  event_type text not null default 'wedding'
    check (event_type in (
      'wedding',
      'engagement',
      'housewarming',
      'anniversary',
      'birthday',
      'baby_shower',
      'custom'
    )),
  title text not null,
  host_names text not null,
  tradition_symbol text not null default 'ganesh'
    check (tradition_symbol in ('ganesh', 'bismillah', 'ek_onkar', 'cross', 'floral', 'none')),
  event_date date,
  welcome_message text,
  theme_id text not null default 'royal_saffron',
  opening_animation text not null default 'wax_seal'
    check (opening_animation in ('wax_seal', 'palace_doors')),
  design_config jsonb not null default '{}'::jsonb,
  rsvp_enabled boolean not null default true,
  plan text not null default 'free'
    check (plan in (
      'free',
      'celebration_pass',
      'celebration_pro',
      'wedding_standard',
      'wedding_pro',
      'vip'
    )),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_events_host_id on public.events (host_id);
create index if not exists idx_events_slug on public.events (slug);

-- Prevent authenticated hosts from self-upgrading plan or expires_at directly
create or replace function public.protect_event_billing_fields()
returns trigger
language plpgsql
as $$
begin
  if auth.role() = 'authenticated' then
    if tg_op = 'UPDATE' and (
      new.plan is distinct from old.plan
      or new.expires_at is distinct from old.expires_at
      or new.host_id is distinct from old.host_id
    ) then
      raise exception 'Billing plan and ownership fields can only be modified by server processes';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_event_billing_fields on public.events;
create trigger trg_protect_event_billing_fields
  before update on public.events
  for each row execute function public.protect_event_billing_fields();

-- -----------------------------------------------------------------------------
-- 3. SUB-EVENTS
-- -----------------------------------------------------------------------------
create table if not exists public.sub_events (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  name text not null,
  event_date date,
  start_time text,
  venue_name text,
  maps_url text,
  dress_code text,
  sort_order integer not null default 0
);

create index if not exists idx_sub_events_event_order
  on public.sub_events (event_id, sort_order);

-- -----------------------------------------------------------------------------
-- 4. INVITE CATEGORIES (Smart Category Links)
-- -----------------------------------------------------------------------------
create table if not exists public.invite_categories (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  name text not null,
  code text not null
    check (code ~ '^[a-z0-9]{8}$'),
  side_tag text not null default 'common'
    check (side_tag in ('bride', 'groom', 'common')),
  etiquette_type text not null default 'family'
    check (etiquette_type in ('solo', 'couple', 'family')),
  max_seats integer not null default 4
    check (max_seats >= 1 and max_seats <= 50),
  allowed_sub_event_ids uuid[] not null default '{}'::uuid[],
  greeting_prefix text,
  created_at timestamptz not null default now(),
  constraint invite_categories_event_code_unique unique (event_id, code)
);

create index if not exists idx_invite_categories_event_id
  on public.invite_categories (event_id);

-- -----------------------------------------------------------------------------
-- 5. RSVPS
-- -----------------------------------------------------------------------------
create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  category_id uuid references public.invite_categories (id) on delete set null,
  guest_name text not null,
  phone_number text not null,
  overall_attending boolean not null default true,
  meal_preference text,
  note text,
  is_manual boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rsvps_event_phone_unique unique (event_id, phone_number)
);

create index if not exists idx_rsvps_event_id on public.rsvps (event_id);
create index if not exists idx_rsvps_category_id on public.rsvps (category_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_rsvps_updated_at on public.rsvps;
create trigger trg_rsvps_updated_at
  before update on public.rsvps
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 6. RSVP SUB-EVENTS (Per-Event Attendance & Seat Counts)
-- -----------------------------------------------------------------------------
create table if not exists public.rsvp_sub_events (
  id uuid primary key default gen_random_uuid(),
  rsvp_id uuid not null references public.rsvps (id) on delete cascade,
  sub_event_id uuid not null references public.sub_events (id) on delete cascade,
  attending boolean not null default true,
  guest_count integer not null default 1
    check (guest_count >= 0 and guest_count <= 50),
  constraint rsvp_sub_events_unique unique (rsvp_id, sub_event_id)
);

create index if not exists idx_rsvp_sub_events_rsvp_id
  on public.rsvp_sub_events (rsvp_id);
create index if not exists idx_rsvp_sub_events_sub_event_id
  on public.rsvp_sub_events (sub_event_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) & STRICT ZERO-ANON EXPOSURE
-- =============================================================================
-- SECURITY DESIGN:
-- Every table has RLS enabled and ZERO policies granted to the `anon` role.
-- We also explicitly revoke direct table privileges from `anon`.
-- Public guest invites (/[slug]/[code]) and RSVP submissions (/api/rsvp) are
-- mediated exclusively through server-only Next.js Server Components & Route
-- Handlers using SUPABASE_SECRET_KEY, validating BOTH `slug` and `code` and
-- returning ONLY sub_events inside `invite_categories.allowed_sub_event_ids`.
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.sub_events enable row level security;
alter table public.invite_categories enable row level security;
alter table public.rsvps enable row level security;
alter table public.rsvp_sub_events enable row level security;

-- Explicitly revoke direct anonymous table access (defense-in-depth)
revoke all on table public.profiles from anon;
revoke all on table public.events from anon;
revoke all on table public.sub_events from anon;
revoke all on table public.invite_categories from anon;
revoke all on table public.rsvps from anon;
revoke all on table public.rsvp_sub_events from anon;

-- Ensure authenticated role has standard CRUD privileges gated by RLS
grant select, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.events to authenticated;
grant select, insert, update, delete on table public.sub_events to authenticated;
grant select, insert, update, delete on table public.invite_categories to authenticated;
grant select, insert, update, delete on table public.rsvps to authenticated;
grant select, insert, update, delete on table public.rsvp_sub_events to authenticated;

-- -----------------------------------------------------------------------------
-- RLS Policies: PROFILES
-- -----------------------------------------------------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- RLS Policies: EVENTS (Strict Host Ownership)
-- -----------------------------------------------------------------------------
drop policy if exists "events_select_own" on public.events;
create policy "events_select_own"
  on public.events
  for select
  to authenticated
  using (host_id = auth.uid());

drop policy if exists "events_insert_own" on public.events;
create policy "events_insert_own"
  on public.events
  for insert
  to authenticated
  with check (host_id = auth.uid() and plan = 'free');

drop policy if exists "events_update_own" on public.events;
create policy "events_update_own"
  on public.events
  for update
  to authenticated
  using (host_id = auth.uid())
  with check (host_id = auth.uid());

drop policy if exists "events_delete_own" on public.events;
create policy "events_delete_own"
  on public.events
  for delete
  to authenticated
  using (host_id = auth.uid());

-- -----------------------------------------------------------------------------
-- RLS Policies: SUB_EVENTS (Strict Event Ownership)
-- -----------------------------------------------------------------------------
drop policy if exists "sub_events_select_own" on public.sub_events;
create policy "sub_events_select_own"
  on public.sub_events
  for select
  to authenticated
  using (
    exists (
      select 1 from public.events e
      where e.id = sub_events.event_id and e.host_id = auth.uid()
    )
  );

drop policy if exists "sub_events_insert_own" on public.sub_events;
create policy "sub_events_insert_own"
  on public.sub_events
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.events e
      where e.id = sub_events.event_id and e.host_id = auth.uid()
    )
  );

drop policy if exists "sub_events_update_own" on public.sub_events;
create policy "sub_events_update_own"
  on public.sub_events
  for update
  to authenticated
  using (
    exists (
      select 1 from public.events e
      where e.id = sub_events.event_id and e.host_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.events e
      where e.id = sub_events.event_id and e.host_id = auth.uid()
    )
  );

drop policy if exists "sub_events_delete_own" on public.sub_events;
create policy "sub_events_delete_own"
  on public.sub_events
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.events e
      where e.id = sub_events.event_id and e.host_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- RLS Policies: INVITE_CATEGORIES (Strict Event Ownership)
-- -----------------------------------------------------------------------------
drop policy if exists "invite_categories_select_own" on public.invite_categories;
create policy "invite_categories_select_own"
  on public.invite_categories
  for select
  to authenticated
  using (
    exists (
      select 1 from public.events e
      where e.id = invite_categories.event_id and e.host_id = auth.uid()
    )
  );

drop policy if exists "invite_categories_insert_own" on public.invite_categories;
create policy "invite_categories_insert_own"
  on public.invite_categories
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.events e
      where e.id = invite_categories.event_id and e.host_id = auth.uid()
    )
  );

drop policy if exists "invite_categories_update_own" on public.invite_categories;
create policy "invite_categories_update_own"
  on public.invite_categories
  for update
  to authenticated
  using (
    exists (
      select 1 from public.events e
      where e.id = invite_categories.event_id and e.host_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.events e
      where e.id = invite_categories.event_id and e.host_id = auth.uid()
    )
  );

drop policy if exists "invite_categories_delete_own" on public.invite_categories;
create policy "invite_categories_delete_own"
  on public.invite_categories
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.events e
      where e.id = invite_categories.event_id and e.host_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- RLS Policies: RSVPS (Host View, Manual Entry, & Moderation)
-- -----------------------------------------------------------------------------
drop policy if exists "rsvps_select_own" on public.rsvps;
create policy "rsvps_select_own"
  on public.rsvps
  for select
  to authenticated
  using (
    exists (
      select 1 from public.events e
      where e.id = rsvps.event_id and e.host_id = auth.uid()
    )
  );

drop policy if exists "rsvps_insert_own" on public.rsvps;
create policy "rsvps_insert_own"
  on public.rsvps
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.events e
      where e.id = rsvps.event_id and e.host_id = auth.uid()
    )
  );

drop policy if exists "rsvps_update_own" on public.rsvps;
create policy "rsvps_update_own"
  on public.rsvps
  for update
  to authenticated
  using (
    exists (
      select 1 from public.events e
      where e.id = rsvps.event_id and e.host_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.events e
      where e.id = rsvps.event_id and e.host_id = auth.uid()
    )
  );

drop policy if exists "rsvps_delete_own" on public.rsvps;
create policy "rsvps_delete_own"
  on public.rsvps
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.events e
      where e.id = rsvps.event_id and e.host_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- RLS Policies: RSVP_SUB_EVENTS (Host View & Moderation)
-- -----------------------------------------------------------------------------
drop policy if exists "rsvp_sub_events_select_own" on public.rsvp_sub_events;
create policy "rsvp_sub_events_select_own"
  on public.rsvp_sub_events
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.rsvps r
      join public.events e on e.id = r.event_id
      where r.id = rsvp_sub_events.rsvp_id and e.host_id = auth.uid()
    )
  );

drop policy if exists "rsvp_sub_events_insert_own" on public.rsvp_sub_events;
create policy "rsvp_sub_events_insert_own"
  on public.rsvp_sub_events
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.rsvps r
      join public.events e on e.id = r.event_id
      where r.id = rsvp_sub_events.rsvp_id and e.host_id = auth.uid()
    )
  );

drop policy if exists "rsvp_sub_events_update_own" on public.rsvp_sub_events;
create policy "rsvp_sub_events_update_own"
  on public.rsvp_sub_events
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.rsvps r
      join public.events e on e.id = r.event_id
      where r.id = rsvp_sub_events.rsvp_id and e.host_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.rsvps r
      join public.events e on e.id = r.event_id
      where r.id = rsvp_sub_events.rsvp_id and e.host_id = auth.uid()
    )
  );

drop policy if exists "rsvp_sub_events_delete_own" on public.rsvp_sub_events;
create policy "rsvp_sub_events_delete_own"
  on public.rsvp_sub_events
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.rsvps r
      join public.events e on e.id = r.event_id
      where r.id = rsvp_sub_events.rsvp_id and e.host_id = auth.uid()
    )
  );
