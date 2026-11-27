"use client";

import React, { useMemo, useState, useSyncExternalStore } from "react";
import { Check, CheckCircle2, Edit3, Users, AlertCircle } from "lucide-react";
import { MEAL_PREFERENCES } from "@/lib/constants";
import { getInviteTheme } from "@/lib/theme-styles";
import {
  formatShortDate,
  getEtiquetteHeadline,
  isValidPhoneNumber,
  normalizePhoneNumber,
} from "@/lib/utils";
import type { EtiquetteType, PublicSubEventDTO } from "@/types/database";

const emptySubscribe = () => () => {};

interface StoredReceipt {
  guestName: string;
  phoneNumber: string;
  overallAttending: boolean;
  mealPreference: string;
  note: string;
  subEvents: Record<string, { attending: boolean; guestCount: number }>;
  updatedAt: string;
}

interface RsvpFormProps {
  slug: string;
  code: string;
  etiquetteType: EtiquetteType;
  maxSeats: number;
  greetingPrefix?: string | null;
  subEvents: PublicSubEventDTO[];
  themeId?: string;
  demoMode?: boolean;
}

export function RsvpForm({
  slug,
  code,
  etiquetteType,
  maxSeats,
  greetingPrefix,
  subEvents,
  themeId,
  demoMode = false,
}: RsvpFormProps) {
  const storageKey = `saffronpass_rsvp:${slug}:${code}`;
  const theme = getInviteTheme(themeId);

  const effectiveMaxSeats =
    etiquetteType === "solo"
      ? 1
      : etiquetteType === "couple"
        ? 2
        : Math.max(1, maxSeats);

  const buildDefaultSubEventState = () => {
    const initial: Record<string, { attending: boolean; guestCount: number }> = {};
    for (const se of subEvents) {
      initial[se.id] = { attending: true, guestCount: 1 };
    }
    return initial;
  };

  // Hydration-safe read of returning guest localStorage receipt
  const persistedRaw = useSyncExternalStore(
    emptySubscribe,
    () => {
      if (demoMode) return null;
      try {
        return window.localStorage.getItem(storageKey);
      } catch {
        return null;
      }
    },
    () => null
  );

  const persistedReceipt = useMemo<StoredReceipt | null>(() => {
    if (!persistedRaw) return null;
    try {
      const parsed = JSON.parse(persistedRaw) as StoredReceipt;
      if (parsed && parsed.guestName && parsed.phoneNumber) {
        return parsed;
      }
    } catch {
      // Ignore malformed localStorage state
    }
    return null;
  }, [persistedRaw]);

  const [sessionReceipt, setSessionReceipt] = useState<StoredReceipt | null>(null);
  const savedReceipt = sessionReceipt ?? persistedReceipt;
  const [isEditing, setIsEditing] = useState(false);

  const [guestName, setGuestName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [overallAttending, setOverallAttending] = useState(true);
  const [mealPreference, setMealPreference] = useState<string>("Veg");
  const [note, setNote] = useState("");
  const [subEventState, setSubEventState] = useState<
    Record<string, { attending: boolean; guestCount: number }>
  >(buildDefaultSubEventState);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const startEditingFromReceipt = (receipt: StoredReceipt) => {
    setSuccessBanner(null);
    setErrorMessage(null);
    setGuestName(receipt.guestName);
    setPhoneNumber(receipt.phoneNumber);
    setOverallAttending(receipt.overallAttending);
    setMealPreference(receipt.mealPreference || "");
    setNote(receipt.note || "");

    const hydrated: Record<string, { attending: boolean; guestCount: number }> = {};
    for (const se of subEvents) {
      const prev = receipt.subEvents?.[se.id];
      hydrated[se.id] = {
        attending: prev ? Boolean(prev.attending) : receipt.overallAttending,
        guestCount:
          etiquetteType === "solo"
            ? 1
            : Math.max(1, Math.min(prev?.guestCount || 1, effectiveMaxSeats)),
      };
    }
    setSubEventState(hydrated);
    setIsEditing(true);
  };

  const handleToggleSubEvent = (subEventId: string, attending: boolean) => {
    setSubEventState((prev) => ({
      ...prev,
      [subEventId]: {
        attending,
        guestCount:
          etiquetteType === "solo"
            ? 1
            : Math.max(1, Math.min(prev[subEventId]?.guestCount || 1, effectiveMaxSeats)),
      },
    }));
  };

  const handleChangeSubEventCount = (subEventId: string, count: number) => {
    if (etiquetteType === "solo") return;
    const clamped = Math.max(1, Math.min(count, effectiveMaxSeats));
    setSubEventState((prev) => ({
      ...prev,
      [subEventId]: {
        attending: prev[subEventId]?.attending ?? true,
        guestCount: clamped,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessBanner(null);

    const trimmedName = guestName.trim();
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    if (trimmedName.length < 2) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!isValidPhoneNumber(normalizedPhone)) {
      setErrorMessage("Please enter a valid phone number (at least 10 digits).");
      return;
    }

    const subEventPayload = subEvents.map((se) => {
      const current = subEventState[se.id] ?? { attending: true, guestCount: 1 };
      const attending = overallAttending && current.attending;
      return {
        subEventId: se.id,
        attending,
        guestCount: attending
          ? etiquetteType === "solo"
            ? 1
            : Math.max(1, Math.min(current.guestCount, effectiveMaxSeats))
          : 0,
      };
    });

    if (overallAttending && subEvents.length > 0 && !subEventPayload.some((s) => s.attending)) {
      setErrorMessage(
        "Please select 'Yes' for at least one ceremony, or choose 'Regretfully Declines' above."
      );
      return;
    }

    if (demoMode) {
      const demoReceipt: StoredReceipt = {
        guestName: trimmedName,
        phoneNumber: normalizedPhone,
        overallAttending,
        mealPreference: overallAttending ? mealPreference : "",
        note: note.trim(),
        subEvents: subEventPayload.reduce<
          Record<string, { attending: boolean; guestCount: number }>
        >((acc, item) => {
          acc[item.subEventId] = {
            attending: item.attending,
            guestCount: item.guestCount,
          };
          return acc;
        }, {}),
        updatedAt: new Date().toISOString(),
      };
      setSessionReceipt(demoReceipt);
      setIsEditing(false);
      setSuccessBanner(
        "Demo RSVP confirmed! On a live invite, this syncs instantly to the host dashboard."
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          code,
          guestName: trimmedName,
          phoneNumber: normalizedPhone,
          overallAttending,
          mealPreference: overallAttending ? mealPreference : "",
          note: note.trim(),
          subEvents: subEventPayload,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Could not submit your RSVP. Please try again.");
        return;
      }

      const receipt: StoredReceipt = data.rsvp;
      setSessionReceipt(receipt);
      setIsEditing(false);
      setSuccessBanner(
        data.isUpdate
          ? "Your previous RSVP has been updated seamlessly."
          : "Thank you! Your RSVP has been recorded."
      );

      try {
        window.localStorage.setItem(storageKey, JSON.stringify(receipt));
      } catch {
        // Ignore private browsing storage quota errors
      }
    } catch {
      setErrorMessage(
        "Network error while sending RSVP. Please check your connection and retry."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const seatChoices = Array.from({ length: effectiveMaxSeats }, (_, idx) => idx + 1);

  return (
    <section
      id="rsvp-section"
      className={`mt-10 rounded-2xl border p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08)] sm:p-8 ${theme.cardBorder} ${theme.cardBg}`}
    >
      {/* Header & Etiquette Notice */}
      <div className="text-center">
        <p className={`text-[11px] font-semibold uppercase tracking-[0.26em] ${theme.accentText}`}>
          Kindly Respond
        </p>
        <h2 className={`mt-1.5 font-serif text-3xl font-semibold ${theme.headingText}`}>
          RSVP
        </h2>
        <div
          className={`mx-auto mt-3 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium ${theme.pillBg} ${theme.pillText}`}
        >
          <Users className={`h-3.5 w-3.5 ${theme.accentText}`} />
          <span>{getEtiquetteHeadline(etiquetteType, effectiveMaxSeats, greetingPrefix)}</span>
        </div>
      </div>

      {successBanner && (
        <div
          className={`mt-6 flex items-start gap-2.5 rounded-xl border p-3.5 text-sm ${
            theme.isDark
              ? "border-emerald-400/35 bg-emerald-950/60 text-emerald-200"
              : "border-[#1F6E4A]/30 bg-[#1F6E4A]/8 text-[#175438]"
          }`}
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Returning Guest Confirmed Receipt */}
      {savedReceipt && !isEditing ? (
        <div
          className={`mt-6 rounded-2xl border p-5 text-center sm:p-6 ${theme.subCardActive}`}
        >
          <div
            className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full ${
              theme.isDark
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-[#1F6E4A]/12 text-[#1F6E4A]"
            }`}
          >
            <Check className="h-5 w-5" />
          </div>
          <h3 className={`mt-3 font-serif text-2xl font-semibold ${theme.headingText}`}>
            You already confirmed
          </h3>
          <p className={`mt-1 text-sm ${theme.mutedText}`}>
            {savedReceipt.guestName} ·{" "}
            {savedReceipt.overallAttending
              ? "Joyfully Attending"
              : "Unable to Attend"}
          </p>

          {savedReceipt.overallAttending && subEvents.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {subEvents.map((se) => {
                const entry = savedReceipt.subEvents?.[se.id];
                const isYes = entry?.attending;
                return (
                  <span
                    key={se.id}
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${
                      isYes
                        ? theme.isDark
                          ? "border-emerald-400/35 bg-emerald-950/70 text-emerald-200"
                          : "border-[#1F6E4A]/30 bg-[#1F6E4A]/10 text-[#175438]"
                        : theme.isDark
                          ? "border-white/15 bg-white/5 text-[#A897A3] line-through"
                          : "border-[#241815]/12 bg-white/80 text-[#7A6258] line-through"
                    }`}
                  >
                    {se.name}
                    {isYes ? ` (${entry.guestCount})` : ""}
                  </span>
                );
              })}
            </div>
          )}

          <button
            type="button"
            onClick={() => startEditingFromReceipt(savedReceipt)}
            className={`mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${theme.secondaryBtn}`}
          >
            <Edit3 className="h-3.5 w-3.5" />
            Tap to Edit Your RSVP
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {errorMessage && (
            <div
              role="alert"
              className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-sm ${
                theme.isDark
                  ? "border-rose-400/40 bg-rose-950/60 text-rose-200"
                  : "border-[#8E1E31]/30 bg-[#8E1E31]/8 text-[#6B1222]"
              }`}
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Guest Details */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor={`guest-name-${code}`}
                className={`mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] ${theme.headingText}`}
              >
                Your Full Name *
              </label>
              <input
                id={`guest-name-${code}`}
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g., Rohan Mehta"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 ${theme.inputClass}`}
              />
            </div>

            <div>
              <label
                htmlFor={`guest-phone-${code}`}
                className={`mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] ${theme.headingText}`}
              >
                Phone Number (WhatsApp) *
              </label>
              <input
                id={`guest-phone-${code}`}
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98765 43210"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 ${theme.inputClass}`}
              />
            </div>
          </div>

          {/* Overall Attendance Toggle */}
          <div>
            <span
              className={`mb-2 block text-xs font-semibold uppercase tracking-[0.14em] ${theme.headingText}`}
            >
              Will You Join Us?
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOverallAttending(true)}
                className={`cursor-pointer rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                  overallAttending
                    ? `${theme.primaryBtn} border-transparent shadow-sm`
                    : theme.secondaryBtn
                }`}
              >
                Joyfully Accepts
              </button>
              <button
                type="button"
                onClick={() => setOverallAttending(false)}
                className={`cursor-pointer rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                  !overallAttending
                    ? `${theme.primaryBtn} border-transparent shadow-sm`
                    : theme.secondaryBtn
                }`}
              >
                Regretfully Declines
              </button>
            </div>
          </div>

          {/* Per-Event Attendance & Seat Controls */}
          {overallAttending && subEvents.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-semibold uppercase tracking-[0.14em] ${theme.headingText}`}
                >
                  Select Ceremonies &amp; Guests
                </span>
                <span className={`text-xs ${theme.mutedText}`}>
                  {etiquetteType === "solo"
                    ? "1 seat per ceremony"
                    : `Up to ${effectiveMaxSeats} seats per ceremony`}
                </span>
              </div>

              <div className="space-y-2.5">
                {subEvents.map((se) => {
                  const state = subEventState[se.id] ?? {
                    attending: true,
                    guestCount: 1,
                  };

                  return (
                    <div
                      key={se.id}
                      className={`rounded-xl border p-3.5 transition-colors sm:p-4 ${
                        state.attending ? theme.subCardActive : theme.subCardInactive
                      }`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className={`font-serif text-lg font-semibold ${theme.headingText}`}>
                            {se.name}
                          </p>
                          <p className={`text-xs ${theme.mutedText}`}>
                            {formatShortDate(se.event_date)}
                            {se.start_time ? ` · ${se.start_time}` : ""}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                          <div
                            className={`inline-flex rounded-lg border p-0.5 ${
                              theme.isDark
                                ? "border-[#E8C67A]/30 bg-[#170A1B]"
                                : "border-[#C88A2E]/35 bg-white"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => handleToggleSubEvent(se.id, true)}
                              className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                                state.attending
                                  ? "bg-[#1F6E4A] text-white"
                                  : `${theme.mutedText}`
                              }`}
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleSubEvent(se.id, false)}
                              className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                                !state.attending
                                  ? "bg-[#5B1422] text-white"
                                  : `${theme.mutedText}`
                              }`}
                            >
                              No
                            </button>
                          </div>

                          {/* Seat selector: strictly hidden for Solo */}
                          {state.attending &&
                            (etiquetteType === "solo" ? (
                              <span
                                className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium ${theme.pillBg} ${theme.pillText}`}
                              >
                                1 Guest
                              </span>
                            ) : (
                              <label className="inline-flex items-center gap-1.5 text-xs font-medium">
                                <span className="sr-only">Guests for {se.name}</span>
                                <select
                                  value={state.guestCount}
                                  onChange={(e) =>
                                    handleChangeSubEventCount(
                                      se.id,
                                      Number(e.target.value)
                                    )
                                  }
                                  className={`cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-semibold focus:outline-none ${theme.inputClass}`}
                                >
                                  {seatChoices.map((n) => (
                                    <option key={n} value={n}>
                                      {n} {n === 1 ? "Guest" : "Guests"}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Optional Meal Preference */}
          {overallAttending && (
            <div>
              <span
                className={`mb-2 block text-xs font-semibold uppercase tracking-[0.14em] ${theme.headingText}`}
              >
                Meal Preference (Optional)
              </span>
              <div className="flex flex-wrap gap-2">
                {MEAL_PREFERENCES.map((meal) => (
                  <button
                    key={meal}
                    type="button"
                    onClick={() =>
                      setMealPreference(mealPreference === meal ? "" : meal)
                    }
                    className={`cursor-pointer rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                      mealPreference === meal
                        ? "border-[#C88A2E] bg-[#C88A2E] text-[#241405]"
                        : `${theme.pillBg} ${theme.pillText}`
                    }`}
                  >
                    {meal}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Note / Blessings */}
          <div>
            <label
              htmlFor={`guest-note-${code}`}
              className={`mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] ${theme.headingText}`}
            >
              Blessings or Note for the Host (Optional)
            </label>
            <textarea
              id={`guest-note-${code}`}
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Warm wishes, arrival timing, or dietary notes..."
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 ${theme.inputClass}`}
            />
          </div>

          <div className="flex flex-col gap-2.5 pt-1 sm:flex-row">
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 cursor-pointer rounded-xl px-6 py-3.5 text-sm font-semibold tracking-[0.06em] shadow-md transition-all disabled:cursor-not-allowed disabled:opacity-60 ${theme.primaryBtn}`}
            >
              {submitting
                ? "Saving Your Response..."
                : savedReceipt
                  ? "Update My RSVP"
                  : "Confirm RSVP"}
            </button>
            {savedReceipt && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className={`cursor-pointer rounded-xl border px-5 py-3.5 text-sm font-medium transition-colors ${theme.secondaryBtn}`}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </section>
  );
}
