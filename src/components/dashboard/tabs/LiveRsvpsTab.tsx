"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Download,
  Filter,
  MessageCircle,
  Search,
  Trash2,
  UserPlus,
  Users,
  Utensils,
} from "lucide-react";
import { deleteRsvpAction } from "@/app/dashboard/actions";
import { ManualGuestModal } from "@/components/dashboard/tabs/ManualGuestModal";
import {
  FREE_PLAN_RSVP_LIMIT,
  getSideTagLabel,
  SIDE_TAGS,
} from "@/lib/constants";
import { buildCatererCsv, isManualPlaceholderPhone } from "@/lib/csv-export";
import type {
  InviteCategoryRecord,
  PlanTier,
  RsvpRecord,
  SideTag,
  SubEventRecord,
} from "@/types/database";

interface LiveRsvpsTabProps {
  eventId: string;
  eventSlug: string;
  hostNames: string;
  plan: PlanTier;
  subEvents: SubEventRecord[];
  categories: InviteCategoryRecord[];
  rsvps: RsvpRecord[];
}

export function LiveRsvpsTab({
  eventId,
  eventSlug,
  hostNames,
  plan,
  subEvents,
  categories,
  rsvps,
}: LiveRsvpsTabProps) {
  const router = useRouter();

  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sideFilter, setSideFilter] = useState<SideTag | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [manualOpen, setManualOpen] = useState(false);
  const [manualModalKey, setManualModalKey] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  const filteredRsvps = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rsvps.filter((rsvp) => {
      const cat = rsvp.category_id ? categoryMap.get(rsvp.category_id) : null;

      if (categoryFilter === "uncategorized") {
        if (rsvp.category_id) return false;
      } else if (categoryFilter !== "all") {
        if (rsvp.category_id !== categoryFilter) return false;
      }

      if (sideFilter !== "all") {
        const effectiveSide = cat?.side_tag ?? "common";
        if (effectiveSide !== sideFilter) return false;
      }

      if (q) {
        const matchName = rsvp.guest_name.toLowerCase().includes(q);
        const matchPhone =
          !isManualPlaceholderPhone(rsvp.phone_number) &&
          rsvp.phone_number.toLowerCase().includes(q);
        if (!matchName && !matchPhone) return false;
      }

      return true;
    });
  }, [rsvps, categoryFilter, sideFilter, searchQuery, categoryMap]);

  // Exact confirmed headcount per sub-event (includes both Online and Manual RSVPs)
  const subEventStats = useMemo(() => {
    return subEvents.map((se) => {
      let confirmedGuests = 0;
      let attendingParties = 0;

      for (const rsvp of filteredRsvps) {
        if (!rsvp.overall_attending) continue;
        const entry = rsvp.rsvp_sub_events?.find(
          (item) => item.sub_event_id === se.id
        );
        if (entry?.attending) {
          confirmedGuests += entry.guest_count;
          attendingParties += 1;
        }
      }

      return {
        subEvent: se,
        confirmedGuests,
        attendingParties,
      };
    });
  }, [subEvents, filteredRsvps]);

  const attendingCount = filteredRsvps.filter((r) => r.overall_attending).length;
  const declinedCount = filteredRsvps.length - attendingCount;

  const handleDeleteRsvp = async (rsvpId: string) => {
    setDeletingId(rsvpId);
    setError(null);
    try {
      const res = await deleteRsvpAction(eventId, rsvpId);
      if (!res.ok) {
        setError(res.error || "Failed to delete RSVP.");
      } else {
        setConfirmDeleteId(null);
        router.refresh();
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportCsv = () => {
    const csvContent = buildCatererCsv({
      rsvps: filteredRsvps,
      subEvents,
      categories,
    });
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${eventSlug || "saffronpass"}-caterer-rsvps.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const buildGuestWhatsAppUrl = (rsvp: RsvpRecord) => {
    const digits = rsvp.phone_number.replace(/\D/g, "");
    const message = `Namaste ${rsvp.guest_name}! Thank you for your response to ${hostNames}'s celebration.`;
    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-[#8E1E31]/30 bg-[#8E1E31]/8 p-3.5 text-sm text-[#6B1222]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Action Bar: Manual Guest Entry + Caterer Excel/CSV Export */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#4A101C]">
            Guest List &amp; Caterer Headcounts
          </h2>
          <p className="text-xs text-[#7A6258]">
            Online responses and manual phone confirmations combine live below.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setManualModalKey((k) => k + 1);
              setManualOpen(true);
            }}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#5B1422] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#FCF8F1] shadow-sm transition-colors hover:bg-[#460E19]"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Add Guest Manually
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredRsvps.length === 0}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#C88A2E]/45 bg-[#FFFDF8] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422] shadow-2xs transition-colors hover:bg-[#FCF5E8] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Download className="h-3.5 w-3.5 text-[#C88A2E]" />
            Export Excel / CSV
          </button>
        </div>
      </div>

      {/* Top Overview Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-[#C88A2E]/30 bg-[#FFFDF8] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7A6258]">
            Responses Shown
          </p>
          <p className="mt-1 font-serif text-3xl font-semibold text-[#4A101C]">
            {filteredRsvps.length}
          </p>
        </div>

        <div className="rounded-2xl border border-[#1F6E4A]/25 bg-[#FFFDF8] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#175438]">
            Attending Parties
          </p>
          <p className="mt-1 font-serif text-3xl font-semibold text-[#1F6E4A]">
            {attendingCount}
          </p>
        </div>

        <div className="rounded-2xl border border-[#C88A2E]/30 bg-[#FFFDF8] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7A6258]">
            Unable to Attend
          </p>
          <p className="mt-1 font-serif text-3xl font-semibold text-[#69564E]">
            {declinedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-[#C88A2E]/30 bg-[#FCF5E8] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8E5B17]">
            {plan === "free" ? "Free Preview Quota" : "Total Unique RSVPs"}
          </p>
          <p className="mt-1 font-serif text-3xl font-semibold text-[#4A101C]">
            {plan === "free"
              ? `${rsvps.length} / ${FREE_PLAN_RSVP_LIMIT}`
              : rsvps.length}
          </p>
        </div>
      </div>

      {/* Exact Confirmed Headcount Per Sub-Event Cards */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-serif text-2xl font-semibold text-[#4A101C]">
            Confirmed Headcount by Ceremony
          </h3>
          {(categoryFilter !== "all" || sideFilter !== "all" || searchQuery) && (
            <span className="text-xs font-medium text-[#C88A2E]">
              Filtered view active
            </span>
          )}
        </div>

        {subEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#C88A2E]/35 bg-[#FFFDF8] p-6 text-center text-sm text-[#69564E]">
            Add ceremonies in Tab 2 to track per-function headcounts here.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {subEventStats.map(
              ({ subEvent, confirmedGuests, attendingParties }) => (
                <div
                  key={subEvent.id}
                  className="rounded-2xl border border-[#C88A2E]/35 bg-[#FFFDF8] p-5 shadow-xs"
                >
                  <p className="truncate text-xs font-semibold uppercase tracking-[0.16em] text-[#C88A2E]">
                    {subEvent.name}
                  </p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-serif text-4xl font-semibold text-[#4A101C]">
                      {confirmedGuests}
                    </span>
                    <span className="text-xs text-[#7A6258]">
                      {confirmedGuests === 1 ? "guest" : "guests"}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#7A6258]">
                    Across {attendingParties}{" "}
                    {attendingParties === 1
                      ? "confirmed party"
                      : "confirmed parties"}
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </section>

      {/* Filter Bar */}
      <section className="flex flex-col gap-3 rounded-2xl border border-[#C88A2E]/30 bg-[#FFFDF8] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]">
            <Filter className="h-3.5 w-3.5 text-[#C88A2E]" />
            Filters
          </span>

          <select
            aria-label="Filter RSVPs by Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="cursor-pointer rounded-xl border border-[#C88A2E]/35 bg-white px-3 py-2 text-xs font-semibold text-[#4A101C] focus:border-[#5B1422] focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
            <option value="uncategorized">Uncategorized</option>
          </select>

          <select
            aria-label="Filter RSVPs by Side Tag"
            value={sideFilter}
            onChange={(e) => setSideFilter(e.target.value as SideTag | "all")}
            className="cursor-pointer rounded-xl border border-[#C88A2E]/35 bg-white px-3 py-2 text-xs font-semibold text-[#4A101C] focus:border-[#5B1422] focus:outline-none"
          >
            <option value="all">All Sides</option>
            {SIDE_TAGS.map((tag) => (
              <option key={tag.value} value={tag.value}>
                {tag.label}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9A8579]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name or phone..."
            className="w-full rounded-xl border border-[#C88A2E]/35 bg-white py-2 pl-9 pr-3 text-xs text-[#241815] placeholder:text-[#9A8579] focus:border-[#5B1422] focus:outline-none"
          />
        </div>
      </section>

      {/* Guest RSVP Table */}
      <section className="overflow-hidden rounded-2xl border border-[#C88A2E]/30 bg-[#FFFDF8]">
        {filteredRsvps.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto h-8 w-8 text-[#C88A2E]" />
            <p className="mt-3 font-serif text-2xl font-semibold text-[#4A101C]">
              {rsvps.length === 0
                ? "No RSVPs Recorded Yet"
                : "No Guests Match Your Filters"}
            </p>
            <p className="mt-1.5 text-sm text-[#69564E]">
              {rsvps.length === 0
                ? "Share your Smart Category Links from Tab 3, or click 'Add Guest Manually' to log elders who confirmed by phone."
                : "Try resetting the Category, Side Tag, or search filter above."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#C88A2E]/25 bg-[#FCF8F1] text-[11px] font-semibold uppercase tracking-[0.14em] text-[#69564E]">
                  <th className="px-4 py-3.5">Guest</th>
                  <th className="px-4 py-3.5">Circle &amp; Side</th>
                  <th className="px-4 py-3.5">Status</th>
                  {subEvents.map((se) => (
                    <th key={se.id} className="px-3 py-3.5 text-center">
                      {se.name}
                    </th>
                  ))}
                  <th className="px-4 py-3.5">Meal &amp; Note</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C88A2E]/15">
                {filteredRsvps.map((rsvp) => {
                  const cat = rsvp.category_id
                    ? categoryMap.get(rsvp.category_id)
                    : null;
                  const subMap = new Map(
                    (rsvp.rsvp_sub_events ?? []).map((se) => [
                      se.sub_event_id,
                      se,
                    ])
                  );
                  const hasRealPhone = !isManualPlaceholderPhone(
                    rsvp.phone_number
                  );

                  return (
                    <tr
                      key={rsvp.id}
                      className="transition-colors hover:bg-[#FCF8F1]/60"
                    >
                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="font-semibold text-[#4A101C]">
                            {rsvp.guest_name}
                          </p>
                          {rsvp.is_manual && (
                            <span className="rounded-full border border-[#C88A2E]/40 bg-[#FCF5E8] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8E5B17]">
                              Manual
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <span className="font-mono text-xs text-[#7A6258]">
                            {hasRealPhone ? rsvp.phone_number : "No phone"}
                          </span>
                          {hasRealPhone && (
                            <a
                              href={buildGuestWhatsAppUrl(rsvp)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`Message ${rsvp.guest_name} on WhatsApp`}
                              aria-label={`Message ${rsvp.guest_name} on WhatsApp`}
                              className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#1F6E4A]/12 text-[#1F6E4A] transition-colors hover:bg-[#1F6E4A] hover:text-white"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <p className="text-xs font-semibold text-[#4A101C]">
                          {cat ? cat.name : "Uncategorized"}
                        </p>
                        <span className="mt-1 inline-block rounded-full bg-[#FCF5E8] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8E5B17]">
                          {getSideTagLabel(cat?.side_tag ?? "common")}
                        </span>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            rsvp.overall_attending
                              ? "bg-[#1F6E4A]/12 text-[#175438]"
                              : "bg-[#8E1E31]/10 text-[#7A1829]"
                          }`}
                        >
                          {rsvp.overall_attending ? "Attending" : "Declined"}
                        </span>
                      </td>

                      {subEvents.map((se) => {
                        const row = subMap.get(se.id);
                        const attendingThis =
                          rsvp.overall_attending && row?.attending;
                        return (
                          <td
                            key={se.id}
                            className="px-3 py-4 text-center align-top"
                          >
                            {attendingThis ? (
                              <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-[#1F6E4A]/12 px-2 text-xs font-bold text-[#175438]">
                                {row.guest_count}
                              </span>
                            ) : (
                              <span className="text-xs text-[#B6A59B]">—</span>
                            )}
                          </td>
                        );
                      })}

                      <td className="max-w-[220px] px-4 py-4 align-top text-xs">
                        {rsvp.meal_preference && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-[#FCF5E8] px-2 py-0.5 font-medium text-[#5B1422]">
                            <Utensils className="h-3 w-3 text-[#C88A2E]" />
                            {rsvp.meal_preference}
                          </span>
                        )}
                        {rsvp.note && (
                          <p className="mt-1 line-clamp-2 text-[#69564E]">
                            &ldquo;{rsvp.note}&rdquo;
                          </p>
                        )}
                        {!rsvp.meal_preference && !rsvp.note && (
                          <span className="text-[#B6A59B]">—</span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-right align-top">
                        {confirmDeleteId === rsvp.id ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={deletingId === rsvp.id}
                              onClick={() => handleDeleteRsvp(rsvp.id)}
                              className="cursor-pointer rounded-lg bg-[#8E1E31] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#6B1222]"
                            >
                              {deletingId === rsvp.id ? "..." : "Delete"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="cursor-pointer rounded-lg border border-[#C88A2E]/30 bg-white px-2 py-1 text-[11px] text-[#69564E]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(rsvp.id)}
                            aria-label={`Delete RSVP for ${rsvp.guest_name}`}
                            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#8E1E31]/25 bg-white px-2.5 py-1.5 text-xs font-medium text-[#8E1E31] transition-colors hover:bg-[#8E1E31]/8"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ManualGuestModal
        key={manualModalKey}
        open={manualOpen}
        onClose={() => setManualOpen(false)}
        eventId={eventId}
        subEvents={subEvents}
        categories={categories}
      />
    </div>
  );
}
