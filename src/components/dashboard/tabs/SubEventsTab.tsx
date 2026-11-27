"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
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
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setEventDate(defaultDate ?? "");
    setStartTime("");
    setVenueName("");
    setMapsUrl("");
    setDressCode("");
    setError(null);
  };

  const startEdit = (item: SubEventRecord) => {
    setEditingId(item.id);
    setName(item.name);
    setEventDate(item.event_date ?? "");
    setStartTime(item.start_time ?? "");
    setVenueName(item.venue_name ?? "");
    setMapsUrl(item.maps_url ?? "");
    setDressCode(item.dress_code ?? "");
    setError(null);
  };

  const applyPreset = (preset: (typeof SUB_EVENT_PRESETS)[number]) => {
    setEditingId(null);
    setName(preset.name);
    setStartTime(preset.start_time);
    setDressCode(preset.dress_code);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
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
        setError(res.error || "Failed to save sub-event.");
        return;
      }

      resetForm();
      router.refresh();
    } catch {
      setError("Network error while saving sub-event.");
    } finally {
      setSaving(false);
    }
  };

  const handleMove = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= subEvents.length) return;

    setReordering(true);
    setError(null);
    const reordered = [...subEvents];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(target, 0, moved);

    try {
      const res = await reorderSubEventsAction(
        eventId,
        reordered.map((s) => s.id)
      );
      if (!res.ok) {
        setError(res.error || "Failed to reorder ceremonies.");
      } else {
        router.refresh();
      }
    } finally {
      setReordering(false);
    }
  };

  const handleDelete = async (subEventId: string) => {
    setDeletingId(subEventId);
    setError(null);
    try {
      const res = await deleteSubEventAction(eventId, subEventId);
      if (!res.ok) {
        setError(res.error || "Failed to delete sub-event.");
      } else {
        if (editingId === subEventId) resetForm();
        router.refresh();
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* Add / Edit Sub-Event Form */}
      <section className="rounded-2xl border border-[#C88A2E]/30 bg-[#FFFDF8] p-5 sm:p-6 lg:col-span-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-serif text-2xl font-semibold text-[#4A101C]">
            {editingId ? "Edit Ceremony" : "Add Ceremony / Function"}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="cursor-pointer text-xs font-medium text-[#7A6258] hover:text-[#5B1422]"
            >
              Cancel Edit
            </button>
          )}
        </div>

        {/* Quick Ceremony Presets */}
        {!editingId && (
          <div className="mt-3">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#8E786C]">
              Quick Prefill
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SUB_EVENT_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="cursor-pointer rounded-full border border-[#C88A2E]/35 bg-[#FCF8F1] px-3 py-1 text-xs font-medium text-[#5B1422] transition-colors hover:bg-[#5B1422] hover:text-[#FCF8F1]"
                >
                  + {preset.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#8E1E31]/30 bg-[#8E1E31]/8 p-3 text-xs text-[#6B1222]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="sub-name"
              className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]"
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
              className="w-full rounded-xl border border-[#C88A2E]/35 bg-white px-3.5 py-2.5 text-sm text-[#241815] focus:border-[#5B1422] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="sub-date"
                className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]"
              >
                Date
              </label>
              <input
                id="sub-date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full rounded-xl border border-[#C88A2E]/35 bg-white px-3 py-2.5 text-sm text-[#241815] focus:border-[#5B1422] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="sub-time"
                className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]"
              >
                Start Time
              </label>
              <input
                id="sub-time"
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="e.g., 7:30 PM"
                className="w-full rounded-xl border border-[#C88A2E]/35 bg-white px-3 py-2.5 text-sm text-[#241815] focus:border-[#5B1422] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="sub-venue"
              className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]"
            >
              Venue Name &amp; Address
            </label>
            <input
              id="sub-venue"
              type="text"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              placeholder="e.g., Courtyard Lawn, Taj Rambagh Palace, Jaipur"
              className="w-full rounded-xl border border-[#C88A2E]/35 bg-white px-3.5 py-2.5 text-sm text-[#241815] focus:border-[#5B1422] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="sub-maps"
              className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]"
            >
              Google Maps URL
            </label>
            <input
              id="sub-maps"
              type="url"
              value={mapsUrl}
              onChange={(e) => setMapsUrl(e.target.value)}
              placeholder="https://maps.google.com/?q=..."
              className="w-full rounded-xl border border-[#C88A2E]/35 bg-white px-3.5 py-2.5 text-sm text-[#241815] focus:border-[#5B1422] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="sub-dress"
              className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]"
            >
              Dress Code
            </label>
            <input
              id="sub-dress"
              type="text"
              value={dressCode}
              onChange={(e) => setDressCode(e.target.value)}
              placeholder="e.g., Marigold Yellow Ethnic"
              className="w-full rounded-xl border border-[#C88A2E]/35 bg-white px-3.5 py-2.5 text-sm text-[#241815] focus:border-[#5B1422] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#5B1422] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#FCF8F1] shadow-sm transition-colors hover:bg-[#460E19] disabled:opacity-60"
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
      <section className="space-y-4 lg:col-span-7">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-[#4A101C]">
              Ceremonies Schedule ({subEvents.length})
            </h2>
            <p className="text-xs text-[#7A6258]">
              Use the arrows to arrange the exact chronological display order.
            </p>
          </div>
        </div>

        {subEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#C88A2E]/40 bg-[#FFFDF8] p-10 text-center">
            <p className="font-serif text-xl font-semibold text-[#4A101C]">
              No Ceremonies Added Yet
            </p>
            <p className="mt-1.5 text-sm text-[#69564E]">
              Add your Haldi, Mehendi, Sangeet, Wedding, Reception, or Puja on
              the left. Then assign which guest circles can view each one in Tab 3.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {subEvents.map((item, idx) => {
              const safeUrl = getSafeExternalUrl(item.maps_url);
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[#C88A2E]/30 bg-[#FFFDF8] p-5 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FCF5E8] text-xs font-semibold text-[#8E5B17]">
                          {idx + 1}
                        </span>
                        <h3 className="font-serif text-2xl font-semibold text-[#4A101C]">
                          {item.name}
                        </h3>
                      </div>

                      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#5C4942]">
                        {item.event_date && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-[#C88A2E]" />
                            {formatShortDate(item.event_date)}
                          </span>
                        )}
                        {item.start_time && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-[#C88A2E]" />
                            {item.start_time}
                          </span>
                        )}
                        {item.dress_code && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#FCF5E8] px-2.5 py-0.5 font-medium text-[#5B1422]">
                            <Shirt className="h-3 w-3 text-[#C88A2E]" />
                            {item.dress_code}
                          </span>
                        )}
                      </div>

                      {item.venue_name && (
                        <p className="mt-2 flex items-start gap-1.5 text-xs text-[#4A3832]">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C88A2E]" />
                          <span>{item.venue_name}</span>
                        </p>
                      )}

                      {safeUrl && (
                        <a
                          href={safeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#5B1422] underline-offset-2 hover:underline"
                        >
                          Google Maps Link
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>

                    {/* Reorder, Edit, Delete Controls */}
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0 || reordering}
                        onClick={() => handleMove(idx, -1)}
                        aria-label={`Move ${item.name} up`}
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[#C88A2E]/30 bg-white text-[#5B1422] hover:bg-[#FCF5E8] disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === subEvents.length - 1 || reordering}
                        onClick={() => handleMove(idx, 1)}
                        aria-label={`Move ${item.name} down`}
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[#C88A2E]/30 bg-white text-[#5B1422] hover:bg-[#FCF5E8] disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        aria-label={`Edit ${item.name}`}
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[#C88A2E]/30 bg-white text-[#5B1422] hover:bg-[#FCF5E8]"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === item.id}
                        onClick={() => handleDelete(item.id)}
                        aria-label={`Delete ${item.name}`}
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[#8E1E31]/25 bg-white text-[#8E1E31] hover:bg-[#8E1E31]/8 disabled:opacity-40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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
