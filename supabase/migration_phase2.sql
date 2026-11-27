-- =============================================================================
-- SaffronPass — Phase 2 Incremental Supabase PostgreSQL Migration
-- Non-destructive & Idempotent: Safe to run on top of an existing Phase 1 DB
-- without dropping tables or losing any existing events, links, or RSVPs.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. EXTEND public.events WITH PHASE 2 MEDIA, ANIMATION & MUSIC COLUMNS
-- -----------------------------------------------------------------------------
alter table public.events
  add column if not exists cover_image_url text,
  add column if not exists gallery_images text[] not null default '{}'::text[],
  add column if not exists particle_effect text not null default 'none',
  add column if not exists scratch_reveal_enabled boolean not null default false,
  add column if not exists music_track text not null default 'none',
  add column if not exists custom_music_url text;

-- Update check constraints idempotently (including expanding opening_animation
-- to support 'cinematic_scroll' in addition to 'wax_seal' and 'palace_doors')
do $$
declare
  c_name text;
begin
  -- Drop any existing check constraint on events.opening_animation
  for c_name in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'events'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%opening_animation%'
  loop
    execute format('alter table public.events drop constraint if exists %I', c_name);
  end loop;

  alter table public.events
    add constraint events_opening_animation_check
    check (opening_animation in ('wax_seal', 'palace_doors', 'cinematic_scroll'));

  -- particle_effect constraint
  alter table public.events drop constraint if exists events_particle_effect_check;
  alter table public.events
    add constraint events_particle_effect_check
    check (particle_effect in ('none', 'marigold', 'rose_petals', 'gold_sparkles'));

  -- music_track constraint
  alter table public.events drop constraint if exists events_music_track_check;
  alter table public.events
    add constraint events_music_track_check
    check (music_track in (
      'none',
      'royal_shehnai',
      'romantic_piano',
      'sitar_bliss',
      'celebration_chimes',
      'acoustic_warmth',
      'custom'
    ));
end;
$$;

-- -----------------------------------------------------------------------------
-- 2. NEW TABLE: public.event_cohosts
-- -----------------------------------------------------------------------------
create table if not exists public.event_cohosts (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  email text not null,
  side_tag text not null default 'common'
    check (side_tag in ('bride', 'groom', 'common')),
  invited_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint event_cohosts_event_email_unique unique (event_id, email)
);

create index if not exists idx_event_cohosts_event_id
  on public.event_cohosts (event_id);
create index if not exists idx_event_cohosts_email_lower
  on public.event_cohosts (lower(email));

-- Normalize co-host emails to lowercase and enforce max 3 co-hosts per event
create or replace function public.normalize_and_limit_event_cohosts()
returns trigger
language plpgsql
as $$
declare
  existing_count integer;
begin
  new.email := lower(trim(new.email));

  if new.email = '' or position('@' in new.email) = 0 then
    raise exception 'Please provide a valid co-host email address';
  end if;

  if tg_op = 'INSERT' then
    select count(*) into existing_count
    from public.event_cohosts
    where event_id = new.event_id;

    if existing_count >= 3 then
      raise exception 'Maximum of 3 co-hosts allowed per event';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_normalize_and_limit_event_cohosts on public.event_cohosts;
create trigger trg_normalize_and_limit_event_cohosts
  before insert or update on public.event_cohosts
  for each row execute function public.normalize_and_limit_event_cohosts();

-- -----------------------------------------------------------------------------
-- 3. RLS HELPER FUNCTIONS (SECURITY DEFINER — PREVENTS INFINITE RECURSION)
-- -----------------------------------------------------------------------------
create or replace function public.is_event_owner(target_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.events e
    where e.id = target_event_id
      and e.host_id = auth.uid()
  );
$$;

