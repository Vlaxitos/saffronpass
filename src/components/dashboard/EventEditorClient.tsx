"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  Eye,
  Link2,
  Maximize2,
  Palette,
  RotateCcw,
  UserCheck,
  Users,
} from "lucide-react";
import {
  BasicsDesignTab,
  type LiveEventDraft,
} from "@/components/dashboard/tabs/BasicsDesignTab";
import { CategoriesTab } from "@/components/dashboard/tabs/CategoriesTab";
import { CohostsTab } from "@/components/dashboard/tabs/CohostsTab";
import { LiveRsvpsTab } from "@/components/dashboard/tabs/LiveRsvpsTab";
import { SubEventsTab } from "@/components/dashboard/tabs/SubEventsTab";
import { InviteExperience } from "@/components/invite/InviteExperience";
import { FullScreenDemoOverlay } from "@/components/landing/FullScreenDemoOverlay";
import { normalizeThemeId, PLAN_LABELS } from "@/lib/constants";
import type {
  EventCohostRecord,
  EventRecord,
  InviteCategoryRecord,
  PublicInviteDTO,
  RsvpRecord,
  SubEventRecord,
} from "@/types/database";

type EditorTabId = "basics" | "sub_events" | "categories" | "rsvps" | "cohosts";

interface EventEditorClientProps {
  event: EventRecord;
  isOwner: boolean;
  subEvents: SubEventRecord[];
  categories: InviteCategoryRecord[];
  rsvps: RsvpRecord[];
  cohosts: EventCohostRecord[];
}

