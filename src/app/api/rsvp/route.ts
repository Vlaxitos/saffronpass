import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { FREE_PLAN_RSVP_LIMIT } from "@/lib/constants";
import {
  isValidInviteCode,
  isValidPhoneNumber,
  isValidSlug,
  normalizePhoneNumber,
} from "@/lib/utils";

interface IncomingSubEventSelection {
  subEventId: string;
  attending: boolean;
  guestCount?: number;
}

interface IncomingRsvpPayload {
  slug?: string;
  code?: string;
  guestName?: string;
  phoneNumber?: string;
  overallAttending?: boolean;
  mealPreference?: string;
  note?: string;
  subEvents?: IncomingSubEventSelection[];
}

export async function POST(request: Request) {
  let body: IncomingRsvpPayload;
  try {
    body = (await request.json()) as IncomingRsvpPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 }
    );
  }

  const slug = (body.slug ?? "").trim().toLowerCase();
  const code = (body.code ?? "").trim().toLowerCase();
  const guestName = (body.guestName ?? "").trim();
  const normalizedPhone = normalizePhoneNumber(body.phoneNumber ?? "");
  const mealPreferenceRaw = (body.mealPreference ?? "").trim();
  const note = (body.note ?? "").trim().slice(0, 600);
  const requestedOverallAttending = Boolean(body.overallAttending);

  if (!isValidSlug(slug) || !isValidInviteCode(code)) {
    return NextResponse.json(
      { error: "This invitation link is invalid or no longer active." },
      { status: 404 }
    );
  }

  if (guestName.length < 2 || guestName.length > 120) {
    return NextResponse.json(
      { error: "Please enter your full name (2–120 characters)." },
      { status: 400 }
    );
  }

  if (!isValidPhoneNumber(normalizedPhone)) {
    return NextResponse.json(
      { error: "Please enter a valid phone number with at least 10 digits." },
      { status: 400 }
    );
  }

  const allowedMeals = new Set(["", "Veg", "Non-Veg", "Jain"]);
  const mealPreference = allowedMeals.has(mealPreferenceRaw)
    ? mealPreferenceRaw || null
    : null;

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json(
      { error: "RSVP service is temporarily unavailable. Please try again later." },
      { status: 503 }
    );
  }

  // 1. Validate event by exact slug
  const { data: eventRow, error: eventError } = await admin
    .from("events")
    .select("id, slug, plan, rsvp_enabled")
    .eq("slug", slug)
    .maybeSingle();

  if (eventError || !eventRow) {
    return NextResponse.json(
      { error: "This invitation link is invalid or no longer active." },
      { status: 404 }
    );
  }

  if (!eventRow.rsvp_enabled) {
    return NextResponse.json(
      { error: "RSVPs are currently closed for this event." },
      { status: 403 }
    );
  }

  // 2. Validate category strictly scoped to this event
  const { data: categoryRow, error: categoryError } = await admin
    .from("invite_categories")
    .select("id, etiquette_type, max_seats, allowed_sub_event_ids")
    .eq("event_id", eventRow.id)
    .eq("code", code)
    .maybeSingle();

  if (categoryError || !categoryRow) {
    return NextResponse.json(
      { error: "This invitation link is invalid or no longer active." },
      { status: 404 }
    );
  }

  // 3. Check for existing RSVP for (event_id, normalizedPhone)
  const { data: existingRsvp, error: existingError } = await admin
    .from("rsvps")
    .select("id")
    .eq("event_id", eventRow.id)
    .eq("phone_number", normalizedPhone)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json(
      { error: "Could not verify your RSVP status. Please try again." },
      { status: 500 }
    );
  }

  // 4. Enforce Free Plan 5-unique-RSVP cap ONLY for brand-new guests
  if (!existingRsvp && eventRow.plan === "free") {
    const { count, error: countError } = await admin
      .from("rsvps")
      .select("id", { count: "exact", head: true })
      .eq("event_id", eventRow.id);

    if (countError) {
      return NextResponse.json(
        { error: "Unable to process RSVP right now. Please try again." },
        { status: 500 }
      );
    }

    if ((count ?? 0) >= FREE_PLAN_RSVP_LIMIT) {
      return NextResponse.json(
        {
          error:
            "This preview invitation has reached its 5-guest test limit. Host can upgrade to unlock unlimited RSVPs.",
          code: "FREE_PLAN_LIMIT_REACHED",
        },
        { status: 403 }
      );
    }
  }

  // 5. Fetch verified allowed sub-events for this category
  const allowedIds: string[] = Array.isArray(categoryRow.allowed_sub_event_ids)
    ? categoryRow.allowed_sub_event_ids.filter(Boolean)
    : [];

  let verifiedAllowedIds: string[] = [];
  if (allowedIds.length > 0) {
    const { data: verifiedSubEvents } = await admin
      .from("sub_events")
      .select("id")
      .eq("event_id", eventRow.id)
      .in("id", allowedIds);

    verifiedAllowedIds = (verifiedSubEvents ?? []).map((se) => se.id);
  }

  // 6. Enforce etiquette & seat caps strictly on the server
  const maxSeatsAllowed =
    categoryRow.etiquette_type === "solo"
      ? 1
      : categoryRow.etiquette_type === "couple"
        ? 2
        : Math.max(1, Math.min(Number(categoryRow.max_seats) || 1, 50));

  const incomingMap = new Map<string, IncomingSubEventSelection>();
  if (Array.isArray(body.subEvents)) {
    for (const item of body.subEvents) {
      if (item && typeof item.subEventId === "string") {
        incomingMap.set(item.subEventId, item);
      }
    }
  }

  const sanitizedSubEvents = verifiedAllowedIds.map((subEventId) => {
    const submitted = incomingMap.get(subEventId);
    const isAttendingSubEvent =
      requestedOverallAttending && Boolean(submitted?.attending);

    let guestCount = 0;
    if (isAttendingSubEvent) {
      if (categoryRow.etiquette_type === "solo") {
        guestCount = 1;
      } else {
        const parsed = Number.isFinite(Number(submitted?.guestCount))
          ? Math.floor(Number(submitted?.guestCount))
          : 1;
        guestCount = Math.max(1, Math.min(parsed, maxSeatsAllowed));
      }
    }

    return {
      sub_event_id: subEventId,
      attending: isAttendingSubEvent,
      guest_count: guestCount,
    };
  });

  const finalOverallAttending =
    verifiedAllowedIds.length > 0
      ? requestedOverallAttending &&
        sanitizedSubEvents.some((se) => se.attending)
      : requestedOverallAttending;

  // 7. Upsert RSVP cleanly by unique (event_id, phone_number)
  let rsvpId: string;
  let isUpdate = false;

  if (existingRsvp) {
    isUpdate = true;
    const { data: updatedRow, error: updateError } = await admin
      .from("rsvps")
      .update({
        category_id: categoryRow.id,
        guest_name: guestName,
        overall_attending: finalOverallAttending,
        meal_preference: finalOverallAttending ? mealPreference : null,
        note: note || null,
      })
      .eq("id", existingRsvp.id)
      .select("id")
      .single();

    if (updateError || !updatedRow) {
      return NextResponse.json(
        { error: "Failed to update your RSVP. Please try again." },
        { status: 500 }
      );
    }
    rsvpId = updatedRow.id;
  } else {
    const { data: insertedRow, error: insertError } = await admin
      .from("rsvps")
      .insert({
        event_id: eventRow.id,
        category_id: categoryRow.id,
        guest_name: guestName,
        phone_number: normalizedPhone,
        overall_attending: finalOverallAttending,
        meal_preference: finalOverallAttending ? mealPreference : null,
        note: note || null,
        is_manual: false,
      })
      .select("id")
      .single();

    if (insertError || !insertedRow) {
      return NextResponse.json(
        { error: "Failed to save your RSVP. Please try again." },
        { status: 500 }
      );
    }
    rsvpId = insertedRow.id;
  }

  // 8. Persist per-event attendance counts
  if (sanitizedSubEvents.length > 0) {
    const rowsToUpsert = sanitizedSubEvents.map((se) => ({
      rsvp_id: rsvpId,
      sub_event_id: se.sub_event_id,
      attending: se.attending,
      guest_count: se.guest_count,
    }));

    const { error: subUpsertError } = await admin
      .from("rsvp_sub_events")
      .upsert(rowsToUpsert, { onConflict: "rsvp_id,sub_event_id" });

    if (subUpsertError) {
      return NextResponse.json(
        { error: "RSVP saved, but ceremony attendance counts failed to sync. Please retry." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    ok: true,
    isUpdate,
    rsvp: {
      guestName,
      phoneNumber: normalizedPhone,
      overallAttending: finalOverallAttending,
      mealPreference: finalOverallAttending ? mealPreference ?? "" : "",
      note,
      subEvents: sanitizedSubEvents.reduce<
        Record<string, { attending: boolean; guestCount: number }>
      >((acc, item) => {
        acc[item.sub_event_id] = {
          attending: item.attending,
          guestCount: item.guest_count,
        };
        return acc;
      }, {}),
      updatedAt: new Date().toISOString(),
    },
  });
}
