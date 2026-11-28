"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  Filter,
  MessageCircle,
  Search,
  Trash2,
  UserPlus,
  Users,
  Utensils,
} from "lucide-react";
import { toast } from "sonner";
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

  const attendingCount = filteredRsvps.filter(
    (r) => r.overall_attending
  ).length;
  const declinedCount = filteredRsvps.length - attendingCount;

  const handleDeleteRsvp = async (rsvpId: string) => {
    setDeletingId(rsvpId);
    try {
      const res = await deleteRsvpAction(eventId, rsvpId);
      if (!res.ok) {
        toast.error(res.error || "Failed to delete RSVP.");
      } else {
        setConfirmDeleteId(null);
        toast.success("Guest RSVP removed.");
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
    toast.success("Caterer Excel / CSV exported.");
  };

  const buildGuestWhatsAppUrl = (rsvp: RsvpRecord) => {
    const digits = rsvp.phone_number.replace(/\D/g, "");
    const message = `Namaste ${rsvp.guest_name}! Thank you for your response to ${hostNames}'s celebration.`;
    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="space-y-6">
      {/* Action Bar: Manual Guest Entry + Caterer Excel/CSV Export */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-editorial text-2xl font-semibold text-[#470F1B] sm:text-3xl">
            Guest List &amp; Caterer Headcounts
          </h2>
          <p className="text-xs text-[#796258]">
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
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-xl bg-[#54121F] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#FBF7F0] shadow-xs transition-colors hover:bg-[#3D0B16]"
          >
            <UserPlus className="h-4 w-4" />
            Add Guest Manually
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredRsvps.length === 0}
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-xl border border-[#B88433]/40 bg-[#FFFDF9] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#54121F] shadow-2xs transition-colors hover:bg-[#FBF3E5] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Download className="h-4 w-4 text-[#B88433]" />
            Export Excel / CSV
          </button>
        </div>
      </div>

      {/* Top Overview Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="gold-shimmer-border rounded-2xl bg-[#FFFDF9] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#796258]">
            Responses Shown
          </p>
          <p className="mt-1 font-editorial text-3xl font-semibold text-[#470F1B]">
            {filteredRsvps.length}
          </p>
        </div>

        <div className="rounded-2xl border border-[#1B6343]/25 bg-[#FFFDF9] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#154F35]">
            Attending Parties
          </p>
          <p className="mt-1 font-editorial text-3xl font-semibold text-[#1B6343]">
            {attendingCount}
          </p>
        </div>

        <div className="gold-shimmer-border rounded-2xl bg-[#FFFDF9] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#796258]">
            Unable to Attend
          </p>
          <p className="mt-1 font-editorial text-3xl font-semibold text-[#6C5950]">
            {declinedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-[#B88433]/32 bg-[#FBF3E5] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8E5B17]">
            {plan === "free" ? "Free Preview Quota" : "Total Unique RSVPs"}
          </p>
          <p className="mt-1 font-editorial text-3xl font-semibold text-[#470F1B]">
            {plan === "free"
              ? `${rsvps.length} / ${FREE_PLAN_RSVP_LIMIT}`
              : rsvps.length}
          </p>
        </div>
      </div>

      {/* Confirmed Headcount Per Sub-Event Cards */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-editorial text-2xl font-semibold text-[#470F1B]">
            Confirmed Headcount by Ceremony
          </h3>
          {(categoryFilter !== "all" || sideFilter !== "all" || searchQuery) && (
            <span className="text-xs font-semibold text-[#B88433]">
              Filtered view active
            </span>
          )}
        </div>

        {subEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#B88433]/35 bg-[#FFFDF9] p-6 text-center text-sm text-[#6C5950]">
            Add ceremonies in Schedule to track per-function headcounts here.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {subEventStats.map(
              ({ subEvent, confirmedGuests, attendingParties }) => (
                <div
                  key={subEvent.id}
                  className="gold-shimmer-border rounded-2xl bg-[#FFFDF9] p-4 sm:p-5"
                >
                  <p className="truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B88433]">
                    {subEvent.name}
                  </p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-editorial text-4xl font-semibold text-[#470F1B]">
                      {confirmedGuests}
                    </span>
                    <span className="text-xs text-[#796258]">
                      {confirmedGuests === 1 ? "guest" : "guests"}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#796258]">
                    {attendingParties}{" "}
                    {attendingParties === 1 ? "party" : "parties"} confirmed
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </section>

      {/* Filter Bar */}
      <section className="gold-shimmer-border flex flex-col gap-3 rounded-2xl bg-[#FFFDF9] p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#54121F]">
            <Filter className="h-3.5 w-3.5 text-[#B88433]" />
            Filters
          </span>

          <select
            aria-label="Filter RSVPs by Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="min-h-[42px] cursor-pointer rounded-xl border border-[#B88433]/32 bg-white px-3 py-2 text-xs font-semibold text-[#470F1B] focus:border-[#54121F] focus:outline-none"
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
            className="min-h-[42px] cursor-pointer rounded-xl border border-[#B88433]/32 bg-white px-3 py-2 text-xs font-semibold text-[#470F1B] focus:border-[#54121F] focus:outline-none"
          >
            <option value="all">All Sides</option>
            {SIDE_TAGS.map((tag) => (
              <option key={tag.value} value={tag.value}>
                {tag.label}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9C897E]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name or phone..."
            className="min-h-[42px] w-full rounded-xl border border-[#B88433]/32 bg-white py-2 pl-9 pr-3 text-xs text-[#221714] placeholder:text-[#9C897E] focus:border-[#54121F] focus:outline-none"
          />
        </div>
      </section>

      {/* Empty State OR Responsive Guest List (Cards on Mobile < md, Table on Desktop md+) */}
      {filteredRsvps.length === 0 ? (
        <section className="gold-shimmer-border rounded-2xl bg-[#FFFDF9] p-12 text-center">
          <Users className="mx-auto h-8 w-8 text-[#B88433]" />
          <p className="mt-3 font-editorial text-2xl font-semibold text-[#470F1B]">
            {rsvps.length === 0
              ? "No RSVPs Recorded Yet"
              : "No Guests Match Your Filters"}
          </p>
          <p className="mt-1.5 text-sm text-[#6C5950]">
            {rsvps.length === 0
              ? "Share your Smart Category Links or tap 'Add Guest Manually' to log elders who confirmed by phone."
              : "Try clearing your Category, Side Tag, or search filter."}
          </p>
        </section>
      ) : (
        <>
          {/* MOBILE GUEST CARDS (< md): Zero Sideways Scrolling */}
          <div className="space-y-3 md:hidden">
            {filteredRsvps.map((rsvp) => {
              const cat = rsvp.category_id
                ? categoryMap.get(rsvp.category_id)
                : null;
              const subMap = new Map(
                (rsvp.rsvp_sub_events ?? []).map((se) => [se.sub_event_id, se])
              );
              const hasRealPhone = !isManualPlaceholderPhone(rsvp.phone_number);

              return (
                <article
                  key={rsvp.id}
                  className="gold-shimmer-border rounded-2xl bg-[#FFFDF9] p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h4 className="font-editorial text-xl font-semibold text-[#470F1B]">
                          {rsvp.guest_name}
                        </h4>
                        {rsvp.is_manual && (
                          <span className="rounded-full border border-[#B88433]/38 bg-[#FBF3E5] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8E5B17]">
                            Manual
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-[#796258]">
                        {cat ? cat.name : "Uncategorized"} ·{" "}
                        {getSideTagLabel(cat?.side_tag ?? "common")}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                        rsvp.overall_attending
                          ? "bg-[#1B6343]/12 text-[#154F35]"
                          : "bg-[#8E1E31]/10 text-[#7A1829]"
                      }`}
                    >
                      {rsvp.overall_attending ? "Attending" : "Declined"}
                    </span>
                  </div>

                  {/* Per-Event Headcounts Grid */}
                  {subEvents.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-[#B88433]/18 pt-3">
                      {subEvents.map((se) => {
                        const row = subMap.get(se.id);
                        const attendingThis =
                          rsvp.overall_attending && row?.attending;
                        return (
                          <span
                            key={se.id}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                              attendingThis
                                ? "bg-[#1B6343]/12 text-[#154F35]"
                                : "bg-[#221714]/5 text-[#9C897E]"
                            }`}
                          >
                            {se.name}: {attendingThis ? row.guest_count : "—"}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Meal Preference & Note */}
                  {(rsvp.meal_preference || rsvp.note) && (
                    <div className="mt-3 space-y-1 text-xs">
                      {rsvp.meal_preference && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#FBF3E5] px-2 py-0.5 font-medium text-[#54121F]">
                          <Utensils className="h-3 w-3 text-[#B88433]" />
                          {rsvp.meal_preference}
                        </span>
                      )}
                      {rsvp.note && (
                        <p className="text-[#6C5950]">&ldquo;{rsvp.note}&rdquo;</p>
                      )}
                    </div>
                  )}

                  {/* Phone, 1-Tap WhatsApp & Delete Bar */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#B88433]/18 pt-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[#796258]">
                        {hasRealPhone ? rsvp.phone_number : "No phone"}
                      </span>
                      {hasRealPhone && (
                        <a
                          href={buildGuestWhatsAppUrl(rsvp)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full bg-[#1B6343]/12 px-3 py-1 text-xs font-semibold text-[#154F35]"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          WhatsApp
                        </a>
                      )}
                    </div>

                    {confirmDeleteId === rsvp.id ? (
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={deletingId === rsvp.id}
                          onClick={() => handleDeleteRsvp(rsvp.id)}
                          className="min-h-[38px] cursor-pointer rounded-lg bg-[#8E1E31] px-3 py-1 text-xs font-semibold text-white"
                        >
                          {deletingId === rsvp.id ? "..." : "Confirm"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="min-h-[38px] cursor-pointer rounded-lg border border-[#B88433]/30 bg-white px-2.5 py-1 text-xs text-[#6C5950]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(rsvp.id)}
                        className="inline-flex min-h-[38px] cursor-pointer items-center gap-1 rounded-lg border border-[#8E1E31]/25 bg-white px-3 py-1 text-xs font-semibold text-[#8E1E31]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {/* DESKTOP DATA TABLE (md+) */}
          <section className="gold-shimmer-border hidden overflow-hidden rounded-2xl bg-[#FFFDF9] md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#B88433]/22 bg-[#FBF7F0] text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6C5950]">
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
                <tbody className="divide-y divide-[#B88433]/14">
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
                        className="transition-colors hover:bg-[#FBF7F0]/65"
                      >
                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="font-semibold text-[#470F1B]">
                              {rsvp.guest_name}
                            </p>
                            {rsvp.is_manual && (
                              <span className="rounded-full border border-[#B88433]/38 bg-[#FBF3E5] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8E5B17]">
                                Manual
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="font-mono text-xs text-[#796258]">
                              {hasRealPhone ? rsvp.phone_number : "No phone"}
                            </span>
                            {hasRealPhone && (
                              <a
                                href={buildGuestWhatsAppUrl(rsvp)}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`Message ${rsvp.guest_name} on WhatsApp`}
                                aria-label={`Message ${rsvp.guest_name} on WhatsApp`}
                                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#1B6343]/12 text-[#1B6343] transition-colors hover:bg-[#1B6343] hover:text-white"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-4 align-top">
                          <p className="text-xs font-semibold text-[#470F1B]">
                            {cat ? cat.name : "Uncategorized"}
                          </p>
                          <span className="mt-1 inline-block rounded-full bg-[#FBF3E5] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8E5B17]">
                            {getSideTagLabel(cat?.side_tag ?? "common")}
                          </span>
                        </td>

                        <td className="px-4 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              rsvp.overall_attending
                                ? "bg-[#1B6343]/12 text-[#154F35]"
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
                                <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-[#1B6343]/12 px-2 text-xs font-bold text-[#154F35]">
                                  {row.guest_count}
                                </span>
                              ) : (
                                <span className="text-xs text-[#B6A59B]">
                                  —
                                </span>
                              )}
                            </td>
                          );
                        })}

                        <td className="max-w-[220px] px-4 py-4 align-top text-xs">
                          {rsvp.meal_preference && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-[#FBF3E5] px-2 py-0.5 font-medium text-[#54121F]">
                              <Utensils className="h-3 w-3 text-[#B88433]" />
                              {rsvp.meal_preference}
                            </span>
                          )}
                          {rsvp.note && (
                            <p className="mt-1 line-clamp-2 text-[#6C5950]">
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
                                className="cursor-pointer rounded-lg bg-[#8E1E31] px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-[#6B1222]"
                              >
                                {deletingId === rsvp.id ? "..." : "Delete"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="cursor-pointer rounded-lg border border-[#B88433]/30 bg-white px-2 py-1.5 text-[11px] text-[#6C5950]"
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
          </section>
        </>
      )}

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
