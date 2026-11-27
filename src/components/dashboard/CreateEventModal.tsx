"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, X } from "lucide-react";
import { createEventAction } from "@/app/dashboard/actions";
import { EVENT_TYPES } from "@/lib/constants";
import { slugify } from "@/lib/utils";
import type { EventType } from "@/types/database";

interface CreateEventModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateEventModal({ open, onClose }: CreateEventModalProps) {
  const router = useRouter();
  const [eventType, setEventType] = useState<EventType>("wedding");
  const [title, setTitle] = useState("");
  const [hostNames, setHostNames] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleHostNamesChange = (val: string) => {
    setHostNames(val);
    if (!slugTouched) {
      setCustomSlug(slugify(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const result = await createEventAction({
        event_type: eventType,
        title,
        host_names: hostNames,
        event_date: eventDate || null,
        slug: customSlug || undefined,
      });

      if (!result.ok || !result.data) {
        setError(result.error || "Could not create event.");
        return;
      }

      onClose();
      router.push(`/dashboard/events/${result.data.id}`);
      router.refresh();
    } catch {
      setError("Unexpected error creating event. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#23070D]/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Create New Celebration"
    >
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[#C88A2E]/40 bg-[#FFFDF8] p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#C88A2E]">
              New Invitation
            </p>
            <h2 className="mt-1 font-serif text-3xl font-semibold text-[#4A101C]">
              Create Your Event
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#C88A2E]/30 text-[#5B1422] hover:bg-[#FCF5E8]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#8E1E31]/30 bg-[#8E1E31]/8 p-3 text-xs text-[#6B1222]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Event Type */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]">
              Celebration Type
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {EVENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setEventType(type.value)}
                  className={`cursor-pointer rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-colors ${
                    eventType === type.value
                      ? "border-[#5B1422] bg-[#5B1422] text-[#FCF8F1]"
                      : "border-[#C88A2E]/30 bg-white text-[#5B1422] hover:bg-[#FCF5E8]"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="new-host-names"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]"
            >
              Couple or Host Names *
            </label>
            <input
              id="new-host-names"
              type="text"
              required
              value={hostNames}
              onChange={(e) => handleHostNamesChange(e.target.value)}
              placeholder="e.g., Aanya & Kabir"
              className="w-full rounded-xl border border-[#C88A2E]/35 bg-white px-3.5 py-2.5 text-sm text-[#241815] focus:border-[#5B1422] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="new-event-title"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]"
            >
              Invitation Title *
            </label>
            <input
              id="new-event-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., The Royal Wedding Celebration"
              className="w-full rounded-xl border border-[#C88A2E]/35 bg-white px-3.5 py-2.5 text-sm text-[#241815] focus:border-[#5B1422] focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="new-event-date"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]"
              >
                Main Event Date
              </label>
              <input
                id="new-event-date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full rounded-xl border border-[#C88A2E]/35 bg-white px-3.5 py-2.5 text-sm text-[#241815] focus:border-[#5B1422] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="new-event-slug"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]"
              >
                Custom URL Slug
              </label>
              <input
                id="new-event-slug"
                type="text"
                value={customSlug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setCustomSlug(slugify(e.target.value));
                }}
                placeholder="aanya-and-kabir"
                className="w-full rounded-xl border border-[#C88A2E]/35 bg-white px-3.5 py-2.5 font-mono text-xs text-[#241815] focus:border-[#5B1422] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-xl border border-[#C88A2E]/35 bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422] hover:bg-[#FCF5E8]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="cursor-pointer rounded-xl bg-[#5B1422] px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#FCF8F1] shadow-sm transition-colors hover:bg-[#460E19] disabled:opacity-60"
            >
              {saving ? "Creating..." : "Create & Customize"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
