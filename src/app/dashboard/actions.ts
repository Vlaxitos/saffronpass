"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MAX_COHOSTS_PER_EVENT, MAX_GALLERY_IMAGES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import {
  buildDefaultSlug,
  generateInviteCode,
  getSafeExternalUrl,
  isValidSlug,
  normalizePhoneNumber,
  slugify,
} from "@/lib/utils";
import type {
  EtiquetteType,
  EventType,
  MusicTrackType,
  OpeningAnimationType,
  ParticleEffectType,
  SideTag,
  ThemeId,
  TraditionSymbolType,
} from "@/types/database";

export interface ActionResult<T = undefined> {
  ok: boolean;
  error?: string;
  data?: T;
}

async function requireAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null };
  }
  return { supabase, user };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// -----------------------------------------------------------------------------
// EVENT CRUD
// -----------------------------------------------------------------------------

export async function createEventAction(input: {
  event_type: EventType;
  title: string;
  host_names: string;
  event_date: string | null;
  slug?: string;
}): Promise<ActionResult<{ id: string }>> {
  const { supabase, user } = await requireAuthenticatedUser();
  if (!user) {
    return { ok: false, error: "Please sign in to create an event." };
  }

  const title = input.title.trim();
  const host_names = input.host_names.trim();
  if (title.length < 2) {
    return { ok: false, error: "Please enter an event title." };
  }
  if (host_names.length < 2) {
    return { ok: false, error: "Please enter host or couple names." };
  }

  // Ensure profile exists for the host
  await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();

  const rawSlug = input.slug?.trim()
    ? slugify(input.slug)
    : buildDefaultSlug(host_names || title);
  const finalSlug = isValidSlug(rawSlug) ? rawSlug : buildDefaultSlug(title);

  const defaultWelcome =
    input.event_type === "wedding"
      ? "With the blessings of our elders and immense joy in our hearts, we warmly invite you to grace our wedding celebrations with your presence and blessings."
      : "With joyful hearts, we warmly invite you to celebrate this cherished milestone together with us.";

  const { data, error } = await supabase
    .from("events")
    .insert({
      host_id: user.id,
      slug: finalSlug,
      event_type: input.event_type,
      title,
      host_names,
      event_date: input.event_date || null,
      welcome_message: defaultWelcome,
      tradition_symbol: input.event_type === "wedding" ? "ganesh" : "floral",
      theme_id: "royal_saffron",
      opening_animation: "wax_seal",
      rsvp_enabled: true,
      plan: "free",
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: "That URL slug is already taken. Please try another slug.",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard");
  return { ok: true, data: { id: data.id } };
}

export async function updateEventBasicsAction(input: {
  eventId: string;
  event_type: EventType;
  tradition_symbol: TraditionSymbolType;
  title: string;
  host_names: string;
  event_date: string | null;
  slug: string;
  welcome_message: string;
  theme_id: ThemeId;
  opening_animation: OpeningAnimationType;
  rsvp_enabled: boolean;
  // Phase 2 fields
  cover_image_url: string | null;
  gallery_images: string[];
  particle_effect: ParticleEffectType;
  scratch_reveal_enabled: boolean;
  music_track: MusicTrackType;
  custom_music_url: string | null;
}): Promise<ActionResult> {
  const { supabase, user } = await requireAuthenticatedUser();
  if (!user) return { ok: false, error: "Unauthorized" };

  const title = input.title.trim();
  const host_names = input.host_names.trim();
  const cleanSlug = slugify(input.slug);

  if (title.length < 2) {
    return { ok: false, error: "Event title must be at least 2 characters." };
  }
  if (host_names.length < 2) {
    return {
      ok: false,
      error: "Host / couple names must be at least 2 characters.",
    };
  }
  if (!isValidSlug(cleanSlug)) {
    return {
      ok: false,
      error:
        "Slug must be 3–80 lowercase letters, numbers, or hyphens (e.g. aanya-kabir-2026).",
    };
  }

  const safeCover = getSafeExternalUrl(input.cover_image_url);
  const safeGallery = (input.gallery_images ?? [])
    .map((u) => getSafeExternalUrl(u))
    .filter((u): u is string => Boolean(u))
    .slice(0, MAX_GALLERY_IMAGES);
  const safeCustomMusic = getSafeExternalUrl(input.custom_music_url);

  // RLS policy public.can_manage_event(id) authorizes owner + invited co-hosts
  const { error } = await supabase
    .from("events")
    .update({
      event_type: input.event_type,
      tradition_symbol: input.tradition_symbol,
      title,
      host_names,
      event_date: input.event_date || null,
      slug: cleanSlug,
      welcome_message: input.welcome_message.trim(),
      theme_id: input.theme_id,
      opening_animation: input.opening_animation,
      rsvp_enabled: input.rsvp_enabled,
      cover_image_url: safeCover,
      gallery_images: safeGallery,
      particle_effect: input.particle_effect,
      scratch_reveal_enabled: input.scratch_reveal_enabled,
      music_track: input.music_track,
      custom_music_url: safeCustomMusic,
    })
    .eq("id", input.eventId);

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error:
          "This URL slug is already used by another celebration. Please choose a different slug.",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/events/${input.eventId}`);
  return { ok: true };
}

export async function deleteEventAction(eventId: string): Promise<ActionResult> {
  const { supabase, user } = await requireAuthenticatedUser();
  if (!user) return { ok: false, error: "Unauthorized" };

  // Strictly primary owner only (enforced by both query filter and RLS)
  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId)
    .eq("host_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}

// -----------------------------------------------------------------------------
// SUB-EVENTS CRUD & REORDERING
// -----------------------------------------------------------------------------

export async function upsertSubEventAction(input: {
  id?: string;
  event_id: string;
  name: string;
  event_date: string | null;
  start_time: string;
  venue_name: string;
  maps_url: string;
  dress_code: string;
  sort_order: number;
}): Promise<ActionResult<{ id: string }>> {
  const { supabase, user } = await requireAuthenticatedUser();
  if (!user) return { ok: false, error: "Unauthorized" };

  const name = input.name.trim();
  if (!name) {
    return { ok: false, error: "Sub-event name is required." };
  }

  const rawMaps = input.maps_url.trim();
  if (rawMaps && !getSafeExternalUrl(rawMaps)) {
    return {
      ok: false,
      error: "Google Maps URL must start with https:// or http://",
    };
  }

  const payload = {
    event_id: input.event_id,
    name,
    event_date: input.event_date || null,
    start_time: input.start_time.trim() || null,
    venue_name: input.venue_name.trim() || null,
    maps_url: rawMaps || null,
    dress_code: input.dress_code.trim() || null,
    sort_order: input.sort_order,
  };

  if (input.id) {
    const { data, error } = await supabase
      .from("sub_events")
      .update(payload)
      .eq("id", input.id)
      .eq("event_id", input.event_id)
      .select("id")
      .single();

    if (error) return { ok: false, error: error.message };
    revalidatePath(`/dashboard/events/${input.event_id}`);
    return { ok: true, data: { id: data.id } };
  }

  const { data, error } = await supabase
    .from("sub_events")
    .insert(payload)
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/dashboard/events/${input.event_id}`);
  return { ok: true, data: { id: data.id } };
}

export async function deleteSubEventAction(
  eventId: string,
  subEventId: string
): Promise<ActionResult> {
  const { supabase, user } = await requireAuthenticatedUser();
  if (!user) return { ok: false, error: "Unauthorized" };

  const { data: categories } = await supabase
    .from("invite_categories")
    .select("id, allowed_sub_event_ids")
    .eq("event_id", eventId);

  if (categories) {
    for (const cat of categories) {
      if (cat.allowed_sub_event_ids?.includes(subEventId)) {
        const filtered = cat.allowed_sub_event_ids.filter(
          (id: string) => id !== subEventId
        );
        await supabase
          .from("invite_categories")
          .update({ allowed_sub_event_ids: filtered })
          .eq("id", cat.id)
          .eq("event_id", eventId);
      }
    }
  }

  const { error } = await supabase
    .from("sub_events")
    .delete()
    .eq("id", subEventId)
    .eq("event_id", eventId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/dashboard/events/${eventId}`);
  return { ok: true };
}

export async function reorderSubEventsAction(
  eventId: string,
  orderedIds: string[]
): Promise<ActionResult> {
  const { supabase, user } = await requireAuthenticatedUser();
  if (!user) return { ok: false, error: "Unauthorized" };

  for (let index = 0; index < orderedIds.length; index++) {
    const { error } = await supabase
      .from("sub_events")
      .update({ sort_order: index })
      .eq("id", orderedIds[index])
      .eq("event_id", eventId);

    if (error) {
      return { ok: false, error: error.message };
    }
  }

  revalidatePath(`/dashboard/events/${eventId}`);
  return { ok: true };
}

// -----------------------------------------------------------------------------
// INVITE CATEGORIES (SMART CATEGORY LINKS)
// -----------------------------------------------------------------------------

export async function upsertCategoryAction(input: {
  id?: string;
  event_id: string;
  name: string;
  side_tag: SideTag;
  etiquette_type: EtiquetteType;
  max_seats: number;
  allowed_sub_event_ids: string[];
  greeting_prefix: string;
}): Promise<ActionResult<{ id: string; code: string }>> {
  const { supabase, user } = await requireAuthenticatedUser();
  if (!user) return { ok: false, error: "Unauthorized" };

  const name = input.name.trim();
  if (!name) {
    return { ok: false, error: "Category name is required." };
  }

  const enforcedSeats =
    input.etiquette_type === "solo"
      ? 1
      : input.etiquette_type === "couple"
        ? 2
        : Math.max(1, Math.min(Math.floor(input.max_seats) || 4, 50));

  if (input.id) {
    const { data, error } = await supabase
      .from("invite_categories")
      .update({
        name,
        side_tag: input.side_tag,
        etiquette_type: input.etiquette_type,
        max_seats: enforcedSeats,
        allowed_sub_event_ids: input.allowed_sub_event_ids,
        greeting_prefix: input.greeting_prefix.trim() || null,
      })
      .eq("id", input.id)
      .eq("event_id", input.event_id)
      .select("id, code")
      .single();

    if (error) return { ok: false, error: error.message };
    revalidatePath(`/dashboard/events/${input.event_id}`);
    return { ok: true, data };
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateInviteCode(8);
    const { data, error } = await supabase
      .from("invite_categories")
      .insert({
        event_id: input.event_id,
        name,
        code,
        side_tag: input.side_tag,
        etiquette_type: input.etiquette_type,
        max_seats: enforcedSeats,
        allowed_sub_event_ids: input.allowed_sub_event_ids,
        greeting_prefix: input.greeting_prefix.trim() || null,
      })
      .select("id, code")
      .single();

    if (!error && data) {
      revalidatePath(`/dashboard/events/${input.event_id}`);
      return { ok: true, data };
    }

    if (error?.code !== "23505") {
      return {
        ok: false,
        error: error?.message ?? "Failed to create category.",
      };
    }
  }

  return {
    ok: false,
    error: "Could not generate a unique code. Please try again.",
  };
}

export async function deleteCategoryAction(
  eventId: string,
  categoryId: string
): Promise<ActionResult> {
  const { supabase, user } = await requireAuthenticatedUser();
  if (!user) return { ok: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("invite_categories")
    .delete()
    .eq("id", categoryId)
    .eq("event_id", eventId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/dashboard/events/${eventId}`);
  return { ok: true };
}

// -----------------------------------------------------------------------------
// MANUAL GUEST ENTRY & RSVP MODERATION
// -----------------------------------------------------------------------------

export async function addManualRsvpAction(input: {
  event_id: string;
  guest_name: string;
  phone_number: string;
  category_id: string | null;
  overall_attending: boolean;
  meal_preference: string;
  note: string;
  sub_events: { sub_event_id: string; attending: boolean; guest_count: number }[];
}): Promise<ActionResult<{ id: string }>> {
  const { supabase, user } = await requireAuthenticatedUser();
  if (!user) return { ok: false, error: "Unauthorized" };

  const guestName = input.guest_name.trim();
  if (guestName.length < 2) {
    return { ok: false, error: "Please enter the guest's full name." };
  }

  const rawPhone = input.phone_number.trim();
  const normalizedPhone = rawPhone
    ? normalizePhoneNumber(rawPhone)
    : `manual_${generateInviteCode(8)}`;

  if (rawPhone && normalizedPhone.length < 7) {
    return {
      ok: false,
      error: "Phone number looks too short—leave blank or enter a valid number.",
    };
  }

  const cleanSubEvents = (input.sub_events ?? []).map((item) => {
    const attending = input.overall_attending && Boolean(item.attending);
    const guestCount = attending
      ? Math.max(1, Math.min(Math.floor(Number(item.guest_count) || 1), 50))
      : 0;
    return {
      sub_event_id: item.sub_event_id,
      attending,
      guest_count: guestCount,
    };
  });

  const finalOverall =
    cleanSubEvents.length > 0
      ? input.overall_attending && cleanSubEvents.some((s) => s.attending)
      : input.overall_attending;

  // If a real phone number already exists on this event, update it cleanly rather than failing
  const { data: existing } = rawPhone
    ? await supabase
        .from("rsvps")
        .select("id")
        .eq("event_id", input.event_id)
        .eq("phone_number", normalizedPhone)
        .maybeSingle()
    : { data: null };

  let rsvpId: string;

  if (existing) {
    const { data, error } = await supabase
      .from("rsvps")
      .update({
        category_id: input.category_id || null,
        guest_name: guestName,
        overall_attending: finalOverall,
        meal_preference: finalOverall ? input.meal_preference.trim() || null : null,
        note: input.note.trim() || null,
        is_manual: true,
      })
      .eq("id", existing.id)
      .select("id")
      .single();

    if (error || !data) {
      return { ok: false, error: error?.message ?? "Could not update manual guest." };
    }
    rsvpId = data.id;
  } else {
    const { data, error } = await supabase
      .from("rsvps")
      .insert({
        event_id: input.event_id,
        category_id: input.category_id || null,
        guest_name: guestName,
        phone_number: normalizedPhone,
        overall_attending: finalOverall,
        meal_preference: finalOverall ? input.meal_preference.trim() || null : null,
        note: input.note.trim() || null,
        is_manual: true,
      })
      .select("id")
      .single();

    if (error || !data) {
      return { ok: false, error: error?.message ?? "Could not add manual guest." };
    }
    rsvpId = data.id;
  }

  if (cleanSubEvents.length > 0) {
    const { error: subErr } = await supabase.from("rsvp_sub_events").upsert(
      cleanSubEvents.map((s) => ({
        rsvp_id: rsvpId,
        sub_event_id: s.sub_event_id,
        attending: s.attending,
        guest_count: s.guest_count,
      })),
      { onConflict: "rsvp_id,sub_event_id" }
    );

    if (subErr) {
      return { ok: false, error: subErr.message };
    }
  }

  revalidatePath(`/dashboard/events/${input.event_id}`);
  return { ok: true, data: { id: rsvpId } };
}

export async function deleteRsvpAction(
  eventId: string,
  rsvpId: string
): Promise<ActionResult> {
  const { supabase, user } = await requireAuthenticatedUser();
  if (!user) return { ok: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("rsvps")
    .delete()
    .eq("id", rsvpId)
    .eq("event_id", eventId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/dashboard/events/${eventId}`);
  return { ok: true };
}

// -----------------------------------------------------------------------------
// CO-HOST MANAGEMENT (PRIMARY HOST OWNER ONLY, MAX 3 PER EVENT)
// -----------------------------------------------------------------------------

export async function addCohostAction(input: {
  event_id: string;
  email: string;
  side_tag: SideTag;
}): Promise<ActionResult<{ id: string }>> {
  const { supabase, user } = await requireAuthenticatedUser();
  if (!user) return { ok: false, error: "Unauthorized" };

  const cleanEmail = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  if (user.email && cleanEmail === user.email.toLowerCase()) {
    return {
      ok: false,
      error: "You are already the primary host of this event.",
    };
  }

  // Verify caller is the original event owner
  const { data: ownedEvent } = await supabase
    .from("events")
    .select("id")
    .eq("id", input.event_id)
    .eq("host_id", user.id)
    .maybeSingle();

  if (!ownedEvent) {
    return {
      ok: false,
      error: "Only the primary event host can invite Co-Hosts.",
    };
  }

  const { count } = await supabase
    .from("event_cohosts")
    .select("id", { count: "exact", head: true })
    .eq("event_id", input.event_id);

  if ((count ?? 0) >= MAX_COHOSTS_PER_EVENT) {
    return {
      ok: false,
      error: `You can invite up to ${MAX_COHOSTS_PER_EVENT} Co-Hosts per event.`,
    };
  }

  const { data, error } = await supabase
    .from("event_cohosts")
    .insert({
      event_id: input.event_id,
      email: cleanEmail,
      side_tag: input.side_tag,
      invited_by: user.id,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: "That email is already invited as a Co-Host on this event.",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath(`/dashboard/events/${input.event_id}`);
  return { ok: true, data: { id: data.id } };
}

export async function removeCohostAction(
  eventId: string,
  cohostId: string
): Promise<ActionResult> {
  const { supabase, user } = await requireAuthenticatedUser();
  if (!user) return { ok: false, error: "Unauthorized" };

  const { data: ownedEvent } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("host_id", user.id)
    .maybeSingle();

  if (!ownedEvent) {
    return {
      ok: false,
      error: "Only the primary event host can remove Co-Hosts.",
    };
  }

  const { error } = await supabase
    .from("event_cohosts")
    .delete()
    .eq("id", cohostId)
    .eq("event_id", eventId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/dashboard/events/${eventId}`);
  return { ok: true };
}
