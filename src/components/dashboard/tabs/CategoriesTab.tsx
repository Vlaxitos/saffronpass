"use client";

import React, { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Check,
  Copy,
  Edit3,
  ExternalLink,
  EyeOff,
  Link2,
  MessageCircle,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import {
  deleteCategoryAction,
  upsertCategoryAction,
} from "@/app/dashboard/actions";
import {
  ETIQUETTE_OPTIONS,
  getSideTagLabel,
  SIDE_TAGS,
} from "@/lib/constants";
import type {
  EtiquetteType,
  InviteCategoryRecord,
  SideTag,
  SubEventRecord,
} from "@/types/database";

const emptySubscribe = () => () => {};

interface CategoriesTabProps {
  eventId: string;
  eventSlug: string;
  hostNames: string;
  eventTitle: string;
  subEvents: SubEventRecord[];
  categories: InviteCategoryRecord[];
}

export function CategoriesTab({
  eventId,
  eventSlug,
  hostNames,
  eventTitle,
  subEvents,
  categories,
}: CategoriesTabProps) {
  const router = useRouter();
  const origin = useSyncExternalStore(
    emptySubscribe,
    () => window.location.origin,
    () => ""
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [sideTag, setSideTag] = useState<SideTag>("common");
  const [etiquetteType, setEtiquetteType] = useState<EtiquetteType>("family");
  const [maxSeats, setMaxSeats] = useState(4);
  const [greetingPrefix, setGreetingPrefix] = useState("With Family (Saparivar)");
  const [allowedSubEventIds, setAllowedSubEventIds] = useState<string[]>(() =>
    subEvents.map((s) => s.id)
  );

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setSideTag("common");
    setEtiquetteType("family");
    setMaxSeats(4);
    setGreetingPrefix("With Family (Saparivar)");
    setAllowedSubEventIds(subEvents.map((s) => s.id));
    setError(null);
  };

  const startEdit = (cat: InviteCategoryRecord) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSideTag(cat.side_tag);
    setEtiquetteType(cat.etiquette_type);
    setMaxSeats(cat.max_seats);
    setGreetingPrefix(cat.greeting_prefix ?? "");
    setAllowedSubEventIds(cat.allowed_sub_event_ids ?? []);
    setError(null);
  };

  const handleEtiquetteChange = (next: EtiquetteType) => {
    setEtiquetteType(next);
    if (next === "solo") {
      setMaxSeats(1);
      if (greetingPrefix === "With Family (Saparivar)") {
        setGreetingPrefix("Warmly Inviting You");
      }
    } else if (next === "couple") {
      setMaxSeats(2);
      if (greetingPrefix === "With Family (Saparivar)") {
        setGreetingPrefix("Cordially Inviting You Both");
      }
    } else {
      setMaxSeats((prev) => (prev < 3 ? 4 : prev));
      if (!greetingPrefix || greetingPrefix === "Warmly Inviting You") {
        setGreetingPrefix("With Family (Saparivar)");
      }
    }
  };

  const toggleSubEvent = (id: string) => {
    setAllowedSubEventIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const res = await upsertCategoryAction({
        id: editingId ?? undefined,
        event_id: eventId,
        name,
        side_tag: sideTag,
        etiquette_type: etiquetteType,
        max_seats:
          etiquetteType === "solo"
            ? 1
            : etiquetteType === "couple"
              ? 2
              : maxSeats,
        allowed_sub_event_ids: allowedSubEventIds,
        greeting_prefix: greetingPrefix,
      });

      if (!res.ok) {
        setError(res.error || "Could not save category link.");
        return;
      }

      resetForm();
      router.refresh();
    } catch {
      setError("Network error while saving category.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    setDeletingId(categoryId);
    setError(null);
    try {
      const res = await deleteCategoryAction(eventId, categoryId);
      if (!res.ok) {
        setError(res.error || "Could not delete category.");
      } else {
        if (editingId === categoryId) resetForm();
        router.refresh();
      }
    } finally {
      setDeletingId(null);
    }
  };

  const buildShareUrl = (code: string) => {
    const base = origin || "";
    return `${base}/${eventSlug}/${code}`;
  };

  const buildWhatsAppShareUrl = (cat: InviteCategoryRecord) => {
    const shareUrl = buildShareUrl(cat.code);
    const greetingLine = cat.greeting_prefix
      ? `${cat.greeting_prefix} — `
      : "";
    const message = `Namaste! ${greetingLine}You are warmly invited to ${hostNames}'s ${eventTitle}.\n\nTap below to open your personal interactive invitation and RSVP:\n${shareUrl}`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  };

  const handleCopy = async (cat: InviteCategoryRecord) => {
    const fullUrl = buildShareUrl(cat.code);
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedId(cat.id);
      window.setTimeout(() => setCopiedId(null), 2200);
    } catch {
      // Fallback copy unavailable
    }
  };

  const subEventMap = new Map(subEvents.map((s) => [s.id, s]));

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* Create / Edit Category Form */}
      <section className="rounded-2xl border border-[#C88A2E]/30 bg-[#FFFDF8] p-5 sm:p-6 lg:col-span-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-serif text-2xl font-semibold text-[#4A101C]">
            {editingId ? "Edit Category Link" : "Create Smart Category Link"}
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

        <p className="mt-1 text-xs leading-relaxed text-[#7A6258]">
          Each circle gets an unguessable 8-character secret code and sees ONLY
          the ceremonies checked below.
        </p>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#8E1E31]/30 bg-[#8E1E31]/8 p-3 text-xs text-[#6B1222]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="cat-name"
              className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]"
            >
              Guest Circle Name *
            </label>
            <input
              id="cat-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Close Family, Friends, Office Colleagues"
              className="w-full rounded-xl border border-[#C88A2E]/35 bg-white px-3.5 py-2.5 text-sm text-[#241815] focus:border-[#5B1422] focus:outline-none"
            />
          </div>

          {/* Side Tag */}
          <div>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]">
              Side Tag
            </span>
            <div className="grid grid-cols-3 gap-2">
              {SIDE_TAGS.map((tag) => (
                <button
                  key={tag.value}
                  type="button"
                  onClick={() => setSideTag(tag.value)}
                  className={`cursor-pointer rounded-xl border px-2.5 py-2 text-xs font-semibold transition-colors ${
                    sideTag === tag.value
                      ? "border-[#5B1422] bg-[#5B1422] text-[#FCF8F1]"
                      : "border-[#C88A2E]/30 bg-white text-[#5B1422] hover:bg-[#FCF5E8]"
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Etiquette & Seat Cap */}
          <div>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]">
              Invitation Etiquette &amp; Seat Cap
            </span>
            <div className="space-y-2">
              {ETIQUETTE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleEtiquetteChange(opt.value)}
                  className={`block w-full cursor-pointer rounded-xl border p-3 text-left transition-all ${
                    etiquetteType === opt.value
                      ? "border-[#5B1422] bg-[#FCF5E8] ring-1 ring-[#5B1422]"
                      : "border-[#C88A2E]/30 bg-white hover:bg-[#FCF8F1]"
                  }`}
                >
                  <p className="text-xs font-semibold text-[#4A101C]">
                    {opt.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#69564E]">
                    {opt.description}
                  </p>
                </button>
              ))}
            </div>

            {etiquetteType === "family" && (
              <div className="mt-3">
                <label
                  htmlFor="cat-max-seats"
                  className="mb-1 block text-xs font-semibold text-[#5B1422]"
                >
                  Maximum Seats per Family
                </label>
                <input
                  id="cat-max-seats"
                  type="number"
                  min={1}
                  max={30}
                  value={maxSeats}
                  onChange={(e) => setMaxSeats(Number(e.target.value))}
                  className="w-28 rounded-xl border border-[#C88A2E]/35 bg-white px-3 py-2 text-sm font-semibold text-[#241815] focus:border-[#5B1422] focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Greeting Prefix */}
          <div>
            <label
              htmlFor="cat-greeting"
              className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]"
            >
              Greeting Label (Optional)
            </label>
            <input
              id="cat-greeting"
              type="text"
              value={greetingPrefix}
              onChange={(e) => setGreetingPrefix(e.target.value)}
              placeholder="e.g., With Family (Saparivar)"
              className="w-full rounded-xl border border-[#C88A2E]/35 bg-white px-3.5 py-2.5 text-sm text-[#241815] focus:border-[#5B1422] focus:outline-none"
            />
          </div>

          {/* Allowed Sub-Events Checkboxes */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]">
                Allowed Sub-Events
              </span>
              {subEvents.length > 0 && (
                <div className="flex gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() =>
                      setAllowedSubEventIds(subEvents.map((s) => s.id))
                    }
                    className="cursor-pointer font-medium text-[#5B1422] hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-[#C88A2E]">·</span>
                  <button
                    type="button"
                    onClick={() => setAllowedSubEventIds([])}
                    className="cursor-pointer font-medium text-[#7A6258] hover:underline"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {subEvents.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[#C88A2E]/35 bg-[#FCF8F1] p-3 text-xs text-[#7A6258]">
                Add ceremonies in Tab 2 first to toggle which functions appear on
                this link.
              </p>
            ) : (
              <div className="space-y-2 rounded-xl border border-[#C88A2E]/25 bg-[#FCF8F1] p-3">
                {subEvents.map((se) => {
                  const checked = allowedSubEventIds.includes(se.id);
                  return (
                    <label
                      key={se.id}
                      className="flex cursor-pointer items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-xs shadow-2xs"
                    >
                      <span className="flex items-center gap-2.5 font-medium text-[#4A101C]">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSubEvent(se.id)}
                          className="h-4 w-4 accent-[#5B1422]"
                        />
                        {se.name}
                      </span>
                      <span className="text-[11px] text-[#7A6258]">
                        {checked ? "Visible" : "Hidden"}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
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
                ? "Update Category Link"
                : "Generate Secret Invite Link"}
          </button>
        </form>
      </section>

      {/* Active Category Links */}
      <section className="space-y-4 lg:col-span-7">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#4A101C]">
            Active Guest-Circle Links ({categories.length})
          </h2>
          <p className="text-xs text-[#7A6258]">
            Share each private URL directly on WhatsApp with that exact guest group.
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#C88A2E]/40 bg-[#FFFDF8] p-10 text-center">
            <Link2 className="mx-auto h-8 w-8 text-[#C88A2E]" />
            <p className="mt-3 font-serif text-xl font-semibold text-[#4A101C]">
              Create Your First Smart Link
            </p>
            <p className="mt-1.5 text-sm text-[#69564E]">
              For example, create &ldquo;Close Family&rdquo; (all ceremonies, up
              to 5 seats) and &ldquo;Office Colleagues&rdquo; (Reception only,
              Solo 1 seat).
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((cat) => {
              const visibleEvents = (cat.allowed_sub_event_ids ?? [])
                .map((id) => subEventMap.get(id))
                .filter(Boolean) as SubEventRecord[];
              const hiddenCount = Math.max(
                0,
                subEvents.length - visibleEvents.length
              );
              const shareUrl = buildShareUrl(cat.code);

              return (
                <div
                  key={cat.id}
                  className="rounded-2xl border border-[#C88A2E]/30 bg-[#FFFDF8] p-5 shadow-xs"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-serif text-2xl font-semibold text-[#4A101C]">
                          {cat.name}
                        </h3>
                        <span className="rounded-full bg-[#FCF5E8] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8E5B17]">
                          {getSideTagLabel(cat.side_tag)}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#5B1422]/20 bg-white px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5B1422]">
                          <Users className="h-3 w-3" />
                          {cat.etiquette_type === "solo"
                            ? "Solo · 1 Seat"
                            : cat.etiquette_type === "couple"
                              ? "Couple · Max 2"
                              : `Family · Max ${cat.max_seats}`}
                        </span>
                      </div>

                      {cat.greeting_prefix && (
                        <p className="mt-1 text-xs italic text-[#7A6258]">
                          Greeting: &ldquo;{cat.greeting_prefix}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(cat)}
                        aria-label={`Edit ${cat.name}`}
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[#C88A2E]/30 bg-white text-[#5B1422] hover:bg-[#FCF5E8]"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === cat.id}
                        onClick={() => handleDelete(cat.id)}
                        aria-label={`Delete ${cat.name}`}
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[#8E1E31]/25 bg-white text-[#8E1E31] hover:bg-[#8E1E31]/8 disabled:opacity-40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Visible & Hidden Ceremony Badges */}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {visibleEvents.map((se) => (
                      <span
                        key={se.id}
                        className="rounded-md bg-[#1F6E4A]/10 px-2.5 py-1 text-[11px] font-medium text-[#175438]"
                      >
                        {se.name}
                      </span>
                    ))}
                    {hiddenCount > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#241815]/6 px-2.5 py-1 text-[11px] font-medium text-[#7A6258]">
                        <EyeOff className="h-3 w-3" />
                        {hiddenCount} private{" "}
                        {hiddenCount === 1 ? "event" : "events"} hidden
                      </span>
                    )}
                    {subEvents.length > 0 && visibleEvents.length === 0 && (
                      <span className="text-xs text-[#8E1E31]">
                        No ceremonies selected yet
                      </span>
                    )}
                  </div>

                  {/* Copyable Secret Link, Share on WhatsApp & Open Preview */}
                  <div className="mt-4 space-y-2.5 rounded-xl border border-[#C88A2E]/25 bg-[#FCF8F1] p-3">
                    <code className="block truncate font-mono text-xs text-[#4A101C]">
                      {shareUrl}
                    </code>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(cat)}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#5B1422] px-3 py-1.5 text-xs font-semibold text-[#FCF8F1] transition-colors hover:bg-[#460E19]"
                      >
                        {copiedId === cat.id ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-[#E7C06B]" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            Copy Link
                          </>
                        )}
                      </button>

                      <a
                        href={buildWhatsAppShareUrl(cat)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#1F6E4A] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#175438]"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        Share on WhatsApp
                      </a>

                      <a
                        href={`/${eventSlug}/${cat.code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#5B1422]/25 bg-white px-3 py-1.5 text-xs font-semibold text-[#5B1422] transition-colors hover:bg-[#FCF5E8]"
                      >
                        Open Preview
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
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
