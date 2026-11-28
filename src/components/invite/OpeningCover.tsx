"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronRight, Sparkles } from "lucide-react";
import { getInviteTheme, type InviteThemeTokens } from "@/lib/theme-styles";
import {
  extractMonogram,
  formatEventDate,
  getSafeExternalUrl,
} from "@/lib/utils";
import type { OpeningAnimationType, ThemeId } from "@/types/database";

interface OpeningCoverProps {
  animationType: OpeningAnimationType;
  themeId: ThemeId | string;
  hostNames: string;
  eventTitle: string;
  eventDate?: string | null;
  greetingPrefix?: string | null;
  coverImageUrl?: string | null;
  /** Invoked synchronously inside tap handler so iOS Safari / Android Chrome unlock MP3 playback. */
  onTapStart?: () => void;
  onOpened: () => void;
  embedded?: boolean;
  topOffsetClass?: string;
}

export function OpeningCover({
  animationType,
  themeId,
  hostNames,
  eventTitle,
  eventDate,
  greetingPrefix,
  coverImageUrl,
  onTapStart,
  onOpened,
  embedded = false,
  topOffsetClass = "",
}: OpeningCoverProps) {
  const [stage, setStage] = useState<"sealed" | "opening">("sealed");
  const prefersReducedMotion = useReducedMotion();
  const theme = getInviteTheme(themeId);
  const monogram = extractMonogram(hostNames);

  const handleOpen = () => {
    if (stage !== "sealed") return;
    onTapStart?.();
    setStage("opening");
    const delay = prefersReducedMotion
      ? 180
      : animationType === "cinematic_scroll"
        ? 640
        : 1080;
    window.setTimeout(() => {
      onOpened();
    }, delay);
  };

  const containerPosition = embedded
    ? "absolute inset-0 h-full w-full"
    : "fixed inset-0 h-[100dvh] w-full";

  return (
    <motion.div
      className={`${containerPosition} ${topOffsetClass} z-40 flex items-center justify-center overflow-hidden ${theme.coverBackdropClass}`}
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        y: animationType === "cinematic_scroll" ? -28 : 0,
        transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] },
      }}
    >
      {animationType === "palace_doors" ? (
        <PalaceDoorsCover
          theme={theme}
          monogram={monogram}
          hostNames={hostNames}
          eventTitle={eventTitle}
          greetingPrefix={greetingPrefix}
          stage={stage}
          embedded={embedded}
          onOpen={handleOpen}
        />
      ) : animationType === "cinematic_scroll" ? (
        <CinematicScrollCover
          theme={theme}
          monogram={monogram}
          hostNames={hostNames}
          eventTitle={eventTitle}
          eventDate={eventDate}
          greetingPrefix={greetingPrefix}
          coverImageUrl={coverImageUrl}
          stage={stage}
          embedded={embedded}
          onOpen={handleOpen}
        />
      ) : (
        <WaxSealEnvelopeCover
          theme={theme}
          monogram={monogram}
          hostNames={hostNames}
          eventTitle={eventTitle}
          greetingPrefix={greetingPrefix}
          stage={stage}
          embedded={embedded}
          onOpen={handleOpen}
        />
      )}
    </motion.div>
  );
}

interface InnerCoverProps {
  theme: InviteThemeTokens;
  monogram: string;
  hostNames: string;
  eventTitle: string;
  eventDate?: string | null;
  greetingPrefix?: string | null;
  coverImageUrl?: string | null;
  stage: "sealed" | "opening";
  embedded?: boolean;
  onOpen: () => void;
}

