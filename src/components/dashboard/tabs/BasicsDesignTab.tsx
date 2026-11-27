"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";
import {
  deleteEventAction,
  updateEventBasicsAction,
} from "@/app/dashboard/actions";
import { TraditionSymbol } from "@/components/invite/TraditionSymbol";
import {
  EVENT_TYPES,
  OPENING_ANIMATIONS,
  THEMES,
  TRADITION_SYMBOLS,
} from "@/lib/constants";
import { buildDefaultSlug, slugify } from "@/lib/utils";
import type {
  EventRecord,
  EventType,
  OpeningAnimationType,
  ThemeId,
  TraditionSymbolType,
} from "@/types/database";

interface BasicsDesignTabProps {
  event: EventRecord;
}

export function BasicsDesignTab({ event }: BasicsDesignTabProps) {
  const router = useRouter();

  const [eventType, setEventType] = useState<EventType>(event.event_type);
  const [traditionSymbol, setTraditionSymbol] = useState<TraditionSymbolType>(
    event.tradition_symbol
  );
  const [title, setTitle] = useState(event.title);
  const [hostNames, setHostNames] = useState(event.host_names);
  const [eventDate, setEventDate] = useState(event.event_date ?? "");
  const [slug, setSlug] = useState(event.slug);
  const [welcomeMessage, setWelcomeMessage] = useState(
    event.welcome_message ?? ""
  );
  const [themeId, setThemeId] = useState<ThemeId>(
    event.theme_id === "minimal_ivory" ? "minimal_ivory" : "royal_saffron"
  );
  const [openingAnimation, setOpeningAnimation] =
    useState<OpeningAnimationType>(event.opening_animation);
  const [rsvpEnabled, setRsvpEnabled] = useState(event.rsvp_enabled);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSavedNotice(null);
    setSaving(true);

    try {
      const res = await updateEventBasicsAction({
        eventId: event.id,
        event_type: eventType,
        tradition_symbol: traditionSymbol,
        title,
        host_names: hostNames,
        event_date: eventDate || null,
        slug,
        welcome_message: welcomeMessage,
        theme_id: themeId,
        opening_animation: openingAnimation,
        rsvp_enabled: rsvpEnabled,
      });

      if (!res.ok) {
        setError(res.error || "Could not save changes.");
        return;
      }

      setSlug(slugify(slug));
      setSavedNotice("Invitation basics & design saved successfully.");
      router.refresh();
    } catch {
      setError("Network error while saving changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async () => {
    setDeleting(true);
    setError(null);
    try {
      const res = await deleteEventAction(event.id);
      if (!res.ok) {
        setError(res.error || "Could not delete event.");
        setDeleting(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Unexpected error deleting event.");
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-[#8E1E31]/30 bg-[#8E1E31]/8 p-4 text-sm text-[#6B1222]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {savedNotice && (
        <div className="flex items-start gap-2.5 rounded-xl border border-[#1F6E4A]/30 bg-[#1F6E4A]/8 p-4 text-sm text-[#175438]">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* 1. Event Type Picker */}
      <section className="rounded-2xl border border-[#C88A2E]/30 bg-[#FFFDF8] p-5 sm:p-7">
        <h2 className="font-serif text-2xl font-semibold text-[#4A101C]">
          Celebration Type
        </h2>
        <p className="mt-1 text-xs text-[#7A6258]">
          Select the occasion to tailor your invitation tone and metadata.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          {EVENT_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setEventType(type.value)}
              className={`cursor-pointer rounded-xl border p-3.5 text-left transition-all ${
                eventType === type.value
                  ? "border-[#5B1422] bg-[#5B1422] text-[#FCF8F1] shadow-sm"
                  : "border-[#C88A2E]/30 bg-white text-[#4A101C] hover:bg-[#FCF5E8]"
              }`}
            >
              <p className="text-sm font-semibold">{type.label}</p>
              <p
                className={`mt-0.5 text-[11px] ${
                  eventType === type.value ? "text-[#F4E4C1]/85" : "text-[#7A6258]"
                }`}
              >
                {type.subtitle}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* 2. Core Details & Slug */}
      <section className="rounded-2xl border border-[#C88A2E]/30 bg-[#FFFDF8] p-5 sm:p-7">
        <h2 className="font-serif text-2xl font-semibold text-[#4A101C]">
          Event Details &amp; Invitation Link
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="basics-host-names"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]"
            >
              Host / Couple Names *
            </label>
            <input
              id="basics-host-names"
              type="text"
              required
              value={hostNames}
              onChange={(e) => setHostNames(e.target.value)}
              placeholder="e.g., Aanya & Kabir"
              className="w-full rounded-xl border border-[#C88A2E]/35 bg-white px-3.5 py-2.5 text-sm text-[#241815] focus:border-[#5B1422] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="basics-title"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]"
            >
              Event Title *
            </label>
            <input
              id="basics-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., The Royal Wedding Celebration"
              className="w-full rounded-xl border border-[#C88A2E]/35 bg-white px-3.5 py-2.5 text-sm text-[#241815] focus:border-[#5B1422] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="basics-date"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]"
            >
              Main Event Date
            </label>
            <input
              id="basics-date"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full rounded-xl border border-[#C88A2E]/35 bg-white px-3.5 py-2.5 text-sm text-[#241815] focus:border-[#5B1422] focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-[#7A6258]">
              Drives the live countdown timer on your guest invitations.
            </p>
          </div>

          <div>
            <label
              htmlFor="basics-slug"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]"
            >
              Custom URL Slug *
            </label>
            <div className="flex gap-2">
              <input
                id="basics-slug"
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder="aanya-kabir-2026"
                className="flex-1 rounded-xl border border-[#C88A2E]/35 bg-white px-3.5 py-2.5 font-mono text-xs text-[#241815] focus:border-[#5B1422] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSlug(buildDefaultSlug(hostNames || title))}
                title="Generate a fresh slug from host names"
                className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-[#C88A2E]/35 bg-[#FCF8F1] px-3 py-2 text-xs font-medium text-[#5B1422] hover:bg-[#F5ECDC]"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Auto
              </button>
            </div>
            <p className="mt-1 font-mono text-[11px] text-[#7A6258]">
              Invite URL format: /{slug || "your-slug"}/[secret-code]
            </p>
          </div>
        </div>

        <div className="mt-5">
          <label
            htmlFor="basics-welcome"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]"
          >
            Welcome Message
          </label>
          <textarea
            id="basics-welcome"
            rows={3}
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            placeholder="With the blessings of our elders, we joyfully invite you to celebrate with us..."
            className="w-full rounded-xl border border-[#C88A2E]/35 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-[#241815] focus:border-[#5B1422] focus:outline-none"
          />
        </div>
      </section>

      {/* 3. Tradition Symbol Picker */}
      <section className="rounded-2xl border border-[#C88A2E]/30 bg-[#FFFDF8] p-5 sm:p-7">
        <h2 className="font-serif text-2xl font-semibold text-[#4A101C]">
          Tradition Symbol
        </h2>
        <p className="mt-1 text-xs text-[#7A6258]">
          Displayed delicately at the crown of your invitation stationery.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {TRADITION_SYMBOLS.map((sym) => {
            const active = traditionSymbol === sym.value;
            return (
              <button
                key={sym.value}
                type="button"
                onClick={() => setTraditionSymbol(sym.value)}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border px-3 py-4 text-center transition-all ${
                  active
                    ? "border-[#5B1422] bg-[#FCF5E8] shadow-sm ring-1 ring-[#5B1422]"
                    : "border-[#C88A2E]/30 bg-white hover:bg-[#FCF8F1]"
                }`}
              >
                <div className="flex h-12 items-center justify-center">
                  {sym.value === "none" ? (
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-[#8E786C]">
                      —
                    </span>
                  ) : (
                    <TraditionSymbol
                      symbol={sym.value}
                      size={44}
                      className={active ? "text-[#5B1422]" : "text-[#C88A2E]"}
                    />
                  )}
                </div>
                <p className="mt-2 text-xs font-semibold text-[#4A101C]">
                  {sym.label}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Starter Theme & Opening Animation */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#C88A2E]/30 bg-[#FFFDF8] p-5 sm:p-7">
          <h2 className="font-serif text-2xl font-semibold text-[#4A101C]">
            Starter Theme
          </h2>
          <div className="mt-4 space-y-3">
            {THEMES.map((theme) => {
              const active = themeId === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setThemeId(theme.id)}
                  className={`flex w-full cursor-pointer items-start justify-between gap-4 rounded-xl border p-4 text-left transition-all ${
                    active
                      ? "border-[#5B1422] bg-[#FCF5E8] ring-1 ring-[#5B1422]"
                      : "border-[#C88A2E]/30 bg-white hover:bg-[#FCF8F1]"
                  }`}
                >
                  <div>
                    <p className="font-serif text-xl font-semibold text-[#4A101C]">
                      {theme.name}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[#69564E]">
                      {theme.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center -space-x-1.5 pt-1">
                    {theme.swatches.map((hex) => (
                      <span
                        key={hex}
                        className="h-6 w-6 rounded-full border border-black/15 shadow-xs"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-[#C88A2E]/30 bg-[#FFFDF8] p-5 sm:p-7">
          <h2 className="font-serif text-2xl font-semibold text-[#4A101C]">
            Opening Animation
          </h2>
          <div className="mt-4 space-y-3">
            {OPENING_ANIMATIONS.map((anim) => {
              const active = openingAnimation === anim.id;
              return (
                <button
                  key={anim.id}
                  type="button"
                  onClick={() => setOpeningAnimation(anim.id)}
                  className={`block w-full cursor-pointer rounded-xl border p-4 text-left transition-all ${
                    active
                      ? "border-[#5B1422] bg-[#FCF5E8] ring-1 ring-[#5B1422]"
                      : "border-[#C88A2E]/30 bg-white hover:bg-[#FCF8F1]"
                  }`}
                >
                  <p className="font-serif text-xl font-semibold text-[#4A101C]">
                    {anim.name}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#69564E]">
                    {anim.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. RSVP Enabled Toggle */}
      <section className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-[#C88A2E]/30 bg-[#FFFDF8] p-5 sm:flex-row sm:items-center sm:p-7">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#4A101C]">
            Guest RSVP Collection
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-[#69564E]">
            When enabled, guests can confirm attendance and seat counts per
            ceremony. Turn off to make your invitation view-only.
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={rsvpEnabled}
          aria-label="Toggle RSVP Enabled"
          onClick={() => setRsvpEnabled((prev) => !prev)}
          className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer items-center rounded-full p-1 transition-colors ${
            rsvpEnabled ? "bg-[#1F6E4A]" : "bg-[#C7B8AD]"
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
              rsvpEnabled ? "translate-x-8" : "translate-x-0"
            }`}
          />
        </button>
      </section>

      {/* Save Action & Danger Zone */}
      <div className="flex flex-col-reverse items-stretch justify-between gap-4 border-t border-[#C88A2E]/25 pt-6 sm:flex-row sm:items-center">
        <div>
          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-[#8E1E31] hover:underline"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete This Event
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#8E1E31]/35 bg-[#8E1E31]/8 px-3.5 py-2 text-xs">
              <span className="font-medium text-[#6B1222]">
                Permanently delete event &amp; all RSVPs?
              </span>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteEvent}
                className="cursor-pointer rounded-lg bg-[#8E1E31] px-3 py-1 font-semibold text-white hover:bg-[#6B1222]"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="cursor-pointer rounded-lg border border-[#8E1E31]/30 bg-white px-2.5 py-1 font-medium text-[#6B1222]"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#5B1422] px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#FCF8F1] shadow-md transition-colors hover:bg-[#460E19] disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving Changes..." : "Save Basics & Design"}
        </button>
      </div>
    </form>
  );
}
