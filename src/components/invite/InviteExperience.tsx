"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  RotateCcw,
  Shirt,
  Sparkles,
  X,
} from "lucide-react";
import { CountdownTimer } from "@/components/invite/CountdownTimer";
import { MusicPlayerButton } from "@/components/invite/MusicPlayerButton";
import { OpeningCover } from "@/components/invite/OpeningCover";
import { ParticleOverlay } from "@/components/invite/ParticleOverlay";
import { RsvpForm } from "@/components/invite/RsvpForm";
import { ScratchRevealDate } from "@/components/invite/ScratchRevealDate";
import { TraditionSymbol } from "@/components/invite/TraditionSymbol";
import { SaffronAudioEngine } from "@/lib/audio-engine";
import { getInviteTheme } from "@/lib/theme-styles";
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
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const audioRef = useRef<SaffronAudioEngine | null>(null);

  const { event, category, sub_events } = invite;
  const isFreePlan = event.plan === "free" && !demoMode;
  const theme = getInviteTheme(event.theme_id);

  const hasMusic =
    event.music_track !== "none" &&
    (event.music_track !== "custom" || Boolean(event.custom_music_url));

  const safeCoverUrl = getSafeExternalUrl(event.cover_image_url);
  const safeGalleryUrls = (event.gallery_images ?? [])
    .map((u) => getSafeExternalUrl(u))
    .filter((u): u is string => Boolean(u))
    .slice(0, 4);

  useEffect(() => {
    const engine = new SaffronAudioEngine();
    engine.configure(event.music_track, event.custom_music_url);
    audioRef.current = engine;

    return () => {
      engine.dispose();
      audioRef.current = null;
    };
  }, [event.music_track, event.custom_music_url]);

  const handleOpeningTapAudio = () => {
    if (!hasMusic || !audioRef.current) return;
    const started = audioRef.current.start();
    setMusicPlaying(started);
  };

  const handleToggleMusic = () => {
    if (!audioRef.current) return;
    const nowPlaying = audioRef.current.toggle();
    setMusicPlaying(nowPlaying);
  };

  return (
    <div className={`relative min-h-screen w-full ${theme.pageBg}`}>
      {/* Non-removable Free Plan Preview Lock Banner */}
      {isFreePlan && (
        <div className="sticky top-0 z-50 flex items-center justify-center gap-2 border-b border-[#E7C06B]/40 bg-[#3D0C16] px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F6DC9C] shadow-sm">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#E7C06B]" />
          <span>PREVIEW MODE — Free Plan (Up to 5 Test RSVPs)</span>
        </div>
      )}

      {/* Lightweight Falling Particles Effect (Marigold / Rose Petals / Gold Sparkles) */}
      {opened && event.particle_effect !== "none" && (
        <ParticleOverlay effect={event.particle_effect} inModal={inModal} />
      )}

      {/* Interactive Full-Screen Opening Animation */}
      <AnimatePresence>
        {!opened && (
          <OpeningCover
            animationType={event.opening_animation}
            themeId={event.theme_id}
            hostNames={event.host_names}
            eventTitle={event.title}
            eventDate={event.event_date}
            greetingPrefix={category.greeting_prefix}
            coverImageUrl={safeCoverUrl}
            onTapStart={handleOpeningTapAudio}
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
        className="relative z-10 mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-14"
      >
        {/* Heritage Invitation Card Frame */}
        <article
          className={`relative overflow-hidden rounded-[28px] border px-6 py-10 text-center shadow-[0_18px_55px_rgba(0,0,0,0.12)] sm:px-12 sm:py-14 ${theme.cardBorder} ${theme.cardBg}`}
        >
          {/* Decorative Corner Gold Hairlines */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-3.5 rounded-[20px] border ${theme.innerBorder}`}
          />

          {/* Subtle Jasmine / Temple Zari Ornament for South Indian Silk Theme */}
          {theme.id === "south_indian_silk" && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-8 top-4 flex items-center justify-center gap-2 opacity-60"
            >
              <span className="h-px flex-1 bg-[#D4A024]/60" />
              <span className="h-2 w-2 rounded-full bg-[#D4A024]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#0F4C3A]" />
              <span className="h-2 w-2 rounded-full bg-[#D4A024]" />
              <span className="h-px flex-1 bg-[#D4A024]/60" />
            </div>
          )}

          <div className="relative z-10">
            {/* Tradition Symbol */}
            {event.tradition_symbol !== "none" && (
              <div className="mb-5 flex justify-center">
                <TraditionSymbol
                  symbol={event.tradition_symbol}
                  size={64}
                  className={theme.accentText}
                />
              </div>
            )}

            {/* Category Greeting Prefix */}
            {category.greeting_prefix && (
              <p
                className={`text-xs font-semibold uppercase tracking-[0.26em] ${theme.accentText}`}
              >
                {category.greeting_prefix}
              </p>
            )}

            {/* Host / Couple Names */}
            <h1
              className={`mt-3 font-serif text-4xl font-semibold leading-[1.12] tracking-[0.01em] sm:text-5xl ${theme.headingText}`}
            >
              {event.host_names}
            </h1>

            {/* Event Title */}
            <p
              className={`mt-2.5 font-serif text-xl italic sm:text-2xl ${theme.subHeadingText}`}
            >
              {event.title}
            </p>

            {/* Optional Uploaded Cover Portrait inside the Stationery Card */}
            {safeCoverUrl && (
              <div
                className={`relative mx-auto mt-7 aspect-[16/10] w-full max-w-lg overflow-hidden rounded-2xl border shadow-md ${theme.cardBorder}`}
              >
                <Image
                  src={safeCoverUrl}
                  alt={`${event.host_names} portrait`}
                  fill
                  sizes="(max-width: 768px) 92vw, 540px"
                  className="object-cover"
                />
              </div>
            )}

            {/* Hairline Ornament Divider */}
            <div className="mx-auto my-6 flex items-center justify-center gap-3">
              <span className={`h-px w-14 opacity-45 ${theme.dividerBg}`} />
              <span className={`h-1.5 w-1.5 rotate-45 ${theme.dividerBg}`} />
              <span className={`h-px w-14 opacity-45 ${theme.dividerBg}`} />
            </div>

            {/* Main Event Date OR Interactive Gold-Foil Scratch-to-Reveal Card */}
            {event.event_date &&
              (event.scratch_reveal_enabled ? (
                <ScratchRevealDate
                  eventDate={event.event_date}
                  themeId={event.theme_id}
                />
              ) : (
                <p
                  className={`text-sm font-semibold uppercase tracking-[0.18em] ${theme.headingText}`}
                >
                  {formatEventDate(event.event_date)}
                </p>
              ))}

            {/* Live Countdown Timer */}
            <CountdownTimer eventDate={event.event_date} themeId={event.theme_id} />

            {/* Welcome Message */}
            {event.welcome_message && (
              <p
                className={`mx-auto mt-8 max-w-lg whitespace-pre-line text-[15px] leading-relaxed ${theme.bodyText}`}
              >
                {event.welcome_message}
              </p>
            )}
          </div>
        </article>

        {/* Couple / Event Photo Gallery (up to 4 compressed WebP photos) */}
        {safeGalleryUrls.length > 0 && (
          <section className="mt-10" aria-labelledby="gallery-heading">
            <div className="mb-5 text-center">
              <p
                className={`text-[11px] font-semibold uppercase tracking-[0.26em] ${theme.accentText}`}
              >
                Cherished Moments
              </p>
              <h2
                id="gallery-heading"
                className={`mt-1 font-serif text-3xl font-semibold ${theme.headingText}`}
              >
                Our Gallery
              </h2>
            </div>

            <div
              className={`grid gap-3 ${
                safeGalleryUrls.length === 1
                  ? "grid-cols-1"
                  : "grid-cols-2"
              }`}
            >
              {safeGalleryUrls.map((imgUrl, idx) => (
                <motion.button
                  key={imgUrl}
                  type="button"
                  onClick={() => setLightboxImage(imgUrl)}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className={`group relative aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-2xl border shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C88A2E] ${theme.cardBorder}`}
                >
                  <Image
                    src={imgUrl}
                    alt={`${event.host_names} memory ${idx + 1}`}
                    fill
                    sizes="(max-width: 768px) 46vw, 310px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </motion.button>
              ))}
            </div>
          </section>
        )}

        {/* Permitted Sub-Events Schedule (ONLY category-allowed functions) */}
        {sub_events.length > 0 && (
          <section className="mt-10" aria-labelledby="ceremonies-heading">
            <div className="mb-6 text-center">
              <p
                className={`text-[11px] font-semibold uppercase tracking-[0.26em] ${theme.accentText}`}
              >
                Celebration Itinerary
              </p>
              <h2
                id="ceremonies-heading"
                className={`mt-1 font-serif text-3xl font-semibold ${theme.headingText}`}
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
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.5, delay: idx * 0.08 }}
                    className={`rounded-2xl border p-6 shadow-[0_6px_24px_rgba(0,0,0,0.06)] ${theme.cardBorder} ${theme.cardBg}`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <h3 className={`font-serif text-2xl font-semibold ${theme.headingText}`}>
                          {sub.name}
                        </h3>

                        <div className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm ${theme.bodyText}`}>
                          {sub.event_date && (
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar className={`h-4 w-4 ${theme.accentText}`} />
                              {formatEventDate(sub.event_date)}
                            </span>
                          )}
                          {sub.start_time && (
                            <span className="inline-flex items-center gap-1.5">
                              <Clock className={`h-4 w-4 ${theme.accentText}`} />
                              {sub.start_time}
                            </span>
                          )}
                        </div>

                        {sub.venue_name && (
                          <p className={`flex items-start gap-1.5 text-sm ${theme.bodyText}`}>
                            <MapPin className={`mt-0.5 h-4 w-4 shrink-0 ${theme.accentText}`} />
                            <span>{sub.venue_name}</span>
                          </p>
                        )}
                      </div>

                      {sub.dress_code && (
                        <div
                          className={`inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border px-3.5 py-1.5 text-xs font-medium ${theme.pillBg} ${theme.pillText}`}
                        >
                          <Shirt className={`h-3.5 w-3.5 ${theme.accentText}`} />
                          <span>{sub.dress_code}</span>
                        </div>
                      )}
                    </div>

                    {safeMapsUrl && (
                      <div className={`mt-4 border-t pt-4 ${theme.innerBorder}`}>
                        <a
                          href={safeMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${theme.secondaryBtn}`}
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
        <footer className="mt-10 flex flex-col items-center gap-3 pb-12 text-center">
          <button
            type="button"
            onClick={() => {
              audioRef.current?.stop();
              setMusicPlaying(false);
              setOpened(false);
            }}
            className={`inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium transition-opacity opacity-80 hover:opacity-100 ${theme.mutedText}`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Replay Opening Animation
          </button>
          <p className={`text-[11px] uppercase tracking-[0.18em] opacity-75 ${theme.mutedText}`}>
            Crafted with SaffronPass
          </p>
        </footer>
      </motion.main>

      {/* Floating Bottom-Right Mute / Play Pill once Opened */}
      {opened && hasMusic && (
        <MusicPlayerButton
          playing={musicPlaying}
          onToggle={handleToggleMusic}
          isDark={theme.isDark}
          inModal={inModal}
        />
      )}

      {/* Photo Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Enlarged couple photo"
          >
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              aria-label="Close photo preview"
              className="absolute right-4 top-4 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
            >
              <X className="h-5 w-5" />
            </button>
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative h-[75vh] w-full max-w-3xl overflow-hidden rounded-2xl"
            >
              <Image
                src={lightboxImage}
                alt="Celebration memory full view"
                fill
                sizes="95vw"
                className="object-contain"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
