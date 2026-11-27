"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  Link2,
  Palette,
  Users,
} from "lucide-react";
import { BasicsDesignTab } from "@/components/dashboard/tabs/BasicsDesignTab";
import { CategoriesTab } from "@/components/dashboard/tabs/CategoriesTab";
import { LiveRsvpsTab } from "@/components/dashboard/tabs/LiveRsvpsTab";
import { SubEventsTab } from "@/components/dashboard/tabs/SubEventsTab";
import { PLAN_LABELS } from "@/lib/constants";
import type {
  EventRecord,
  InviteCategoryRecord,
  RsvpRecord,
  SubEventRecord,
} from "@/types/database";

type EditorTabId = "basics" | "sub_events" | "categories" | "rsvps";

interface EventEditorClientProps {
  event: EventRecord;
  subEvents: SubEventRecord[];
  categories: InviteCategoryRecord[];
  rsvps: RsvpRecord[];
}

export function EventEditorClient({
  event,
  subEvents,
  categories,
  rsvps,
}: EventEditorClientProps) {
  const [activeTab, setActiveTab] = useState<EditorTabId>("basics");

  const firstCategory = categories[0];

  const tabs: {
    id: EditorTabId;
    label: string;
    shortLabel: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }[] = [
    {
      id: "basics",
      label: "Basics & Design",
      shortLabel: "Basics",
      icon: Palette,
    },
    {
      id: "sub_events",
      label: "Sub-Events Schedule",
      shortLabel: "Schedule",
      icon: CalendarDays,
      count: subEvents.length,
    },
    {
      id: "categories",
      label: "Smart Category Links",
      shortLabel: "Links",
      icon: Link2,
      count: categories.length,
    },
    {
      id: "rsvps",
      label: "Live RSVPs",
      shortLabel: "RSVPs",
      icon: Users,
      count: rsvps.length,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
      {/* Breadcrumb & Event Top Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#7A6258] transition-colors hover:text-[#5B1422]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All Events
          </Link>

          <div className="mt-2 flex flex-wrap items-center gap-2.5">
            <h1 className="font-serif text-3xl font-semibold text-[#4A101C] sm:text-4xl">
              {event.host_names}
            </h1>
            <span
              className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                event.plan === "free"
                  ? "bg-[#5B1422]/10 text-[#5B1422]"
                  : "bg-[#1F6E4A]/12 text-[#175438]"
              }`}
            >
              {PLAN_LABELS[event.plan]}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-[#69564E]">{event.title}</p>
        </div>

        <div className="flex items-center gap-2.5">
          {firstCategory ? (
            <a
              href={`/${event.slug}/${firstCategory.code}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-[#5B1422]/25 bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422] shadow-2xs transition-colors hover:bg-[#5B1422] hover:text-[#FCF8F1]"
            >
              Open Live Preview
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <button
              type="button"
              onClick={() => setActiveTab("categories")}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#C88A2E]/45 bg-[#FCF5E8] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422] hover:bg-[#F4E4C1]"
            >
              <Link2 className="h-3.5 w-3.5 text-[#C88A2E]" />
              Create Link to Preview
            </button>
          )}
        </div>
      </div>

      {/* Mobile-Friendly 4-Tab Bar */}
      <div
        role="tablist"
        aria-label="Event editor sections"
        className="no-scrollbar mt-7 flex gap-2 overflow-x-auto border-b border-[#C88A2E]/25 pb-3"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold tracking-[0.06em] transition-all sm:px-5 sm:text-sm ${
                active
                  ? "bg-[#5B1422] text-[#FCF8F1] shadow-sm"
                  : "border border-[#C88A2E]/25 bg-[#FFFDF8] text-[#5B1422] hover:bg-[#FCF5E8]"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${active ? "text-[#E7C06B]" : "text-[#C88A2E]"}`}
              />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
              {typeof tab.count === "number" && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    active
                      ? "bg-[#FCF8F1]/20 text-[#F6DC9C]"
                      : "bg-[#FCF5E8] text-[#8E5B17]"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tab Panel */}
      <div className="mt-7 pb-12">
        {activeTab === "basics" && <BasicsDesignTab event={event} />}
        {activeTab === "sub_events" && (
          <SubEventsTab
            eventId={event.id}
            defaultDate={event.event_date}
            subEvents={subEvents}
          />
        )}
        {activeTab === "categories" && (
          <CategoriesTab
            eventId={event.id}
            eventSlug={event.slug}
            subEvents={subEvents}
            categories={categories}
          />
        )}
        {activeTab === "rsvps" && (
          <LiveRsvpsTab
            eventId={event.id}
            plan={event.plan}
            subEvents={subEvents}
            categories={categories}
            rsvps={rsvps}
          />
        )}
      </div>
    </main>
  );
}