function WaxSealEnvelopeCover({
  theme,
  monogram,
  hostNames,
  eventTitle,
  greetingPrefix,
  stage,
  embedded,
  onOpen,
}: InnerCoverProps) {
  const isOpening = stage === "opening";

  return (
    <div className="texture-paper relative flex h-full w-full flex-col items-center justify-center px-5 py-6">
      {/* Soft warm radial aura behind envelope */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-[380px] w-[380px] rounded-full blur-3xl"
        style={{
          background: theme.useLightSeal
            ? "radial-gradient(circle, rgba(184,132,51,0.16) 0%, transparent 72%)"
            : "radial-gradient(circle, rgba(226,189,114,0.22) 0%, transparent 72%)",
        }}
      />

      {/* Micro greeting label */}
      <motion.div
        animate={{ opacity: isOpening ? 0 : 1, y: isOpening ? -10 : 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 mb-5 text-center"
      >
        <p
          className={`text-[10px] font-semibold uppercase tracking-[0.3em] ${
            theme.useLightSeal ? theme.accentText : "text-[#E7C06B]"
          }`}
        >
          {greetingPrefix?.trim() || "You Are Cordially Invited"}
        </p>
      </motion.div>

      {/* 3D Tactile Luxury Envelope */}
      <div
        className={`perspective-1200 relative z-10 w-full ${
          embedded ? "max-w-[320px]" : "max-w-[400px]"
        }`}
      >
        <motion.div
          animate={isOpening ? { y: 20, scale: 1.03 } : { y: 0, scale: 1 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto aspect-[4/3.05] w-full"
        >
          {/* Rising Engraved Inner Invitation Card */}
          <motion.div
            initial={{ y: 0, opacity: 0.94 }}
            animate={isOpening ? { y: -76, opacity: 1 } : { y: 0, opacity: 0.94 }}
            transition={{
              duration: 0.78,
              delay: 0.24,
              ease: [0.22, 1, 0.36, 1],
            }}
            className={`texture-paper absolute inset-x-4 top-3 bottom-4 z-10 flex flex-col items-center justify-center rounded-xl border px-5 text-center shadow-lg ${theme.cardBorder} ${theme.cardBg}`}
          >
            <span
              className={`font-display text-xs tracking-[0.26em] uppercase ${theme.accentText}`}
            >
              {monogram}
            </span>
            <div className={`my-2 h-px w-10 opacity-45 ${theme.dividerBg}`} />
            <p
              className={`font-editorial text-xl font-semibold sm:text-2xl ${theme.headingText}`}
            >
              {hostNames}
            </p>
            <p
              className={`mt-1 line-clamp-1 text-[10px] uppercase tracking-[0.22em] ${theme.mutedText}`}
            >
              {eventTitle}
            </p>
          </motion.div>

          {/* Envelope Pocket Body with Paper Grain & Crease Shadows */}
          <div
            className={`texture-paper relative z-20 h-full w-full overflow-hidden rounded-2xl border shadow-[0_24px_54px_rgba(0,0,0,0.34)] ${theme.envelopeBody}`}
          >
            <svg
              viewBox="0 0 400 305"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 h-full w-full"
              aria-hidden="true"
            >
              <polygon points="0,0 200,162 0,305" fill={theme.envelopeSideLeft} />
              <polygon points="400,0 200,162 400,305" fill={theme.envelopeSideRight} />
              <polygon
                points="0,305 200,146 400,305"
                fill={theme.envelopeFlapBottom}
                stroke={theme.envelopeStroke}
                strokeWidth="1.1"
              />
              {/* Delicate inset couture gold frame */}
              <rect
                x="11"
                y="11"
                width="378"
                height="283"
                rx="9"
                fill="none"
                stroke={theme.envelopeStroke}
                strokeWidth="0.9"
                opacity="0.72"
              />
            </svg>

            <div className="absolute inset-x-5 bottom-5 z-20 text-center">
              <h1
                className={`font-editorial font-semibold tracking-[0.02em] ${
                  embedded ? "text-xl" : "text-2xl sm:text-3xl"
                } ${theme.envelopeNameColor}`}
              >
                {hostNames}
              </h1>
              <p
                className={`mt-1 line-clamp-1 text-[10px] uppercase tracking-[0.24em] ${theme.envelopeSubColor}`}
              >
                {eventTitle}
              </p>
            </div>
          </div>

          {/* 3D Hinged Top Flap */}
          <motion.div
            style={{ transformOrigin: "top center" }}
            initial={{ rotateX: 0 }}
            animate={isOpening ? { rotateX: -168 } : { rotateX: 0 }}
            transition={{ duration: 0.74, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute inset-x-0 top-0 z-30 h-[56%]"
          >
            <svg
              viewBox="0 0 400 172"
              preserveAspectRatio="none"
              className="h-full w-full drop-shadow-[0_10px_14px_rgba(0,0,0,0.22)]"
              aria-hidden="true"
            >
              <polygon
                points="0,0 400,0 200,166"
                fill={theme.envelopeFlapTop}
                stroke={theme.envelopeStroke}
                strokeWidth="1.2"
              />
              <polyline
                points="16,10 200,155 384,10"
                fill="none"
                stroke={theme.envelopeStroke}
                strokeWidth="0.8"
                opacity="0.65"
              />
            </svg>
          </motion.div>

          {/* Multi-Layered Embossed Gold Wax Seal with Couple Monogram */}
          <AnimatePresence>
            {!isOpening && (
              <motion.button
                type="button"
                onClick={onOpen}
                aria-label="Tap wax seal to open invitation"
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{
                  scale: 1.24,
                  opacity: 0,
                  filter: "brightness(1.45)",
                  transition: { duration: 0.32 },
                }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                className="group absolute left-1/2 top-[51%] z-40 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E7C06B] focus-visible:ring-offset-4"
              >
                {/* Breathing metallic halo */}
                <motion.span
                  aria-hidden="true"
                  animate={{
                    scale: [1, 1.18, 1],
                    opacity: [0.35, 0.72, 0.35],
                  }}
                  transition={{
                    duration: 2.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="pointer-events-none absolute -inset-3 rounded-full bg-[#E2BD72]/35 blur-md"
                />

                {/* Outer organic wax disc */}
                <span
                  className={`relative flex items-center justify-center rounded-full ${
                    embedded
                      ? "h-[82px] w-[82px]"
                      : "h-[94px] w-[94px] sm:h-[104px] sm:w-[104px]"
                  } ${
                    theme.useLightSeal
                      ? "wax-seal-surface-ivory"
                      : "wax-seal-surface"
                  }`}
                >
                  {/* Raised stamped inner wax rim */}
                  <span
                    className={`flex flex-col items-center justify-center rounded-full border border-[#5B3507]/38 bg-[#C88A2E]/18 shadow-inner ${
                      embedded
                        ? "h-[64px] w-[64px]"
                        : "h-[74px] w-[74px] sm:h-[82px] sm:w-[82px]"
                    }`}
                  >
                    <span
                      className={`font-display font-semibold tracking-[0.06em] text-[#3F2204] ${
                        monogram.length > 3
                          ? embedded
                            ? "text-[13px]"
                            : "text-[15px] sm:text-base"
                          : embedded
                            ? "text-base"
                            : "text-lg sm:text-xl"
                      }`}
                    >
                      {monogram}
                    </span>
                  </span>
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Micro-caption below envelope */}
      <motion.div
        animate={{ opacity: isOpening ? 0 : 1, y: isOpening ? 10 : 0 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 mt-7 text-center"
      >
        <button
          type="button"
          onClick={onOpen}
          className={`min-h-[44px] cursor-pointer px-4 text-[10px] font-semibold uppercase tracking-[0.28em] transition-opacity hover:opacity-100 ${
            theme.useLightSeal ? theme.mutedText : "text-[#F3E4C6]/85"
          }`}
        >
          Tap Seal to Open
        </button>
      </motion.div>
    </div>
  );
}

function PalaceDoorsCover({
  theme,
  monogram,
  hostNames,
  eventTitle,
  greetingPrefix,
  stage,
  embedded,
  onOpen,
}: InnerCoverProps) {
  const isOpening = stage === "opening";

  return (
    <div className="perspective-1200 relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* Soft warm golden bloom expanding behind parting doors */}
      <motion.div
        initial={{ opacity: 0.15, scale: 0.85 }}
        animate={
          isOpening
            ? { opacity: 1, scale: 1.2 }
            : { opacity: 0.15, scale: 0.85 }
        }
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute inset-0"
        style={{
          background: theme.isDark
            ? "radial-gradient(circle at center, rgba(226, 189, 114, 0.45) 0%, rgba(19, 9, 22, 0.96) 66%)"
            : "radial-gradient(circle at center, rgba(248, 228, 178, 0.9) 0%, rgba(251, 247, 240, 0.98) 68%)",
        }}
      />

      {/* Symmetrical Architectural Mughal/Jharokha Palace Gates */}
      <div className="relative flex h-full w-full max-w-[640px] overflow-hidden shadow-2xl">
        {/* LEFT ARCHITECTURAL DOOR */}
        <motion.div
          style={{ transformOrigin: "left center" }}
          initial={{ x: "0%", rotateY: 0 }}
          animate={
            isOpening ? { x: "-95%", rotateY: 42 } : { x: "0%", rotateY: 0 }
          }
          transition={{ duration: 0.98, ease: [0.22, 1, 0.36, 1] }}
          className="texture-paper relative h-full w-1/2 border-r border-[#C88A2E]/40"
          aria-hidden="true"
        >
          <div
            className="relative flex h-full w-full items-center justify-end pr-3 sm:pr-6"
            style={{ backgroundColor: theme.doorFill }}
          >
            <svg
              viewBox="0 0 220 560"
              preserveAspectRatio="none"
              className="absolute inset-2.5 h-[calc(100%-20px)] w-[calc(100%-20px)]"
            >
              {/* Outer hairline border */}
              <rect
                x="4"
                y="4"
                width="212"
                height="552"
                rx="4"
                fill={theme.doorInner}
                stroke={theme.doorFiligree}
                strokeOpacity="0.4"
                strokeWidth="1.2"
              />
              {/* Fine Jharokha pointed Mughal archway half */}
              <path
                d="M22 532 V168 C22 128 52 104 82 88 C118 68 156 54 202 28 V532 Z"
                fill="none"
                stroke={theme.doorFiligree}
                strokeOpacity="0.6"
                strokeWidth="1.25"
              />
              <path
                d="M36 516 V178 C36 144 62 122 90 107 C122 90 156 76 190 54 V516 Z"
                fill="none"
                stroke={theme.doorFiligree}
                strokeOpacity="0.32"
                strokeWidth="0.9"
              />
              {/* Delicate geometric filigree diamond motifs */}
              <path
                d="M114 212 L138 242 L114 272 L90 242 Z M114 316 L138 346 L114 376 L90 346 Z"
                fill="none"
                stroke={theme.doorFiligree}
                strokeOpacity="0.34"
                strokeWidth="0.9"
              />
              <line
                x1="22"
                y1="440"
                x2="202"
                y2="440"
                stroke={theme.doorFiligree}
                strokeOpacity="0.28"
                strokeWidth="0.9"
              />
            </svg>

            {/* Slender antique gold ring handle */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="h-3 w-3 rounded-full border border-[#E7C06B] bg-[#C88A2E]" />
              <div className="-mt-1 h-7 w-7 rounded-full border-[2.5px] border-[#D9A441] shadow-sm sm:h-8 sm:w-8" />
            </div>
          </div>
        </motion.div>

        {/* RIGHT ARCHITECTURAL DOOR */}
        <motion.div
          style={{ transformOrigin: "right center" }}
          initial={{ x: "0%", rotateY: 0 }}
          animate={
            isOpening ? { x: "95%", rotateY: -42 } : { x: "0%", rotateY: 0 }
          }
          transition={{ duration: 0.98, ease: [0.22, 1, 0.36, 1] }}
          className="texture-paper relative h-full w-1/2 border-l border-[#C88A2E]/40"
          aria-hidden="true"
        >
          <div
            className="relative flex h-full w-full items-center justify-start pl-3 sm:pl-6"
            style={{ backgroundColor: theme.doorFill }}
          >
            <svg
              viewBox="0 0 220 560"
              preserveAspectRatio="none"
              className="absolute inset-2.5 h-[calc(100%-20px)] w-[calc(100%-20px)]"
            >
              <rect
                x="4"
                y="4"
                width="212"
                height="552"
                rx="4"
                fill={theme.doorInner}
                stroke={theme.doorFiligree}
                strokeOpacity="0.4"
                strokeWidth="1.2"
              />
              <path
                d="M198 532 V168 C198 128 168 104 138 88 C102 68 64 54 18 28 V532 Z"
                fill="none"
                stroke={theme.doorFiligree}
                strokeOpacity="0.6"
                strokeWidth="1.25"
              />
              <path
                d="M184 516 V178 C184 144 158 122 130 107 C98 90 64 76 30 54 V516 Z"
                fill="none"
                stroke={theme.doorFiligree}
                strokeOpacity="0.32"
                strokeWidth="0.9"
              />
              <path
                d="M106 212 L130 242 L106 272 L82 242 Z M106 316 L130 346 L106 376 L82 346 Z"
                fill="none"
                stroke={theme.doorFiligree}
                strokeOpacity="0.34"
                strokeWidth="0.9"
              />
              <line
                x1="18"
                y1="440"
                x2="198"
                y2="440"
                stroke={theme.doorFiligree}
                strokeOpacity="0.28"
                strokeWidth="0.9"
              />
            </svg>

            <div className="relative z-10 flex flex-col items-center">
              <div className="h-3 w-3 rounded-full border border-[#E7C06B] bg-[#C88A2E]" />
              <div className="-mt-1 h-7 w-7 rounded-full border-[2.5px] border-[#D9A441] shadow-sm sm:h-8 sm:w-8" />
            </div>
          </div>
        </motion.div>

        {/* Centered Golden Crest Medallion Overlay */}
        <AnimatePresence>
          {!isOpening && (
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.08, transition: { duration: 0.3 } }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center px-5 text-center"
            >
              <button
                type="button"
                onClick={onOpen}
                aria-label="Tap royal palace doors to open invitation"
                className={`group cursor-pointer rounded-[28px] border shadow-2xl backdrop-blur-md transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E7C06B] ${
                  embedded ? "px-6 py-7" : "px-8 py-9 sm:px-11 sm:py-10"
                } ${theme.doorPlaque}`}
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#C88A2E]/60 bg-[#C88A2E]/12">
                  <span className="font-display text-sm font-semibold tracking-[0.08em] text-[#E2BD72]">
                    {monogram}
                  </span>
                </div>

                <p
                  className={`mt-4 text-[10px] font-semibold uppercase tracking-[0.28em] ${
                    theme.useLightSeal ? theme.accentText : "text-[#E7C06B]"
                  }`}
                >
                  {greetingPrefix?.trim() || "Royal Invitation"}
                </p>

                <h1
                  className={`mt-2.5 font-editorial font-semibold tracking-[0.01em] ${
                    embedded ? "text-2xl" : "text-3xl sm:text-4xl"
                  }`}
                >
                  {hostNames}
                </h1>
                <p className="mt-1 text-[11px] uppercase tracking-[0.22em] opacity-80">
                  {eventTitle}
                </p>

                <div className="mx-auto mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#D7A955]/60 bg-[#C88A2E] px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#221204] shadow-md transition-colors group-hover:bg-[#DDB05A]">
                  <span>Enter Palace</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CinematicScrollCover({
  theme,
  monogram,
  hostNames,
  eventTitle,
  eventDate,
  greetingPrefix,
  coverImageUrl,
  stage,
  embedded,
  onOpen,
}: InnerCoverProps) {
  const isOpening = stage === "opening";
  const safeCover = getSafeExternalUrl(coverImageUrl);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#14070D]">
      {/* Full-bleed magazine cover photo OR bespoke atmospheric crest canvas */}
      {safeCover ? (
        <motion.div
          initial={{ scale: 1.06 }}
          animate={isOpening ? { scale: 1.14, opacity: 0.15 } : { scale: 1.0 }}
          transition={{ duration: isOpening ? 0.7 : 9, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src={safeCover}
            alt={`${hostNames} celebration cover`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#12060B]/94 via-[#17080F]/48 to-[#12060B]/70" />
        </motion.div>
      ) : (
        <div className={`texture-paper absolute inset-0 ${theme.coverBackdropClass}`}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-black/35" />
        </div>
      )}

      {/* Subtle architectural magazine border */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute rounded-3xl border border-[#E7C06B]/28 ${
          embedded ? "inset-3" : "inset-4 sm:inset-8"
        }`}
      />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={isOpening ? { opacity: 0, y: -26 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-20 mx-auto flex max-w-lg flex-col items-center px-6 text-center text-[#FCF8F1]"
      >
        {/* Bespoke Cinzel monogram crest when no cover photo is uploaded */}
        {!safeCover && (
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#E7C06B]/50 bg-[#E7C06B]/10 backdrop-blur-xs">
            <span className="font-display text-base font-semibold tracking-[0.12em] text-[#F2D593]">
              {monogram}
            </span>
          </div>
        )}

        <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#E7C06B]">
          <Sparkles className="h-3 w-3" />
          <span>{greetingPrefix?.trim() || "You Are Warmly Invited"}</span>
        </p>

        <h1
          className={`mt-4 font-editorial font-semibold leading-[1.04] tracking-[0.01em] text-[#FFFDF7] ${
            embedded
              ? "text-4xl"
              : "text-[clamp(2.5rem,7vw,4.2rem)]"
          }`}
        >
          {hostNames}
        </h1>

        <p
          className={`mt-2.5 font-editorial italic text-[#F3E4C6]/90 ${
            embedded ? "text-lg" : "text-xl sm:text-2xl"
          }`}
        >
          {eventTitle}
        </p>

        {eventDate && (
          <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#E7C06B]">
            {formatEventDate(eventDate)}
          </p>
        )}

        <div className="mx-auto my-6 flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-[#E7C06B]/45" />
          <span className="h-1.5 w-1.5 rotate-45 bg-[#E7C06B]" />
          <span className="h-px w-10 bg-[#E7C06B]/45" />
        </div>

        <button
          type="button"
          onClick={onOpen}
          className="group inline-flex min-h-[48px] cursor-pointer items-center gap-2 rounded-full border border-[#E7C06B]/70 bg-[#C88A2E] px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#221204] shadow-[0_14px_34px_rgba(0,0,0,0.45)] transition-all hover:scale-[1.03] hover:bg-[#DDB05A] active:scale-[0.98]"
        >
          <span>Enter Celebration</span>
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </motion.div>
    </div>
  );
}
