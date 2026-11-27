"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  RotateCcw,
  Shirt,
  Sparkles,
} from "lucide-react";
import { CountdownTimer } from "@/components/invite/CountdownTimer";
import { OpeningCover } from "@/components/invite/OpeningCover";
import { RsvpForm } from "@/components/invite/RsvpForm";
import { TraditionSymbol } from "@/components/invite/TraditionSymbol";
import { formatEventDate, getSafeExternalUrl } from "@/lib/utils";
import type { PublicInviteDTO } from "@/types/database";

interface InviteExperienceProps {
  invite: PublicInviteDTO;
  demoMode?: boolean;
  inModal?: boolean;
}

export function InviteExperience({
  invite,
  demoMode = false,
  inModal = false,
}: InviteExperienceProps) {
  const [opened, setOpened] = useState(false);
  const { event, category, sub_events } = invite;
  const isFreePlan = event.plan === "free" && !demoMode;
  const isMinimal = event.theme_id === "minimal_ivory";

  return (
    <div
      className={`relative min-h-screen w-full ${
        isMinimal ? "bg-[#FAF6EF]" : "bg-parchment"
      }`}
    >
      {/* Non-removable Free Plan Preview Lock Banner */}
      {isFreePlan && (
        <div className="sticky top-0 z-50 flex items-center justify-center gap-2 border-b border-[#E7C06B]/40 bg-[#3D0C16] px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F6DC9C] shadow-sm">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#E7C06B]" />
          <span>PREVIEW MODE — Free Plan (Up to 5 Test RSVPs)</span>
        </div>
      )}

      {/* Interactive Full-Screen Opening Animation */}
      <AnimatePresence>
        {!opened && (
          <OpeningCover
            animationType={event.opening_animation}
            themeId={event.theme_id}
            hostNames={event.host_names}
            eventTitle={event.title}
            greetingPrefix={category.greeting_prefix}
            onOpened={() => setOpened(true)}
            inModal={inModal}
            topOffsetClass={isFreePlan ? "top-[38px]" : ""}
          />
        )}
      </AnimatePresence>

      {/* Invitation Stationery Body */}
      <motion.main
        initial={{ opacity: 0, y: 18 }}
        animate={opened ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-14"
      >
        {/* Heritage Invitation Card Frame */}
        <article
          className={`relative overflow-hidden rounded-[28px] border px-6 py-10 text-center shadow-[0_18px_55px_rgba(74,16,28,0.09)] sm:px-12 sm:py-14 ${
            isMinimal
              ? "border-[#C88A2E]/30 bg-white"
              : "border-[#C88A2E]/40 bg-[#FFFDF8]"
          }`}
        >
          {/* Decorative Corner Gold Hairlines */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-3.5 rounded-[20px] border border-[#C88A2E]/25"
          />

          <div className="relative z-10">
            {/* Tradition Symbol */}
            {event.tradition_symbol !== "none" && (
              <div className="mb-5 flex justify-center">
                <TraditionSymbol
                  symbol={event.tradition_symbol}
                  size={64}
                  className={isMinimal ? "text-[#A68246]" : "text-[#C88A2E]"}
                />
              </div>
            )}

            {/* Category Greeting Prefix */}
            {category.greeting_prefix && (
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#C88A2E]">
                {category.greeting_prefix}
              </p>
            )}

            {/* Host / Couple Names */}
            <h1
              className={`mt-3 font-serif text-4xl font-semibold leading-[1.12] tracking-[0.01em] sm:text-5xl ${
                isMinimal ? "text-[#2B211E]" : "text-[#4A101C]"
              }`}
            >
              {event.host_names}
            </h1>

            {/* Event Title */}
            <p className="mt-2.5 font-serif text-xl italic text-[#7A5B47] sm:text-2xl">
              {event.title}
            </p>

            {/* Hairline Ornament Divider */}
            <div className="mx-auto my-6 flex items-center justify-center gap-3">
              <span className="h-px w-14 bg-[#C88A2E]/45" />
              <span className="h-1.5 w-1.5 rotate-45 bg-[#C88A2E]" />
              <span className="h-px w-14 bg-[#C88A2E]/45" />
            </div>

            {/* Main Event Date */}
            {event.event_date && (
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5B1422]">
                {formatEventDate(event.event_date)}
              </p>
            )}

            {/* Live Countdown Timer */}
            <CountdownTimer eventDate={event.event_date} themeId={event.theme_id} />

            {/* Welcome Message */}
            {event.welcome_message && (
              <p className="mx-auto mt-8 max-w-lg whitespace-pre-line text-[15px] leading-relaxed text-[#55443D]">
                {event.welcome_message}
              </p>
            )}
          </div>
        </article>

        {/* Permitted Sub-Events Schedule (ONLY category-allowed functions) */}
        {sub_events.length > 0 && (
          <section className="mt-10" aria-labelledby="ceremonies-heading">
            <div className="mb-6 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#C88A2E]">
                Celebration Itinerary
              </p>
              <h2
                id="ceremonies-heading"
                className="mt-1 font-serif text-3xl font-semibold text-[#4A101C]"
              >
                Events You Are Invited To
              </h2>
            </div>

            <div className="space-y-4">
              {sub_events.map((sub, idx) => {
                const safeMapsUrl = getSafeExternalUrl(sub.maps_url);
                return (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={opened ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                    transition={{ duration: 0.45, delay: 0.1 + idx * 0.08 }}
                    className={`rounded-2xl border p-6 shadow-[0_6px_24px_rgba(74,16,28,0.05)] ${
                      isMinimal
                        ? "border-[#C88A2E]/25 bg-white"
                        : "border-[#C88A2E]/35 bg-[#FFFDF8]"
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <h3 className="font-serif text-2xl font-semibold text-[#4A101C]">
                          {sub.name}
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-[#5C4942]">
                          {sub.event_date && (
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar className="h-4 w-4 text-[#C88A2E]" />
                              {formatEventDate(sub.event_date)}
                            </span>
                          )}
                          {sub.start_time && (
                            <span className="inline-flex items-center gap-1.5">
                              <Clock className="h-4 w-4 text-[#C88A2E]" />
                              {sub.start_time}
                            </span>
                          )}
                        </div>

                        {sub.venue_name && (
                          <p className="flex items-start gap-1.5 text-sm text-[#4A3832]">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#C88A2E]" />
                            <span>{sub.venue_name}</span>
                          </p>
                        )}
                      </div>

                      {sub.dress_code && (
                        <div className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-[#C88A2E]/35 bg-[#FCF5E8] px-3.5 py-1.5 text-xs font-medium text-[#5B1422]">
                          <Shirt className="h-3.5 w-3.5 text-[#C88A2E]" />
                          <span>{sub.dress_code}</span>
                        </div>
                      )}
                    </div>

                    {safeMapsUrl && (
                      <div className="mt-4 border-t border-[#C88A2E]/20 pt-4">
                        <a
                          href={safeMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-[#5B1422]/20 bg-[#FCF8F1] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422] transition-colors hover:bg-[#5B1422] hover:text-[#FCF8F1]"
                        >
                          <MapPin className="h-3.5 w-3.5" />
                          Open in Google Maps
                          <ExternalLink className="h-3 w-3 opacity-75" />
                        </a>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Smart Per-Event RSVP Section (Hidden when host toggles RSVP OFF) */}
        {event.rsvp_enabled && (
          <RsvpForm
            slug={event.slug}
            code={category.code}
            etiquetteType={category.etiquette_type}
            maxSeats={category.max_seats}
            greetingPrefix={category.greeting_prefix}
            subEvents={sub_events}
            themeId={event.theme_id}
            demoMode={demoMode}
          />
        )}

        {/* Subtle Footer & Replay Control */}
        <footer className="mt-10 flex flex-col items-center gap-3 pb-8 text-center">
          <button
            type="button"
            onClick={() => setOpened(false)}
            className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-[#7A6258] transition-colors hover:text-[#5B1422]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Replay Opening Animation
          </button>
          <p className="text-[11px] tracking-[0.18em] uppercase text-[#9A8579]">
            Crafted with SaffronPass
          </p>
        </footer>
      </motion.main>
    </div>
  );
}