create or replace function public.can_manage_event(target_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    exists (
      select 1
      from public.events e
      where e.id = target_event_id
        and e.host_id = auth.uid()
    )
    or (
      nullif(trim(coalesce(auth.jwt() ->> 'email', '')), '') is not null
      and exists (
        select 1
        from public.event_cohosts c
        where c.event_id = target_event_id
          and lower(c.email) = lower(trim(auth.jwt() ->> 'email'))
      )
    );
$$;

revoke all on function public.is_event_owner(uuid) from public, anon;
revoke all on function public.can_manage_event(uuid) from public, anon;
grant execute on function public.is_event_owner(uuid) to authenticated, service_role;
grant execute on function public.can_manage_event(uuid) to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 4. UPDATED STRICT RLS POLICIES (OWNER + CO-HOST MANAGEMENT)
-- -----------------------------------------------------------------------------
alter table public.event_cohosts enable row level security;
revoke all on table public.event_cohosts from anon;
grant select, insert, update, delete on table public.event_cohosts to authenticated;

-- EVENTS: Owner + Co-Host can SELECT & UPDATE; ONLY Owner can DELETE; INSERT remains Owner-only free plan
drop policy if exists "events_select_own" on public.events;
create policy "events_select_own"
  on public.events
  for select
  to authenticated
  using (public.can_manage_event(id));

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
  using (public.can_manage_event(id))
  with check (public.can_manage_event(id));

drop policy if exists "events_delete_own" on public.events;
create policy "events_delete_own"
  on public.events
  for delete
  to authenticated
  using (host_id = auth.uid());

-- SUB_EVENTS: Owner + Co-Host full CRUD
drop policy if exists "sub_events_select_own" on public.sub_events;
create policy "sub_events_select_own"
  on public.sub_events
  for select
  to authenticated
  using (public.can_manage_event(event_id));

drop policy if exists "sub_events_insert_own" on public.sub_events;
create policy "sub_events_insert_own"
  on public.sub_events
  for insert
  to authenticated
  with check (public.can_manage_event(event_id));

drop policy if exists "sub_events_update_own" on public.sub_events;
create policy "sub_events_update_own"
  on public.sub_events
  for update
  to authenticated
  using (public.can_manage_event(event_id))
  with check (public.can_manage_event(event_id));

drop policy if exists "sub_events_delete_own" on public.sub_events;
create policy "sub_events_delete_own"
  on public.sub_events
  for delete
  to authenticated
  using (public.can_manage_event(event_id));

-- INVITE_CATEGORIES: Owner + Co-Host full CRUD
drop policy if exists "invite_categories_select_own" on public.invite_categories;
create policy "invite_categories_select_own"
  on public.invite_categories
  for select
  to authenticated
  using (public.can_manage_event(event_id));

drop policy if exists "invite_categories_insert_own" on public.invite_categories;
create policy "invite_categories_insert_own"
  on public.invite_categories
  for insert
  to authenticated
  with check (public.can_manage_event(event_id));

drop policy if exists "invite_categories_update_own" on public.invite_categories;
create policy "invite_categories_update_own"
  on public.invite_categories
  for update
  to authenticated
  using (public.can_manage_event(event_id))
  with check (public.can_manage_event(event_id));

drop policy if exists "invite_categories_delete_own" on public.invite_categories;
create policy "invite_categories_delete_own"
  on public.invite_categories
  for delete
  to authenticated
  using (public.can_manage_event(event_id));

-- RSVPS: Owner + Co-Host full view, manual entry & moderation
drop policy if exists "rsvps_select_own" on public.rsvps;
create policy "rsvps_select_own"
  on public.rsvps
  for select
  to authenticated
  using (public.can_manage_event(event_id));

drop policy if exists "rsvps_insert_own" on public.rsvps;
create policy "rsvps_insert_own"
  on public.rsvps
  for insert
  to authenticated
  with check (public.can_manage_event(event_id));

drop policy if exists "rsvps_update_own" on public.rsvps;
create policy "rsvps_update_own"
  on public.rsvps
  for update
  to authenticated
  using (public.can_manage_event(event_id))
  with check (public.can_manage_event(event_id));

drop policy if exists "rsvps_delete_own" on public.rsvps;
create policy "rsvps_delete_own"
  on public.rsvps
  for delete
  to authenticated
  using (public.can_manage_event(event_id));

-- RSVP_SUB_EVENTS: Owner + Co-Host full view, manual entry & moderation
drop policy if exists "rsvp_sub_events_select_own" on public.rsvp_sub_events;
create policy "rsvp_sub_events_select_own"
  on public.rsvp_sub_events
  for select
  to authenticated
  using (
    exists (
      select 1 from public.rsvps r
      where r.id = rsvp_sub_events.rsvp_id
        and public.can_manage_event(r.event_id)
    )
  );

drop policy if exists "rsvp_sub_events_insert_own" on public.rsvp_sub_events;
create policy "rsvp_sub_events_insert_own"
  on public.rsvp_sub_events
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.rsvps r
      where r.id = rsvp_sub_events.rsvp_id
        and public.can_manage_event(r.event_id)
    )
  );

