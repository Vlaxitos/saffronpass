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
import { resolveMusicTrackUrl, SaffronAudioPlayer } from "@/lib/audioPlayer";
import { getInviteTheme } from "@/lib/theme-styles";
import { formatEventDate, getSafeExternalUrl } from "@/lib/utils";
import type { PublicInviteDTO } from "@/types/database";

interface InviteExperienceProps {
  invite: PublicInviteDTO;
  demoMode?: boolean;
  /** When true, renders strictly inside a studio/editor phone viewport without fixed full-window overlays. */
  embedded?: boolean;
  /** Optional override to start already opened (e.g., when host edits fields live in desktop split-screen). */
  initialOpened?: boolean;
}

export function InviteExperience({
  invite,
  demoMode = false,
  embedded = false,
  initialOpened = false,
}: InviteExperienceProps) {
  const [opened, setOpened] = useState(initialOpened);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const audioRef = useRef<SaffronAudioPlayer | null>(null);

  const { event, category, sub_events } = invite;
  const isFreePlan = event.plan === "free" && !demoMode;
  const theme = getInviteTheme(event.theme_id);

  const hasMusic = Boolean(
    resolveMusicTrackUrl(event.music_track, event.custom_music_url)
  );

  const safeCoverUrl = getSafeExternalUrl(event.cover_image_url);
  const safeGalleryUrls = (event.gallery_images ?? [])
    .map((u) => getSafeExternalUrl(u))
    .filter((u): u is string => Boolean(u))
    .slice(0, 4);

  useEffect(() => {
    const player = new SaffronAudioPlayer((playing) => {
      setMusicPlaying(playing);
    });
    player.configure(event.music_track, event.custom_music_url);
    audioRef.current = player;

    return () => {
      player.dispose();
      audioRef.current = null;
    };
  }, [event.music_track, event.custom_music_url]);

  const handleOpeningTapAudio = () => {
    if (!hasMusic || !audioRef.current) return;
    audioRef.current.start();
  };

  const handleToggleMusic = () => {
    if (!audioRef.current) return;
    audioRef.current.toggle();
  };

  const inviteInnerContent = (
    <div
      className={`texture-paper relative w-full ${
        embedded ? "min-h-full" : "min-h-[100dvh] md:min-h-0"
      } ${theme.pageBg}`}
    >
      {/* Non-removable Free Plan Preview Lock Banner */}
      {isFreePlan && (
        <div className="sticky top-0 z-50 flex items-center justify-center gap-2 border-b border-[#E7C06B]/35 bg-[#360A13] px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[#F6DC9C] shadow-sm">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#E7C06B]" />
          <span>PREVIEW MODE — Free Plan (Up to 5 Test RSVPs)</span>
        </div>
      )}

      {/* Lightweight Falling Particles Overlay */}
      {opened && event.particle_effect !== "none" && (
        <ParticleOverlay effect={event.particle_effect} inModal={embedded} />
      )}

      {/* Zero-Scroll 3D Tactile Opening Cover */}
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
            embedded={embedded}
            topOffsetClass={isFreePlan && !embedded ? "top-[37px]" : ""}
          />
        )}
      </AnimatePresence>

      {/* Invitation Keepsake Stationery Content */}
      <motion.main
        initial={{ opacity: initialOpened ? 1 : 0, y: initialOpened ? 0 : 16 }}
        animate={opened ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
        className={`relative z-10 mx-auto w-full ${
          embedded ? "px-4 py-6" : "px-4 py-7 sm:px-7 sm:py-10"
        }`}
      >
        {/* Heritage Couture Stationery Card */}
        <article
          className={`texture-paper relative overflow-hidden rounded-[26px] border px-5 py-9 text-center shadow-[0_14px_44px_rgba(0,0,0,0.1)] sm:px-9 sm:py-12 ${theme.cardBorder} ${theme.cardBg}`}
        >
          {/* Inset 1px antique gold architectural hairline frame */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-3 rounded-[19px] border ${theme.innerBorder}`}
          />

          {/* Subtle Jasmine / Temple Zari Ornament for South Indian Silk */}
          {theme.id === "south_indian_silk" && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-8 top-4 flex items-center justify-center gap-2 opacity-65"
            >
              <span className="h-px flex-1 bg-[#CE9C26]/55" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#CE9C26]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#0E4635]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#CE9C26]" />
              <span className="h-px flex-1 bg-[#CE9C26]/55" />
            </div>
          )}

          <div className="relative z-10">
            {/* Tradition Symbol */}
            {event.tradition_symbol !== "none" && (
              <div className="mb-4 flex justify-center">
                <TraditionSymbol
                  symbol={event.tradition_symbol}
                  size={embedded ? 50 : 60}
                  className={theme.accentText}
                />
              </div>
            )}

            {/* Category Greeting Prefix */}
            {category.greeting_prefix && (
              <p
                className={`text-[10px] font-semibold uppercase tracking-[0.28em] ${theme.accentText}`}
              >
                {category.greeting_prefix}
              </p>
            )}

            {/* Host / Couple Names */}
            <h1
              className={`mt-3 font-editorial font-semibold leading-[1.08] tracking-[0.01em] ${
                embedded
                  ? "text-3xl"
                  : "text-[clamp(2.25rem,6vw,3.1rem)]"
              } ${theme.headingText}`}
            >
              {event.host_names}
            </h1>

            {/* Event Title */}
            <p
              className={`mt-2 font-editorial italic ${
                embedded ? "text-lg" : "text-xl sm:text-2xl"
              } ${theme.subHeadingText}`}
            >
              {event.title}
            </p>

            {/* Optional Uploaded Cover Portrait */}
            {safeCoverUrl && (
              <div
                className={`relative mx-auto mt-6 aspect-[16/10] w-full overflow-hidden rounded-2xl border shadow-md ${theme.cardBorder}`}
              >
                <Image
                  src={safeCoverUrl}
                  alt={`${event.host_names} portrait`}
                  fill
                  sizes="(max-width: 768px) 92vw, 460px"
                  className="object-cover"
                />
              </div>
            )}

            {/* Ornamental Diamond Hairline Divider */}
            <div className="mx-auto my-6 flex items-center justify-center gap-3">
              <span className={`h-px w-12 opacity-40 ${theme.dividerBg}`} />
              <span className={`h-1.5 w-1.5 rotate-45 ${theme.dividerBg}`} />
              <span className={`h-px w-12 opacity-40 ${theme.dividerBg}`} />
            </div>

            {/* Main Event Date OR Gold-Foil Scratch-to-Reveal Card */}
            {event.event_date &&
              (event.scratch_reveal_enabled ? (
                <ScratchRevealDate
                  eventDate={event.event_date}
                  themeId={event.theme_id}
                />
              ) : (
                <p
                  className={`text-xs font-semibold uppercase tracking-[0.22em] ${theme.headingText}`}
                >
                  {formatEventDate(event.event_date)}
                </p>
              ))}

            {/* Architectural Hairline Countdown */}
            <CountdownTimer
              eventDate={event.event_date}
              themeId={event.theme_id}
            />

            {/* Welcome Message */}
            {event.welcome_message && (
              <p
                className={`mx-auto mt-7 max-w-md whitespace-pre-line text-[14px] leading-[1.72] sm:text-[15px] ${theme.bodyText}`}
              >
                {event.welcome_message}
              </p>
            )}
          </div>
        </article>

        {/* Couple / Event Photo Gallery */}
        {safeGalleryUrls.length > 0 && (
          <section className="mt-9" aria-labelledby="gallery-heading">
            <div className="mb-4 text-center">
              <p
                className={`text-[10px] font-semibold uppercase tracking-[0.26em] ${theme.accentText}`}
              >
                Cherished Moments
              </p>
              <h2
                id="gallery-heading"
                className={`mt-1 font-editorial text-2xl font-semibold sm:text-3xl ${theme.headingText}`}
              >
                Our Gallery
              </h2>
            </div>

            <div
              className={`grid gap-2.5 ${
                safeGalleryUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"
              }`}
            >
              {safeGalleryUrls.map((imgUrl, idx) => (
                <motion.button
                  key={imgUrl}
                  type="button"
                  onClick={() => setLightboxImage(imgUrl)}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: idx * 0.06 }}
                  className={`group relative aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-2xl border shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C88A2E] ${theme.cardBorder}`}
                >
                  <Image
                    src={imgUrl}
                    alt={`${event.host_names} memory ${idx + 1}`}
                    fill
                    sizes="(max-width: 768px) 46vw, 240px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </motion.button>
              ))}
            </div>
          </section>
        )}

        {/* Editorial Numbered Vertical Timeline for Permitted Sub-Events */}
        {sub_events.length > 0 && (
          <section className="mt-10" aria-labelledby="ceremonies-heading">
            <div className="mb-6 text-center">
              <p
                className={`text-[10px] font-semibold uppercase tracking-[0.26em] ${theme.accentText}`}
              >
                Celebration Itinerary
              </p>
              <h2
                id="ceremonies-heading"
                className={`mt-1 font-editorial text-2xl font-semibold sm:text-3xl ${theme.headingText}`}
              >
                Events You Are Invited To
              </h2>
            </div>

            <div className="relative space-y-4">
              {/* Subtle vertical editorial timeline rail */}
              {sub_events.length > 1 && (
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute left-[21px] top-6 bottom-6 w-px opacity-30 ${theme.dividerBg}`}
                />
              )}

              {sub_events.map((sub, idx) => {
                const safeMapsUrl = getSafeExternalUrl(sub.maps_url);
                const ordinal = String(idx + 1).padStart(2, "0");
                return (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.48, delay: idx * 0.07 }}
                    className="relative flex gap-3.5"
                  >
                    {/* Numbered Timeline Node */}
                    <div
                      className={`relative z-10 mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border font-display text-xs font-semibold shadow-2xs ${theme.pillBg} ${theme.accentText}`}
                    >
                      {ordinal}
                    </div>

                    {/* Ceremony Card */}
                    <div
                      className={`texture-paper flex-1 rounded-2xl border p-5 shadow-[0_6px_22px_rgba(0,0,0,0.05)] ${theme.cardBorder} ${theme.cardBg}`}
                    >
                      <div className="flex flex-col gap-2.5">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <h3
                            className={`font-editorial text-2xl font-semibold leading-snug ${theme.headingText}`}
                          >
                            {sub.name}
                          </h3>
                          {sub.dress_code && (
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium ${theme.pillBg} ${theme.pillText}`}
                            >
                              <Shirt
                                className={`h-3 w-3 shrink-0 ${theme.accentText}`}
                              />
                              <span>{sub.dress_code}</span>
                            </span>
                          )}
                        </div>

                        <div
                          className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm ${theme.bodyText}`}
                        >
                          {sub.event_date && (
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar
                                className={`h-3.5 w-3.5 ${theme.accentText}`}
                              />
                              {formatEventDate(sub.event_date)}
                            </span>
                          )}
                          {sub.start_time && (
                            <span className="inline-flex items-center gap-1.5">
                              <Clock
                                className={`h-3.5 w-3.5 ${theme.accentText}`}
                              />
                              {sub.start_time}
                            </span>
                          )}
                        </div>

                        {sub.venue_name && (
                          <p
                            className={`flex items-start gap-1.5 text-xs sm:text-sm ${theme.bodyText}`}
                          >
                            <MapPin
                              className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${theme.accentText}`}
                            />
                            <span>{sub.venue_name}</span>
                          </p>
                        )}
                      </div>

                      {safeMapsUrl && (
                        <div
                          className={`mt-4 border-t pt-3.5 ${theme.innerBorder}`}
                        >
                          <a
                            href={safeMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors ${theme.secondaryBtn}`}
                          >
                            <MapPin className="h-3.5 w-3.5" />
                            Open in Google Maps
                            <ExternalLink className="h-3 w-3 opacity-75" />
                          </a>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Smart Per-Event RSVP Section */}
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
        <footer className="mt-10 flex flex-col items-center gap-2.5 pb-12 text-center">
          <button
            type="button"
            onClick={() => {
              audioRef.current?.stop();
              setOpened(false);
            }}
            className={`inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 px-4 text-xs font-medium opacity-80 transition-opacity hover:opacity-100 ${theme.mutedText}`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Replay Opening
          </button>
          <p
            className={`font-display text-[10px] uppercase tracking-[0.26em] opacity-70 ${theme.mutedText}`}
          >
            Crafted with SaffronPass
          </p>
        </footer>
      </motion.main>

      {/* Floating Glassmorphic Audio Pill */}
      {opened && hasMusic && (
        <MusicPlayerButton
          playing={musicPlaying}
          onToggle={handleToggleMusic}
          isDark={theme.isDark}
          embedded={embedded}
        />
      )}

      {/* Photo Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/88 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Enlarged couple photo"
          >
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              aria-label="Close photo preview"
              className="absolute right-4 top-4 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
            >
              <X className="h-5 w-5" />
            </button>
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative h-[78vh] w-full max-w-3xl overflow-hidden rounded-2xl"
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

  // Embedded mode (Studio / Editor phone preview): render directly inside its host container
  if (embedded) {
    return inviteInnerContent;
  }

  // Full Guest Invite Route (/[slug]/[code]):
  // Mobile: Edge-to-edge full-bleed.
  // Tablet/Desktop (md+): Blurred ambient canvas framing a centered 520px museum-grade vertical keepsake!
  return (
    <div
      className={`relative min-h-[100dvh] w-full overflow-x-hidden ${theme.desktopAmbientBg} md:py-10 md:px-6`}
    >
      {/* Blurred & Tinted Desktop Ambient Canvas (md+) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 hidden md:block"
      >
        {safeCoverUrl ? (
          <>
            <Image
              src={safeCoverUrl}
              alt=""
              fill
              sizes="100vw"
              className="scale-110 object-cover opacity-35 blur-3xl"
            />
            <div className="absolute inset-0 bg-black/58" />
          </>
        ) : (
          <div className={`h-full w-full opacity-80 ${theme.coverBackdropClass}`}>
            <div className="absolute inset-0 bg-black/48 backdrop-blur-3xl" />
          </div>
        )}
      </div>

      {/* Centered Vertical Keepsake Column on md+, Full-Bleed on Mobile */}
      <div
        className={`relative z-10 mx-auto w-full md:max-w-[520px] md:overflow-hidden md:rounded-[34px] md:border md:shadow-[0_32px_90px_rgba(0,0,0,0.52)] ${theme.cardBorder}`}
      >
        {inviteInnerContent}
      </div>
    </div>
  );
}
