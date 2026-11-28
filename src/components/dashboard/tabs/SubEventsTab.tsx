"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  Clock,
  Edit3,
  ExternalLink,
  MapPin,
  Plus,
  Shirt,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  deleteSubEventAction,
  reorderSubEventsAction,
  upsertSubEventAction,
} from "@/app/dashboard/actions";
import { SUB_EVENT_PRESETS } from "@/lib/constants";
import { formatShortDate, getSafeExternalUrl } from "@/lib/utils";
import type { SubEventRecord } from "@/types/database";

interface SubEventsTabProps {
  eventId: string;
  defaultDate: string | null;
  subEvents: SubEventRecord[];
}

export function SubEventsTab({
  eventId,
  defaultDate,
  subEvents,
}: SubEventsTabProps) {
  const router = useRouter();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [eventDate, setEventDate] = useState(defaultDate ?? "");
  const [startTime, setStartTime] = useState("");
  const [venueName, setVenueName] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");
  const [dressCode, setDressCode] = useState("");

  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setEventDate(defaultDate ?? "");
    setStartTime("");
    setVenueName("");
    setMapsUrl("");
    setDressCode("");
  };

  const startEdit = (item: SubEventRecord) => {
    setEditingId(item.id);
    setName(item.name);
    setEventDate(item.event_date ?? "");
    setStartTime(item.start_time ?? "");
    setVenueName(item.venue_name ?? "");
    setMapsUrl(item.maps_url ?? "");
    setDressCode(item.dress_code ?? "");
  };

  const applyPreset = (preset: (typeof SUB_EVENT_PRESETS)[number]) => {
    setEditingId(null);
    setName(preset.name);
    setStartTime(preset.start_time);
    setDressCode(preset.dress_code);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const existing = subEvents.find((s) => s.id === editingId);
      const sortOrder = existing ? existing.sort_order : subEvents.length;

      const res = await upsertSubEventAction({
        id: editingId ?? undefined,
        event_id: eventId,
        name,
        event_date: eventDate || null,
        start_time: startTime,
        venue_name: venueName,
        maps_url: mapsUrl,
        dress_code: dressCode,
        sort_order: sortOrder,
      });

      if (!res.ok) {
        toast.error(res.error || "Failed to save ceremony.");
        return;
      }

      toast.success(
        editingId ? "Ceremony updated." : `"${name.trim()}" added to schedule.`
      );
      resetForm();
      router.refresh();
    } catch {
      toast.error("Network error while saving ceremony.");
    } finally {
      setSaving(false);
    }
  };

  const handleMove = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= subEvents.length) return;

    setReordering(true);
    const reordered = [...subEvents];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(target, 0, moved);

    try {
      const res = await reorderSubEventsAction(
        eventId,
        reordered.map((s) => s.id)
      );
      if (!res.ok) {
        toast.error(res.error || "Failed to reorder ceremonies.");
      } else {
        toast.success("Schedule order updated.");
        router.refresh();
      }
    } finally {
      setReordering(false);
    }
  };

  const handleDelete = async (subEventId: string, subName: string) => {
    setDeletingId(subEventId);
    try {
      const res = await deleteSubEventAction(eventId, subEventId);
      if (!res.ok) {
        toast.error(res.error || "Failed to delete ceremony.");
      } else {
        if (editingId === subEventId) resetForm();
        toast.success(`"${subName}" removed from schedule.`);
        router.refresh();
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-7">
      {/* Add / Edit Ceremony Form */}
      <section className="gold-shimmer-border rounded-2xl bg-[#FFFDF9] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="font-display text-[10px] font-semibold uppercase tracking-[0.24em] text-[#B88433]">
              Ceremony Builder
            </p>
            <h2 className="mt-1 font-editorial text-2xl font-semibold text-[#470F1B]">
              {editingId ? "Edit Ceremony" : "Add Ceremony / Function"}
            </h2>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="min-h-[38px] cursor-pointer rounded-lg px-3 text-xs font-semibold text-[#796258] hover:bg-[#FBF3E5] hover:text-[#54121F]"
            >
              Cancel Edit
            </button>
          )}
        </div>

        {/* Quick Ceremony Presets */}
        {!editingId && (
          <div className="mt-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8E786C]">
              Quick Prefill
            </p>
            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
              {SUB_EVENT_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="min-h-[38px] shrink-0 cursor-pointer rounded-full border border-[#B88433]/32 bg-[#FBF7F0] px-3.5 py-1.5 text-xs font-semibold text-[#54121F] transition-colors hover:bg-[#54121F] hover:text-[#FBF7F0]"
                >
                  + {preset.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="sub-name"
                className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#54121F]"
              >
                Function Name *
              </label>
              <input
                id="sub-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Haldi, Sangeet, Wedding, Reception"
                className="min-h-[44px] w-full rounded-xl border border-[#B88433]/32 bg-white px-3.5 py-2.5 text-sm text-[#221714] focus:border-[#54121F] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="sub-date"
                className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#54121F]"
              >
                Date
              </label>
              <input
                id="sub-date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="min-h-[44px] w-full rounded-xl border border-[#B88433]/32 bg-white px-3.5 py-2.5 text-sm text-[#221714] focus:border-[#54121F] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="sub-time"
                className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#54121F]"
              >
                Start Time
              </label>
              <input
                id="sub-time"
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="e.g., 7:30 PM"
                className="min-h-[44px] w-full rounded-xl border border-[#B88433]/32 bg-white px-3.5 py-2.5 text-sm text-[#221714] focus:border-[#54121F] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="sub-venue"
                className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#54121F]"
              >
                Venue Name &amp; Address
              </label>
              <input
                id="sub-venue"
                type="text"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                placeholder="e.g., Zenana Mahal, Udaipur"
                className="min-h-[44px] w-full rounded-xl border border-[#B88433]/32 bg-white px-3.5 py-2.5 text-sm text-[#221714] focus:border-[#54121F] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="sub-dress"
                className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#54121F]"
              >
                Dress Code
              </label>
              <input
                id="sub-dress"
                type="text"
                value={dressCode}
                onChange={(e) => setDressCode(e.target.value)}
                placeholder="e.g., Marigold Yellow Ethnic"
                className="min-h-[44px] w-full rounded-xl border border-[#B88433]/32 bg-white px-3.5 py-2.5 text-sm text-[#221714] focus:border-[#54121F] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="sub-maps"
                className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#54121F]"
              >
                Google Maps URL
              </label>
              <input
                id="sub-maps"
                type="url"
                value={mapsUrl}
                onChange={(e) => setMapsUrl(e.target.value)}
                placeholder="https://maps.google.com/?q=..."
                className="min-h-[44px] w-full rounded-xl border border-[#B88433]/32 bg-white px-3.5 py-2.5 text-sm text-[#221714] focus:border-[#54121F] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-[46px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#54121F] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FBF7F0] shadow-xs transition-colors hover:bg-[#3D0B16] disabled:opacity-60 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            {saving
              ? "Saving..."
              : editingId
                ? "Update Ceremony"
                : "Add to Schedule"}
          </button>
        </form>
      </section>

      {/* Ordered Schedule List */}
      <section className="space-y-3.5">
        <div>
          <h2 className="font-editorial text-2xl font-semibold text-[#470F1B]">
            Ceremonies Schedule ({subEvents.length})
          </h2>
          <p className="text-xs text-[#796258]">
            Arrange display order with arrows. Assign visibility per circle in
            Category Links.
          </p>
        </div>

        {subEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#B88433]/40 bg-[#FFFDF9] p-10 text-center">
            <p className="font-editorial text-xl font-semibold text-[#470F1B]">
              No Ceremonies Added Yet
            </p>
            <p className="mt-1.5 text-sm text-[#6C5950]">
              Add your Haldi, Mehendi, Sangeet, Wedding, Reception, or Puja
              above to preview your timeline.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {subEvents.map((item, idx) => {
              const safeUrl = getSafeExternalUrl(item.maps_url);
              return (
                <div
                  key={item.id}
                  className="gold-shimmer-border rounded-2xl bg-[#FFFDF9] p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FBF3E5] font-display text-[11px] font-semibold text-[#8E5B17]">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <h3 className="font-editorial text-2xl font-semibold text-[#470F1B]">
                          {item.name}
                        </h3>
                      </div>

                      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#5C4942]">
                        {item.event_date && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-[#B88433]" />
                            {formatShortDate(item.event_date)}
                          </span>
                        )}
                        {item.start_time && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-[#B88433]" />
                            {item.start_time}
                          </span>
                        )}
                        {item.dress_code && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#FBF3E5] px-2.5 py-0.5 font-medium text-[#54121F]">
                            <Shirt className="h-3 w-3 text-[#B88433]" />
                            {item.dress_code}
                          </span>
                        )}
                      </div>

                      {item.venue_name && (
                        <p className="mt-2 flex items-start gap-1.5 text-xs text-[#4A3832]">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B88433]" />
                          <span>{item.venue_name}</span>
                        </p>
                      )}

                      {safeUrl && (
                        <a
                          href={safeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#54121F] underline-offset-2 hover:underline"
                        >
                          Google Maps Link
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        disabled={idx === 0 || reordering}
                        onClick={() => handleMove(idx, -1)}
                        aria-label={`Move ${item.name} up`}
                        className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#B88433]/30 bg-white text-[#54121F] hover:bg-[#FBF3E5] disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === subEvents.length - 1 || reordering}
                        onClick={() => handleMove(idx, 1)}
                        aria-label={`Move ${item.name} down`}
                        className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#B88433]/30 bg-white text-[#54121F] hover:bg-[#FBF3E5] disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        aria-label={`Edit ${item.name}`}
                        className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#B88433]/30 bg-white text-[#54121F] hover:bg-[#FBF3E5]"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === item.id}
                        onClick={() => handleDelete(item.id, item.name)}
                        aria-label={`Delete ${item.name}`}
                        className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#8E1E31]/25 bg-white text-[#8E1E31] hover:bg-[#8E1E31]/8 disabled:opacity-40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