export function EventEditorClient({
  event,
  isOwner,
  subEvents,
  categories,
  rsvps,
  cohosts,
}: EventEditorClientProps) {
  const [activeTab, setActiveTab] = useState<EditorTabId>("basics");
  const [liveDraft, setLiveDraft] = useState<LiveEventDraft>(() => ({
    event_type: event.event_type,
    tradition_symbol: event.tradition_symbol,
    title: event.title,
    host_names: event.host_names,
    event_date: event.event_date ?? null,
    slug: event.slug,
    welcome_message: event.welcome_message ?? "",
    theme_id: normalizeThemeId(event.theme_id),
    opening_animation: event.opening_animation,
    rsvp_enabled: event.rsvp_enabled,
    cover_image_url: event.cover_image_url ?? null,
    gallery_images: Array.isArray(event.gallery_images)
      ? event.gallery_images.filter(Boolean)
      : [],
    particle_effect: event.particle_effect ?? "none",
    scratch_reveal_enabled: Boolean(event.scratch_reveal_enabled),
    music_track: event.music_track ?? "none",
    custom_music_url: event.custom_music_url ?? null,
  }));

  // Phone preview starts opened so edits reflect instantaneously; tapping "Replay Opening" plays the 3D cover!
  const [previewReplayKey, setPreviewReplayKey] = useState(0);
  const [previewStartsOpened, setPreviewStartsOpened] = useState(true);
  const [fullScreenOpen, setFullScreenOpen] = useState(false);
  const [fullScreenKey, setFullScreenKey] = useState(0);

  const firstCategory = categories[0];

  const livePreviewInvite = useMemo<PublicInviteDTO>(
    () => ({
      event: {
        slug: liveDraft.slug || event.slug,
        event_type: liveDraft.event_type,
        title: liveDraft.title || "Your Celebration Title",
        host_names: liveDraft.host_names || "Couple / Host Names",
        tradition_symbol: liveDraft.tradition_symbol,
        event_date: liveDraft.event_date,
        welcome_message: liveDraft.welcome_message,
        theme_id: liveDraft.theme_id,
        opening_animation: liveDraft.opening_animation,
        rsvp_enabled: liveDraft.rsvp_enabled,
        plan: event.plan,
        cover_image_url: liveDraft.cover_image_url,
        gallery_images: liveDraft.gallery_images,
        particle_effect: liveDraft.particle_effect,
        scratch_reveal_enabled: liveDraft.scratch_reveal_enabled,
        music_track: liveDraft.music_track,
        custom_music_url: liveDraft.custom_music_url,
      },
      category: {
        code: firstCategory?.code ?? "preview1",
        etiquette_type: firstCategory?.etiquette_type ?? "family",
        max_seats: firstCategory?.max_seats ?? 4,
        greeting_prefix:
          firstCategory?.greeting_prefix ?? "With Family (Saparivar)",
      },
      sub_events: subEvents.map((se) => ({
        id: se.id,
        name: se.name,
        event_date: se.event_date,
        start_time: se.start_time,
        venue_name: se.venue_name,
        maps_url: se.maps_url,
        dress_code: se.dress_code,
        sort_order: se.sort_order,
      })),
    }),
    [liveDraft, event.slug, event.plan, firstCategory, subEvents]
  );

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
      label: "Schedule",
      shortLabel: "Schedule",
      icon: CalendarDays,
      count: subEvents.length,
    },
    {
      id: "categories",
      label: "Category Links",
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
    {
      id: "cohosts",
      label: "Co-Hosts",
      shortLabel: "Co-Hosts",
      icon: UserCheck,
      count: cohosts.length,
    },
  ];

  const showSplitPreview = activeTab === "basics" || activeTab === "sub_events";

  return (
    <main className="mx-auto w-full max-w-[1360px] flex-1 px-4 py-6 sm:px-6 sm:py-9">
      {/* Breadcrumb & Event Top Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <Link
            href="/dashboard"
            className="inline-flex min-h-[36px] items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#796258] transition-colors hover:text-[#54121F]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All Events
          </Link>

          <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
            <h1 className="font-editorial text-3xl font-semibold text-[#470F1B] sm:text-4xl">
              {liveDraft.host_names || event.host_names}
            </h1>
            {!isOwner && (
              <span className="rounded-full bg-[#1B6343]/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#154F35]">
                Co-Host Access
              </span>
            )}
            <span
              className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                event.plan === "free"
                  ? "bg-[#54121F]/10 text-[#54121F]"
                  : "bg-[#1B6343]/12 text-[#154F35]"
              }`}
            >
              {PLAN_LABELS[event.plan]}
            </span>
          </div>
          <p className="mt-0.5 truncate text-sm text-[#6C5950]">
            {liveDraft.title || event.title}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Mobile / Tablet (< xl) Live Preview Button */}
          <button
            type="button"
            onClick={() => {
              setFullScreenKey((k) => k + 1);
              setFullScreenOpen(true);
            }}
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border border-[#B88433]/45 bg-[#FBF3E5] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#54121F] transition-colors hover:bg-[#F3E4C6] xl:hidden"
          >
            <Eye className="h-4 w-4 text-[#B88433]" />
            Live Preview
          </button>

          {firstCategory ? (
            <a
              href={`/${event.slug}/${firstCategory.code}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#54121F]/22 bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#54121F] shadow-2xs transition-colors hover:bg-[#54121F] hover:text-[#FBF7F0]"
            >
              Open Guest Link
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <button
              type="button"
              onClick={() => setActiveTab("categories")}
              className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border border-[#B88433]/45 bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#54121F] hover:bg-[#FBF3E5]"
            >
              <Link2 className="h-3.5 w-3.5 text-[#B88433]" />
              Create Guest Link
            </button>
          )}
        </div>
      </div>

      {/* Horizontally Scrollable Pill Tab Bar (Zero Squish on 360px Mobile) */}
      <div
        role="tablist"
        aria-label="Event editor sections"
        className="no-scrollbar mt-6 flex gap-2 overflow-x-auto border-b border-[#B88433]/22 pb-3.5"
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
              className={`inline-flex min-h-[44px] shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-[0.04em] transition-all sm:px-5 ${
                active
                  ? "bg-[#54121F] text-[#FBF7F0] shadow-sm"
                  : "border border-[#B88433]/26 bg-[#FFFDF9] text-[#54121F] hover:bg-[#FBF3E5]"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${
                  active ? "text-[#E7C06B]" : "text-[#B88433]"
                }`}
              />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
              {typeof tab.count === "number" && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    active
                      ? "bg-white/18 text-[#F6DC9C]"
                      : "bg-[#FBF3E5] text-[#8E5B17]"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Editor Content (+ Sticky Split-Screen Live Phone Preview on xl+ Screens) */}
      <div
        className={`mt-7 pb-12 ${
          showSplitPreview
            ? "xl:grid xl:grid-cols-[minmax(0,1fr)_390px] xl:items-start xl:gap-8"
            : ""
        }`}
      >
        <div className="min-w-0">
          {activeTab === "basics" && (
            <BasicsDesignTab
              event={event}
              isOwner={isOwner}
              onDraftChange={setLiveDraft}
            />
          )}
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
              hostNames={event.host_names}
              eventTitle={event.title}
              subEvents={subEvents}
              categories={categories}
            />
          )}
          {activeTab === "rsvps" && (
            <LiveRsvpsTab
              eventId={event.id}
              eventSlug={event.slug}
              hostNames={event.host_names}
              plan={event.plan}
              subEvents={subEvents}
              categories={categories}
              rsvps={rsvps}
            />
          )}
          {activeTab === "cohosts" && (
            <CohostsTab
              eventId={event.id}
              isOwner={isOwner}
              cohosts={cohosts}
            />
          )}
        </div>

        {/* Sticky Desktop Split-Screen Live Phone Preview (xl+) */}
        {showSplitPreview && (
          <aside className="hidden xl:sticky xl:top-24 xl:block">
            <div className="overflow-hidden rounded-[36px] border border-[#B88433]/38 bg-[#1E0C13] p-2.5 shadow-[0_24px_64px_rgba(48,12,20,0.2)]">
              <div className="flex items-center justify-between gap-2 px-2.5 pb-2.5 pt-1 text-[#F3E4C6]">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#F3E4C6]/90">
                    Live Preview
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewStartsOpened(false);
                      setPreviewReplayKey((k) => k + 1);
                    }}
                    className="inline-flex min-h-[30px] cursor-pointer items-center gap-1 rounded-full border border-[#E7C06B]/30 bg-white/8 px-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#F6E4B8] hover:bg-white/16"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Replay Opening
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFullScreenKey((k) => k + 1);
                      setFullScreenOpen(true);
                    }}
                    aria-label="Open full-screen preview"
                    className="inline-flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full bg-[#C88A2E] text-[#221204] hover:bg-[#DDB05A]"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="relative h-[680px] w-full overflow-y-auto overflow-x-hidden rounded-[26px] bg-[#190910]">
                <InviteExperience
                  key={`editor-phone-${previewReplayKey}-${liveDraft.opening_animation}`}
                  invite={livePreviewInvite}
                  demoMode
                  embedded
                  initialOpened={previewStartsOpened}
                />
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Full-Screen Live Preview Overlay (Mobile Drawer & Desktop Expand) */}
      <FullScreenDemoOverlay
        open={fullScreenOpen}
        onClose={() => setFullScreenOpen(false)}
        invite={livePreviewInvite}
        launchKey={fullScreenKey}
      />
    </main>
  );
}
