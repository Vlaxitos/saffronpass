"use client";

import React, { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { OpeningAnimationType, ThemeId } from "@/types/database";

interface OpeningCoverProps {
  animationType: OpeningAnimationType;
  themeId: ThemeId | string;
  hostNames: string;
  eventTitle: string;
  greetingPrefix?: string | null;
  onOpened: () => void;
  inModal?: boolean;
  topOffsetClass?: string;
}

export function OpeningCover({
  animationType,
  themeId,
  hostNames,
  eventTitle,
  greetingPrefix,
  onOpened,
  inModal = false,
  topOffsetClass = "",
}: OpeningCoverProps) {
  const [stage, setStage] = useState<"sealed" | "opening">("sealed");
  const prefersReducedMotion = useReducedMotion();

  const isMinimal = themeId === "minimal_ivory";

  const handleOpen = () => {
    if (stage !== "sealed") return;
    setStage("opening");
    const delay = prefersReducedMotion ? 220 : 1050;
    window.setTimeout(() => {
      onOpened();
    }, delay);
  };

  const containerPosition = inModal ? "absolute inset-0" : "fixed inset-0";

  return (
    <motion.div
      className={`${containerPosition} ${topOffsetClass} z-40 flex items-center justify-center overflow-hidden ${
        isMinimal ? "bg-minimal-pearl" : "bg-royal-velvet"
      }`}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
    >
      {animationType === "palace_doors" ? (
        <PalaceDoorsCover
          isMinimal={isMinimal}
          hostNames={hostNames}
          eventTitle={eventTitle}
          greetingPrefix={greetingPrefix}
          stage={stage}
          onOpen={handleOpen}
        />
      ) : (
        <WaxSealEnvelopeCover
          isMinimal={isMinimal}
          hostNames={hostNames}
          eventTitle={eventTitle}
          greetingPrefix={greetingPrefix}
          stage={stage}
          onOpen={handleOpen}
        />
      )}
    </motion.div>
  );
}

interface InnerCoverProps {
  isMinimal: boolean;
  hostNames: string;
  eventTitle: string;
  greetingPrefix?: string | null;
  stage: "sealed" | "opening";
  onOpen: () => void;
}

function WaxSealEnvelopeCover({
  isMinimal,
  hostNames,
  eventTitle,
  greetingPrefix,
  stage,
  onOpen,
}: InnerCoverProps) {
  const isOpening = stage === "opening";

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center px-5 py-10">
      {/* Subtle ambient royal glow behind envelope */}
      <div
        className="pointer-events-none absolute h-[420px] w-[420px] rounded-full blur-3xl"
        style={{
          background: isMinimal
            ? "radial-gradient(circle, rgba(200,138,46,0.16) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(224,173,79,0.22) 0%, transparent 70%)",
        }}
      />

      {/* Greeting prefix above envelope */}
      <motion.div
        animate={{ opacity: isOpening ? 0 : 1, y: isOpening ? -14 : 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 mb-6 text-center"
      >
        <p
          className={`text-xs font-medium uppercase tracking-[0.28em] ${
            isMinimal ? "text-[#8B6A37]" : "text-[#E7C06B]"
          }`}
        >
          {greetingPrefix?.trim() || "You Are Cordially Invited"}
        </p>
      </motion.div>

      {/* Interactive 3D Envelope */}
      <div className="perspective-1200 relative z-10 w-full max-w-[420px]">
        <motion.div
          animate={isOpening ? { y: 18, scale: 1.03 } : { y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto aspect-[4/3.1] w-full"
        >
          {/* Rising Inner Stationery Card */}
          <motion.div
            initial={{ y: 0, opacity: 0.92 }}
            animate={isOpening ? { y: -72, opacity: 1 } : { y: 0, opacity: 0.92 }}
            transition={{ duration: 0.75, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-4 top-3 bottom-4 z-10 flex flex-col items-center justify-center rounded-xl border border-[#C88A2E]/40 bg-[#FCF8F1] px-6 text-center shadow-lg"
          >
            <div className="h-px w-12 bg-[#C88A2E]/60" />
            <p className="mt-3 font-serif text-2xl font-semibold text-[#4A101C] sm:text-3xl">
              {hostNames}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#7A6258]">
              {eventTitle}
            </p>
          </motion.div>

          {/* Envelope Back & Pocket Body */}
          <div
            className={`relative z-20 h-full w-full overflow-hidden rounded-2xl border shadow-2xl ${
              isMinimal
                ? "border-[#C88A2E]/35 bg-[#F5EDE0]"
                : "border-[#E7C06B]/30 bg-[#5B1422]"
            }`}
          >
            {/* Subtle textured paper sheen */}
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                background: isMinimal
                  ? "linear-gradient(135deg, rgba(255,255,255,0.7) 0%, transparent 50%, rgba(188,138,56,0.12) 100%)"
                  : "linear-gradient(135deg, rgba(231,192,107,0.18) 0%, transparent 48%, rgba(28,4,10,0.45) 100%)",
              }}
            />

            {/* Envelope bottom fold diagonal lines */}
            <svg
              viewBox="0 0 400 310"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 h-full w-full"
              aria-hidden="true"
            >
              {/* Left & right side flaps */}
              <polygon
                points="0,0 200,165 0,310"
                fill={isMinimal ? "rgba(235,223,204,0.52)" : "rgba(70,13,24,0.55)"}
              />
              <polygon
                points="400,0 200,165 400,310"
                fill={isMinimal ? "rgba(230,217,196,0.62)" : "rgba(62,11,21,0.68)"}
              />
              {/* Bottom triangle flap */}
              <polygon
                points="0,310 200,148 400,310"
                fill={isMinimal ? "#EFE5D5" : "#4E101D"}
                stroke={isMinimal ? "rgba(188,138,56,0.38)" : "rgba(231,192,107,0.32)"}
                strokeWidth="1.2"
              />
              {/* Subtle gold border frame */}
              <rect
                x="10"
                y="10"
                width="380"
                height="290"
                rx="10"
                fill="none"
                stroke={isMinimal ? "rgba(188,138,56,0.32)" : "rgba(231,192,107,0.28)"}
                strokeWidth="1"
              />
            </svg>

            {/* Couple / Event Name embossed on lower pocket */}
            <div className="absolute inset-x-6 bottom-6 z-20 text-center">
              <h1
                className={`font-serif text-2xl font-semibold tracking-[0.02em] sm:text-3xl ${
                  isMinimal ? "text-[#3D161E]" : "text-[#FCF8F1]"
                }`}
              >
                {hostNames}
              </h1>
              <p
                className={`mt-1 line-clamp-1 text-[11px] uppercase tracking-[0.22em] ${
                  isMinimal ? "text-[#8A6D46]" : "text-[#E7C06B]/85"
                }`}
              >
                {eventTitle}
              </p>
            </div>
          </div>

          {/* Animated Top Flap (hinged at top) */}
          <motion.div
            style={{ transformOrigin: "top center" }}
            initial={{ rotateX: 0 }}
            animate={isOpening ? { rotateX: -168 } : { rotateX: 0 }}
            transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute inset-x-0 top-0 z-30 h-[56%]"
          >
            <svg
              viewBox="0 0 400 175"
              preserveAspectRatio="none"
              className="h-full w-full drop-shadow-md"
              aria-hidden="true"
            >
              <polygon
                points="0,0 400,0 200,168"
                fill={isMinimal ? "#FAF5EC" : "#671727"}
                stroke={isMinimal ? "rgba(188,138,56,0.45)" : "rgba(231,192,107,0.42)"}
                strokeWidth="1.4"
              />
              <polyline
                points="14,10 200,158 386,10"
                fill="none"
                stroke={isMinimal ? "rgba(188,138,56,0.28)" : "rgba(231,192,107,0.28)"}
                strokeWidth="0.9"
              />
            </svg>
          </motion.div>

          {/* Center Tactile Gold Wax Seal Button */}
          <AnimatePresence>
            {!isOpening && (
              <motion.button
                type="button"
                onClick={onOpen}
                aria-label="Tap wax seal to open invitation"
                initial={{ scale: 0.94, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.18, opacity: 0, transition: { duration: 0.28 } }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                className="group absolute left-1/2 top-[51%] z-40 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E7C06B] focus-visible:ring-offset-4"
              >
                {/* Luminous breathing halo */}
                <motion.span
                  aria-hidden="true"
                  animate={{ scale: [1, 1.16, 1], opacity: [0.45, 0.75, 0.45] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                  className="pointer-events-none absolute -inset-3 rounded-full bg-[#E0AD4F]/30 blur-md"
                />
                {/* Wax Seal Disc */}
                <span
                  className={`relative flex h-24 w-24 items-center justify-center rounded-full sm:h-[104px] sm:w-[104px] ${
                    isMinimal ? "wax-seal-surface-ivory" : "wax-seal-surface"
                  }`}
                >
                  {/* Embossed inner wax rim */}
                  <span className="flex h-[74px] w-[74px] flex-col items-center justify-center rounded-full border border-[#5B3507]/35 bg-[#C98E2E]/20 sm:h-[82px] sm:w-[82px]">
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 36 36"
                      fill="none"
                      aria-hidden="true"
                      className="text-[#4F2D06]"
                    >
                      <path
                        d="M18 6.5C20.2 10.6 23.6 13.8 27 18C23.6 22.2 20.2 25.4 18 29.5C15.8 25.4 12.4 22.2 9 18C12.4 13.8 15.8 10.6 18 6.5Z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinejoin="round"
                      />
                      <circle cx="18" cy="18" r="2.6" fill="currentColor" />
                    </svg>
                    <span className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.2em] text-[#4A2905]">
                      Open
                    </span>
                  </span>
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Tap prompt below envelope */}
      <motion.div
        animate={{ opacity: isOpening ? 0 : 1, y: isOpening ? 12 : 0 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 mt-8 text-center"
      >
        <button
          type="button"
          onClick={onOpen}
          className={`cursor-pointer text-xs font-medium uppercase tracking-[0.24em] transition-opacity hover:opacity-100 ${
            isMinimal ? "text-[#6D5331]/80" : "text-[#F4E4C1]/85"
          }`}
        >
          Tap the Wax Seal to Unfold
        </button>
      </motion.div>
    </div>
  );
}

function PalaceDoorsCover({
  isMinimal,
  hostNames,
  eventTitle,
  greetingPrefix,
  stage,
  onOpen,
}: InnerCoverProps) {
  const isOpening = stage === "opening";

  const doorFill = isMinimal ? "#F5EDE0" : "#54111F";
  const doorInner = isMinimal ? "#EFE5D4" : "#450D19";
  const filigreeStroke = isMinimal ? "#B58942" : "#E4BE6A";

  return (
    <div className="perspective-1200 relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* Golden sunlit glow revealed behind the parting palace doors */}
      <motion.div
        initial={{ opacity: 0.2 }}
        animate={{ opacity: isOpening ? 1 : 0.2 }}
        transition={{ duration: 0.7 }}
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, rgba(246, 224, 168, 0.85) 0%, rgba(252, 248, 241, 0.96) 65%)",
        }}
      />

      {/* Symmetrical Left & Right Carved Palace Doors */}
      <div className="relative flex h-full w-full max-w-[680px] overflow-hidden shadow-2xl">
        {/* LEFT DOOR */}
        <motion.div
          style={{ transformOrigin: "left center" }}
          initial={{ x: "0%", rotateY: 0 }}
          animate={isOpening ? { x: "-94%", rotateY: 38 } : { x: "0%", rotateY: 0 }}
          transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-full w-1/2 border-r border-[#C88A2E]/45"
          aria-hidden="true"
        >
          <div
            className="relative flex h-full w-full items-center justify-end pr-4 sm:pr-7"
            style={{ backgroundColor: doorFill }}
          >
            {/* Carved Jharokha Arch Panel */}
            <svg
              viewBox="0 0 220 540"
              preserveAspectRatio="none"
              className="absolute inset-3 h-[calc(100%-24px)] w-[calc(100%-24px)]"
            >
              <rect
                x="4"
                y="4"
                width="212"
                height="532"
                rx="6"
                fill={doorInner}
                stroke={filigreeStroke}
                strokeOpacity="0.45"
                strokeWidth="1.5"
              />
              {/* Scalloped Mughal Arch Half */}
              <path
                d="M24 510 V140 C24 85 95 58 195 36 V510 Z"
                fill="none"
                stroke={filigreeStroke}
                strokeOpacity="0.55"
                strokeWidth="1.3"
              />
              <path
                d="M42 490 V155 C42 110 102 82 180 62 V490 Z"
                fill="none"
                stroke={filigreeStroke}
                strokeOpacity="0.28"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              {/* Lattice Rosette */}
              <circle
                cx="116"
                cy="270"
                r="32"
                fill="none"
                stroke={filigreeStroke}
                strokeOpacity="0.38"
                strokeWidth="1.1"
              />
            </svg>
            {/* Brass Door Pull Ring */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="h-3.5 w-3.5 rounded-full border border-[#E7C06B] bg-[#C88A2E]" />
              <div className="-mt-1 h-9 w-9 rounded-full border-[3px] border-[#D9A441] shadow-md" />
            </div>
          </div>
        </motion.div>

        {/* RIGHT DOOR */}
        <motion.div
          style={{ transformOrigin: "right center" }}
          initial={{ x: "0%", rotateY: 0 }}
          animate={isOpening ? { x: "94%", rotateY: -38 } : { x: "0%", rotateY: 0 }}
          transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-full w-1/2 border-l border-[#C88A2E]/45"
          aria-hidden="true"
        >
          <div
            className="relative flex h-full w-full items-center justify-start pl-4 sm:pl-7"
            style={{ backgroundColor: doorFill }}
          >
            <svg
              viewBox="0 0 220 540"
              preserveAspectRatio="none"
              className="absolute inset-3 h-[calc(100%-24px)] w-[calc(100%-24px)]"
            >
              <rect
                x="4"
                y="4"
                width="212"
                height="532"
                rx="6"
                fill={doorInner}
                stroke={filigreeStroke}
                strokeOpacity="0.45"
                strokeWidth="1.5"
              />
              <path
                d="M196 510 V140 C196 85 125 58 25 36 V510 Z"
                fill="none"
                stroke={filigreeStroke}
                strokeOpacity="0.55"
                strokeWidth="1.3"
              />
              <path
                d="M178 490 V155 C178 110 118 82 40 62 V490 Z"
                fill="none"
                stroke={filigreeStroke}
                strokeOpacity="0.28"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <circle
                cx="104"
                cy="270"
                r="32"
                fill="none"
                stroke={filigreeStroke}
                strokeOpacity="0.38"
                strokeWidth="1.1"
              />
            </svg>
            {/* Brass Door Pull Ring */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="h-3.5 w-3.5 rounded-full border border-[#E7C06B] bg-[#C88A2E]" />
              <div className="-mt-1 h-9 w-9 rounded-full border-[3px] border-[#D9A441] shadow-md" />
            </div>
          </div>
        </motion.div>

        {/* Center Royal Crest Overlay Button */}
        <AnimatePresence>
          {!isOpening && (
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.08, transition: { duration: 0.3 } }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6 text-center"
            >
              <button
                type="button"
                onClick={onOpen}
                aria-label="Tap royal palace doors to enter invitation"
                className={`group cursor-pointer rounded-3xl border px-8 py-9 shadow-2xl backdrop-blur-sm transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E7C06B] sm:px-12 sm:py-11 ${
                  isMinimal
                    ? "border-[#C88A2E]/45 bg-[#FCF8F1]/95 text-[#3D161E]"
                    : "border-[#E7C06B]/45 bg-[#3F0B16]/90 text-[#FCF8F1]"
                }`}
              >
                <p
                  className={`text-[11px] font-medium uppercase tracking-[0.28em] ${
                    isMinimal ? "text-[#8C6A36]" : "text-[#E7C06B]"
                  }`}
                >
                  {greetingPrefix?.trim() || "Royal Invitation"}
                </p>
                <h1 className="mt-3 font-serif text-3xl font-semibold tracking-[0.02em] sm:text-4xl">
                  {hostNames}
                </h1>
                <p
                  className={`mt-1.5 text-xs uppercase tracking-[0.22em] ${
                    isMinimal ? "text-[#7A6258]" : "text-[#F4E4C1]/80"
                  }`}
                >
                  {eventTitle}
                </p>

                <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-[#C88A2E]/60 bg-[#C88A2E] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#2A1406] shadow-md transition-colors group-hover:bg-[#E0AD4F]">
                  Tap to Enter Palace
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
