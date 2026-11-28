"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, X } from "lucide-react";
import { toast } from "sonner";
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
        const msg = result.error || "Could not create event.";
        setError(msg);
        toast.error(msg);
        return;
      }

      toast.success("Celebration created! Opening your invitation studio.");
      onClose();
      router.push(`/dashboard/events/${result.data.id}`);
      router.refresh();
    } catch {
      const msg = "Unexpected error creating event. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A060B]/75 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Create New Celebration"
    >
      <div className="texture-paper gold-shimmer-border max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-[28px] bg-[#FFFDF9] p-6 shadow-2xl sm:p-8">
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-display text-[10px] font-semibold uppercase tracking-[0.26em] text-[#B88433]">
                New Invitation
              </p>
              <h2 className="mt-1 font-editorial text-3xl font-semibold text-[#3E0D17]">
                Create Your Event
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#B88433]/30 text-[#54121F] transition-colors hover:bg-[#FCF5E8]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#8E1E31]/30 bg-[#8E1E31]/8 p-3.5 text-xs text-[#6B1222]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Event Type */}
            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#54121F]">
                Celebration Type
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {EVENT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setEventType(type.value)}
                    className={`min-h-[44px] cursor-pointer rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-all ${
                      eventType === type.value
                        ? "border-[#54121F] bg-[#54121F] text-[#FBF7F0] shadow-sm"
                        : "border-[#B88433]/30 bg-white text-[#54121F] hover:border-[#B88433]/65 hover:bg-[#FCF5E8]"
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
                className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#54121F]"
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
                className="min-h-[44px] w-full rounded-xl border border-[#B88433]/35 bg-white px-3.5 py-2.5 text-sm text-[#221714] focus:border-[#54121F] focus:outline-none focus:ring-2 focus:ring-[#B88433]/25"
              />
            </div>

            <div>
              <label
                htmlFor="new-event-title"
                className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#54121F]"
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
                className="min-h-[44px] w-full rounded-xl border border-[#B88433]/35 bg-white px-3.5 py-2.5 text-sm text-[#221714] focus:border-[#54121F] focus:outline-none focus:ring-2 focus:ring-[#B88433]/25"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="new-event-date"
                  className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#54121F]"
                >
                  Main Event Date
                </label>
                <input
                  id="new-event-date"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="min-h-[44px] w-full rounded-xl border border-[#B88433]/35 bg-white px-3.5 py-2.5 text-sm text-[#221714] focus:border-[#54121F] focus:outline-none focus:ring-2 focus:ring-[#B88433]/25"
                />
              </div>

              <div>
                <label
                  htmlFor="new-event-slug"
                  className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#54121F]"
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
                  className="min-h-[44px] w-full rounded-xl border border-[#B88433]/35 bg-white px-3.5 py-2.5 font-mono text-xs text-[#221714] focus:border-[#54121F] focus:outline-none focus:ring-2 focus:ring-[#B88433]/25"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse justify-end gap-2.5 pt-3 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] cursor-pointer rounded-full border border-[#B88433]/35 bg-white px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#54121F] transition-colors hover:bg-[#FCF5E8]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-full bg-[#54121F] px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FBF7F0] shadow-sm transition-colors hover:bg-[#3E0D17] disabled:opacity-60"
              >
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {saving ? "Creating..." : "Create & Customize"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
