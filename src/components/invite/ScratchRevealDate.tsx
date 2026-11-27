"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { getInviteTheme } from "@/lib/theme-styles";
import { formatEventDate } from "@/lib/utils";

interface ScratchRevealDateProps {
  eventDate: string;
  themeId?: string;
}

const SPARKLE_BURST = [
  { x: -72, y: -44, size: 7, delay: 0 },
  { x: -42, y: -62, size: 5, delay: 0.04 },
  { x: 0, y: -74, size: 8, delay: 0.02 },
  { x: 46, y: -60, size: 6, delay: 0.06 },
  { x: 76, y: -40, size: 7, delay: 0.03 },
  { x: -82, y: 10, size: 6, delay: 0.05 },
  { x: 84, y: 8, size: 6, delay: 0.02 },
  { x: -58, y: 54, size: 7, delay: 0.04 },
  { x: 0, y: 68, size: 6, delay: 0.06 },
  { x: 60, y: 52, size: 7, delay: 0.01 },
];

/**
 * Interactive Gold-Foil Scratch-to-Reveal Date card built with HTML5 Canvas.
 * Uses `touch-action: none` so mobile guests can rub off the gold foil smoothly
 * without triggering vertical scroll. Reveals cleanly with a gold sparkle burst
 * once 45% of the foil is scratched away.
 */
export function ScratchRevealDate({
  eventDate,
  themeId,
}: ScratchRevealDateProps) {
  const theme = getInviteTheme(themeId);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const strokeCountRef = useRef(0);
  const [revealed, setRevealed] = useState(false);

  const formattedDate = formatEventDate(eventDate);

  useEffect(() => {
    if (revealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = 320;
    const h = 112;
    canvas.width = w;
    canvas.height = h;

    // Paint brushed luxury gold foil texture
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#D49B38");
    grad.addColorStop(0.28, "#F5DA95");
    grad.addColorStop(0.55, "#C78B28");
    grad.addColorStop(0.82, "#F2D384");
    grad.addColorStop(1, "#A87018");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle metallic sheen bands & micro-glitter grain
    ctx.fillStyle = "rgba(255, 250, 232, 0.18)";
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 64 - 20, 0);
      ctx.lineTo(i * 64 + 14, 0);
      ctx.lineTo(i * 64 - 24, h);
      ctx.lineTo(i * 64 - 58, h);
      ctx.closePath();
      ctx.fill();
    }

    // Embossed gold-foil prompt text
    ctx.fillStyle = "rgba(74, 41, 5, 0.78)";
    ctx.font = "600 12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("RUB GOLD FOIL TO REVEAL DATE", w / 2, h / 2);
  }, [revealed]);

  const computeClearedRatio = () => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;
    const { width, height } = canvas;
    const pixels = ctx.getImageData(0, 0, width, height).data;
    let cleared = 0;
    // Sample every 16th pixel for instant mobile performance
    let sampled = 0;
    for (let i = 3; i < pixels.length; i += 64) {
      sampled += 1;
      if (pixels[i] < 40) cleared += 1;
    }
    return sampled > 0 ? cleared / sampled : 0;
  };

  const scratchAt = (clientX: number, clientY: number) => {
    if (revealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    strokeCountRef.current += 1;
    if (strokeCountRef.current % 6 === 0) {
      if (computeClearedRatio() >= 0.45) {
        setRevealed(true);
      }
    }
  };

  return (
    <div className="relative mx-auto mt-5 flex max-w-xs flex-col items-center">
      <p
        className={`mb-2 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] ${theme.accentText}`}
      >
        <Sparkles className="h-3 w-3" />
        <span>{revealed ? "Save the Date" : "Scratch to Reveal the Date"}</span>
      </p>

      <div
        className={`relative h-[104px] w-full overflow-hidden rounded-2xl border-2 shadow-inner ${theme.cardBorder} ${theme.countdownCell}`}
      >
        {/* Revealed Date Layer */}
        <div className="flex h-full w-full flex-col items-center justify-center px-4 text-center">
          <span
            className={`text-[10px] font-semibold uppercase tracking-[0.22em] ${theme.accentText}`}
          >
            Save the Date
          </span>
          <span
            className={`mt-1 font-serif text-xl font-semibold sm:text-2xl ${theme.headingText}`}
          >
            {formattedDate}
          </span>
        </div>

        {/* Gold-Foil Scratchable Canvas */}
        {!revealed && (
          <canvas
            ref={canvasRef}
            onPointerDown={(e) => {
              isDrawingRef.current = true;
              e.currentTarget.setPointerCapture(e.pointerId);
              scratchAt(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => {
              if (!isDrawingRef.current) return;
              scratchAt(e.clientX, e.clientY);
            }}
            onPointerUp={() => {
              isDrawingRef.current = false;
              if (computeClearedRatio() >= 0.45) {
                setRevealed(true);
              }
            }}
            onPointerCancel={() => {
              isDrawingRef.current = false;
            }}
            style={{ touchAction: "none" }}
            aria-label="Scratch off gold foil to reveal the celebration date"
            className="absolute inset-0 h-full w-full cursor-pointer select-none"
          />
        )}
      </div>

      {/* Sparkle / Confetti Burst when 45% scratched */}
      {revealed && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 z-20"
        >
          {SPARKLE_BURST.map((sp, idx) => (
            <motion.span
              key={idx}
              initial={{ x: 0, y: 0, scale: 0.4, opacity: 1 }}
              animate={{
                x: sp.x,
                y: sp.y,
                scale: [0.6, 1.25, 0],
                opacity: [1, 1, 0],
                rotate: 135,
              }}
              transition={{
                duration: 0.9,
                delay: sp.delay,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                width: sp.size,
                height: sp.size,
                backgroundColor: idx % 2 === 0 ? "#E7C06B" : "#D97706",
              }}
              className="absolute block rounded-xs"
            />
          ))}
        </div>
      )}

      {!revealed && (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className={`mt-2 cursor-pointer text-[11px] underline-offset-2 opacity-75 hover:opacity-100 hover:underline ${theme.mutedText}`}
        >
          Tap to reveal directly
        </button>
      )}
    </div>
  );
}
