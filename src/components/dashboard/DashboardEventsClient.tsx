"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Link2,
  Plus,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";
import { CreateEventModal } from "@/components/dashboard/CreateEventModal";
import {
  getEventTypeLabel,
  getSideTagLabel,
  normalizeThemeId,
  PLAN_LABELS,
} from "@/lib/constants";
import { formatShortDate } from "@/lib/utils";
import type { EventRecord, SideTag, ThemeId } from "@/types/database";

export interface DashboardEventSummary extends EventRecord {
  sub_events_count: number;
  categories_count: number;
  rsvps_count: number;
  is_cohost?: boolean;
  cohost_side_tag?: SideTag | null;
}

interface DashboardEventsClientProps {
  myEvents: DashboardEventSummary[];
  sharedEvents: DashboardEventSummary[];
  hostName: string;
}

export function DashboardEventsClient({
  myEvents,
  sharedEvents,
  hostName,
}: DashboardEventsClientProps) {
  const [createOpen, setCreateOpen] = useState(false);

  const hasNoEventsAtAll = myEvents.length === 0 && sharedEvents.length === 0;

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      {/* Page Header */}
      <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <p className="font-display text-[10px] font-semibold uppercase tracking-[0.26em] text-[#B88433]">
            Host Atelier &amp; Command Center
          </p>
          <h1 className="mt-1.5 font-editorial text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.08] text-[#3E0D17]">
            Namaste, {hostName}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#6C5950]">
            Design interactive heirloom invitations, manage private guest-circle
            links, and monitor live ceremony headcounts in real time.
          </p>
        </div>

        <button
          type="button"
          id="create-new-event-btn"
          onClick={() => setCreateOpen(true)}
          className="inline-flex min-h-[46px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#54121F] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FBF7F0] shadow-[0_10px_26px_rgba(84,18,31,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#3E0D17] sm:w-auto"
        >
          <Plus className="h-4 w-4 text-[#DFB262]" />
          Create New Event
        </button>
      </div>

      {hasNoEventsAtAll ? (
        <section className="texture-paper gold-shimmer-border mt-10 rounded-[28px] bg-[#FFFDF9] px-6 py-16 text-center sm:py-20">
          <div className="relative z-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#B88433]/35 bg-[#FCF5E8] text-[#B88433]">
              <Sparkles className="h-6 w-6" />
            </div>
            <p className="mt-5 font-display text-[10px] font-semibold uppercase tracking-[0.26em] text-[#B88433]">
              Ready When You Are
            </p>
            <h2 className="mt-2 font-editorial text-[clamp(1.75rem,3.5vw,2.5rem)] font-medium text-[#3E0D17]">
              Begin Your First Celebration
            </h2>
            <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-[#6C5950]">
              Craft an animated luxury invitation in under two minutes—curate
              your ceremonies, share private category links, and track every
              RSVP effortlessly.
            </p>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="mt-8 inline-flex min-h-[48px] cursor-pointer items-center gap-2 rounded-full bg-[#54121F] px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FBF7F0] shadow-[0_12px_28px_rgba(84,18,31,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#3E0D17]"
            >
              <Plus className="h-4 w-4 text-[#DFB262]" />
              Create Your First Event
            </button>
          </div>
        </section>
      ) : (
        <div className="mt-10 space-y-12">
          {/* Section 1: My Events */}
          <section>
            <div className="mb-5 flex items-center gap-3.5">
              <h2 className="font-editorial text-2xl font-semibold text-[#3E0D17] sm:text-[28px]">
                My Events{" "}
                <span className="font-sans text-sm font-medium text-[#9A7A58]">
                  ({myEvents.length})
                </span>
              </h2>
              <span className="h-px flex-1 bg-gradient-to-r from-[#B88433]/35 to-transparent" />
            </div>

            {myEvents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#B88433]/40 bg-[#FFFDF9] p-8 text-center">
                <p className="text-sm text-[#6C5950]">
                  You haven&apos;t created your own event yet—start one anytime
                  using the button above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {myEvents.map((event) => (
                  <EventSummaryCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </section>

          {/* Section 2: Shared With Me (Co-Host) */}
          {sharedEvents.length > 0 && (
            <section>
              <div className="mb-5 flex items-center gap-3.5">
                <h2 className="inline-flex items-center gap-2 font-editorial text-2xl font-semibold text-[#3E0D17] sm:text-[28px]">
                  <UserCheck className="h-5 w-5 text-[#B88433]" />
                  <span>
                    Shared With Me{" "}
                    <span className="font-sans text-sm font-medium text-[#9A7A58]">
                      (Co-Host · {sharedEvents.length})
                    </span>
                  </span>
                </h2>
                <span className="h-px flex-1 bg-gradient-to-r from-[#B88433]/35 to-transparent" />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {sharedEvents.map((event) => (
                  <EventSummaryCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <CreateEventModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </main>
  );
}

const THEME_SWATCH_DOT: Record<ThemeId, string> = {
  royal_saffron: "#54121F",
  minimal_ivory: "#B88433",
  pastel_udaipur: "#C68B78",
  south_indian_silk: "#0E4A38",
  dark_sangeet_glam: "#2A1530",
};

function EventSummaryCard({ event }: { event: DashboardEventSummary }) {
  const dotColor = THEME_SWATCH_DOT[normalizeThemeId(event.theme_id)] || "#54121F";

  return (
    <Link
      href={`/dashboard/events/${event.id}`}
      className="texture-paper gold-shimmer-border group flex flex-col justify-between overflow-hidden rounded-[22px] bg-[#FFFDF9] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#B88433]/65 hover:shadow-[0_18px_42px_rgba(48,12,20,0.1)]"
    >
      <div className="relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#B88433]/25 bg-[#FCF5E8] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8E5B17]">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: dotColor }}
              aria-hidden="true"
            />
            {getEventTypeLabel(event.event_type)}
          </span>

          <div className="flex flex-wrap items-center gap-1.5">
            {event.is_cohost && (
              <span className="rounded-full bg-[#1B6343]/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#145236]">
                Co-Host
                {event.cohost_side_tag
                  ? ` · ${getSideTagLabel(event.cohost_side_tag)}`
                  : ""}
              </span>
            )}
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                event.plan === "free"
                  ? "bg-[#54121F]/8 text-[#54121F]"
                  : "bg-[#1B6343]/12 text-[#145236]"
              }`}
            >
              {PLAN_LABELS[event.plan]}
            </span>
          </div>
        </div>

        <h3 className="mt-4 font-editorial text-[26px] font-semibold leading-tight text-[#3E0D17] transition-colors group-hover:text-[#741B2C]">
          {event.host_names}
        </h3>
        <p className="mt-1 line-clamp-1 text-sm text-[#6C5950]">{event.title}</p>

        <div className="mt-4 space-y-1.5 text-xs text-[#7A6258]">
          <p className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-[#B88433]" />
            <span>{formatShortDate(event.event_date)}</span>
          </p>
          <p className="flex items-center gap-2 font-mono text-[11px]">
            <Link2 className="h-3.5 w-3.5 shrink-0 text-[#B88433]" />
            <span className="truncate">/{event.slug}/[code]</span>
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-6 flex items-center justify-between border-t border-[#B88433]/20 pt-4 text-xs">
        <div className="flex items-center gap-2.5 text-[#6C5950]">
          <span>{event.sub_events_count} events</span>
          <span className="opacity-40">·</span>
          <span>{event.categories_count} links</span>
          <span className="opacity-40">·</span>
          <span className="inline-flex items-center gap-1 font-semibold text-[#54121F]">
            <Users className="h-3.5 w-3.5 text-[#B88433]" />
            {event.rsvps_count}
          </span>
        </div>

        <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#54121F] transition-transform group-hover:translate-x-0.5">
          Studio
          <ArrowRight className="h-3.5 w-3.5 text-[#B88433]" />
        </span>
      </div>
    </Link>
  );
}