drop policy if exists "rsvp_sub_events_update_own" on public.rsvp_sub_events;
create policy "rsvp_sub_events_update_own"
  on public.rsvp_sub_events
  for update
  to authenticated
  using (
    exists (
      select 1 from public.rsvps r
      where r.id = rsvp_sub_events.rsvp_id
        and public.can_manage_event(r.event_id)
    )
  )
  with check (
    exists (
      select 1 from public.rsvps r
      where r.id = rsvp_sub_events.rsvp_id
        and public.can_manage_event(r.event_id)
    )
  );

drop policy if exists "rsvp_sub_events_delete_own" on public.rsvp_sub_events;
create policy "rsvp_sub_events_delete_own"
  on public.rsvp_sub_events
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.rsvps r
      where r.id = rsvp_sub_events.rsvp_id
        and public.can_manage_event(r.event_id)
    )
  );

-- EVENT_COHOSTS: Owner + Co-Hosts can view; ONLY original host_id can add/edit/remove co-hosts
drop policy if exists "event_cohosts_select_manageable" on public.event_cohosts;
create policy "event_cohosts_select_manageable"
  on public.event_cohosts
  for select
  to authenticated
  using (public.can_manage_event(event_id));

drop policy if exists "event_cohosts_insert_owner_only" on public.event_cohosts;
create policy "event_cohosts_insert_owner_only"
  on public.event_cohosts
  for insert
  to authenticated
  with check (public.is_event_owner(event_id));

drop policy if exists "event_cohosts_update_owner_only" on public.event_cohosts;
create policy "event_cohosts_update_owner_only"
  on public.event_cohosts
  for update
  to authenticated
  using (public.is_event_owner(event_id))
  with check (public.is_event_owner(event_id));

drop policy if exists "event_cohosts_delete_owner_only" on public.event_cohosts;
create policy "event_cohosts_delete_owner_only"
  on public.event_cohosts
  for delete
  to authenticated
  using (public.is_event_owner(event_id));

-- -----------------------------------------------------------------------------
-- 5. SUPABASE STORAGE BUCKET & POLICIES (event-media)
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('event-media', 'event-media', true)
on conflict (id) do update set public = true;

drop policy if exists "event_media_public_read" on storage.objects;
create policy "event_media_public_read"
  on storage.objects
  for select
  to public
  using (bucket_id = 'event-media');

drop policy if exists "event_media_auth_insert" on storage.objects;
create policy "event_media_auth_insert"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'event-media');

drop policy if exists "event_media_auth_update" on storage.objects;
create policy "event_media_auth_update"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'event-media')
  with check (bucket_id = 'event-media');

drop policy if exists "event_media_auth_delete" on storage.objects;
create policy "event_media_auth_delete"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'event-media');
