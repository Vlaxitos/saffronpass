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
  PLAN_LABELS,
} from "@/lib/constants";
import { formatShortDate } from "@/lib/utils";
import type { EventRecord, SideTag } from "@/types/database";

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
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      {/* Page Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#C88A2E]">
            Host Command Center
          </p>
          <h1 className="mt-1 font-serif text-4xl font-semibold text-[#4A101C]">
            Namaste, {hostName}
          </h1>
          <p className="mt-1 text-sm text-[#69564E]">
            Manage your interactive invitations, private guest-circle links, and
            live ceremony headcounts.
          </p>
        </div>

        <button
          type="button"
          id="create-new-event-btn"
          onClick={() => setCreateOpen(true)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#5B1422] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#FCF8F1] shadow-md transition-colors hover:bg-[#460E19]"
        >
          <Plus className="h-4 w-4" />
          Create New Event
        </button>
      </div>

      {hasNoEventsAtAll ? (
        <section className="mt-10 rounded-3xl border border-dashed border-[#C88A2E]/45 bg-[#FFFDF8] px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FCF5E8] text-[#C88A2E]">
            <Sparkles className="h-7 w-7" />
          </div>
          <h2 className="mt-5 font-serif text-3xl font-semibold text-[#4A101C]">
            Begin Your First Celebration
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#69564E]">
            Create a royal animated invitation in under two minutes—add your
            ceremonies, generate private guest links, and watch RSVPs roll in.
          </p>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="mt-7 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#5B1422] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#FCF8F1] shadow-md transition-colors hover:bg-[#460E19]"
          >
            <Plus className="h-4 w-4" />
            Create Your First Event
          </button>
        </section>
      ) : (
        <div className="mt-9 space-y-11">
          {/* Section 1: My Events */}
          <section>
            <div className="mb-4 flex items-center gap-3">
              <h2 className="font-serif text-2xl font-semibold text-[#4A101C]">
                My Events ({myEvents.length})
              </h2>
              <span className="h-px flex-1 bg-[#C88A2E]/25" />
            </div>

            {myEvents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#C88A2E]/40 bg-[#FFFDF8] p-8 text-center">
                <p className="text-sm text-[#69564E]">
                  You haven&apos;t created your own event yet—start one anytime
                  using the button above.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {myEvents.map((event) => (
                  <EventSummaryCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </section>

          {/* Section 2: Shared With Me (Co-Host) */}
          {sharedEvents.length > 0 && (
            <section>
              <div className="mb-4 flex items-center gap-3">
                <h2 className="inline-flex items-center gap-2 font-serif text-2xl font-semibold text-[#4A101C]">
                  <UserCheck className="h-5 w-5 text-[#C88A2E]" />
                  Shared With Me (Co-Host) ({sharedEvents.length})
                </h2>
                <span className="h-px flex-1 bg-[#C88A2E]/25" />
              </div>

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
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

function EventSummaryCard({ event }: { event: DashboardEventSummary }) {
  return (
    <Link
      href={`/dashboard/events/${event.id}`}
      className="group flex flex-col justify-between rounded-2xl border border-[#C88A2E]/30 bg-[#FFFDF8] p-6 shadow-[0_4px_20px_rgba(74,16,28,0.04)] transition-all hover:-translate-y-0.5 hover:border-[#C88A2E]/65 hover:shadow-[0_12px_32px_rgba(74,16,28,0.09)]"
    >
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full bg-[#FCF5E8] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8E5B17]">
            {getEventTypeLabel(event.event_type)}
          </span>
          <div className="flex items-center gap-1.5">
            {event.is_cohost && (
              <span className="rounded-full bg-[#1F6E4A]/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#175438]">
                Co-Host
                {event.cohost_side_tag
                  ? ` · ${getSideTagLabel(event.cohost_side_tag)}`
                  : ""}
              </span>
            )}
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                event.plan === "free"
                  ? "bg-[#5B1422]/8 text-[#5B1422]"
                  : "bg-[#1F6E4A]/12 text-[#175438]"
              }`}
            >
              {PLAN_LABELS[event.plan]}
            </span>
          </div>
        </div>

        <h3 className="mt-4 font-serif text-2xl font-semibold text-[#4A101C] group-hover:text-[#7A1F31]">
          {event.host_names}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-sm text-[#69564E]">
          {event.title}
        </p>

        <div className="mt-4 space-y-1.5 text-xs text-[#7A6258]">
          <p className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-[#C88A2E]" />
            <span>{formatShortDate(event.event_date)}</span>
          </p>
          <p className="flex items-center gap-1.5 font-mono text-[11px]">
            <Link2 className="h-3.5 w-3.5 shrink-0 text-[#C88A2E]" />
            <span className="truncate">/{event.slug}/[code]</span>
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-[#C88A2E]/20 pt-4 text-xs">
        <div className="flex items-center gap-3 text-[#69564E]">
          <span>{event.sub_events_count} events</span>
          <span>·</span>
          <span>{event.categories_count} links</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1 font-semibold text-[#5B1422]">
            <Users className="h-3.5 w-3.5 text-[#C88A2E]" />
            {event.rsvps_count}
          </span>
        </div>

        <span className="inline-flex items-center gap-1 font-semibold text-[#5B1422] transition-transform group-hover:translate-x-0.5">
          Manage
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
