import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidInviteCode, isValidSlug } from "@/lib/utils";
import type { PublicInviteDTO, PublicSubEventDTO } from "@/types/database";

/**
 * Secure server-only lookup for public guest invitations.
 * Validates BOTH `slug` and `code`, and fetches ONLY sub-events explicitly listed
 * inside `invite_categories.allowed_sub_event_ids`.
 * Hidden ceremonies (e.g., Haldi) are NEVER fetched or serialized for unauthorized links.
 */
export async function getPublicInviteBySlugAndCode(
  rawSlug: string,
  rawCode: string
): Promise<PublicInviteDTO | null> {
  const slug = rawSlug.trim().toLowerCase();
  const code = rawCode.trim().toLowerCase();

  if (!isValidSlug(slug) || !isValidInviteCode(code)) {
    return null;
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return null;
  }

  // Step 1: Look up event strictly by exact slug, selecting only safe public fields
  const { data: eventRow, error: eventError } = await admin
    .from("events")
    .select(
      "id, slug, event_type, title, host_names, tradition_symbol, event_date, welcome_message, theme_id, opening_animation, rsvp_enabled, plan"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (eventError || !eventRow) {
    return null;
  }

  // Step 2: Validate category code strictly scoped to this event
  const { data: categoryRow, error: categoryError } = await admin
    .from("invite_categories")
    .select("id, code, etiquette_type, max_seats, allowed_sub_event_ids, greeting_prefix")
    .eq("event_id", eventRow.id)
    .eq("code", code)
    .maybeSingle();

  if (categoryError || !categoryRow) {
    return null;
  }

  const allowedIds: string[] = Array.isArray(categoryRow.allowed_sub_event_ids)
    ? categoryRow.allowed_sub_event_ids.filter(Boolean)
    : [];

  // Step 3: Fetch ONLY sub-events inside allowed_sub_event_ids for this event
  let allowedSubEvents: PublicSubEventDTO[] = [];
  if (allowedIds.length > 0) {
    const { data: subEventRows, error: subEventError } = await admin
      .from("sub_events")
      .select(
        "id, name, event_date, start_time, venue_name, maps_url, dress_code, sort_order"
      )
      .eq("event_id", eventRow.id)
      .in("id", allowedIds)
      .order("sort_order", { ascending: true });

    if (!subEventError && subEventRows) {
      allowedSubEvents = subEventRows;
    }
  }

  return {
    event: {
      slug: eventRow.slug,
      event_type: eventRow.event_type,
      title: eventRow.title,
      host_names: eventRow.host_names,
      tradition_symbol: eventRow.tradition_symbol,
      event_date: eventRow.event_date,
      welcome_message: eventRow.welcome_message,
      theme_id: eventRow.theme_id,
      opening_animation: eventRow.opening_animation,
      rsvp_enabled: eventRow.rsvp_enabled,
      plan: eventRow.plan,
    },
    category: {
      code: categoryRow.code,
      etiquette_type: categoryRow.etiquette_type,
      max_seats: categoryRow.max_seats,
      greeting_prefix: categoryRow.greeting_prefix,
    },
    sub_events: allowedSubEvents,
  };
}
