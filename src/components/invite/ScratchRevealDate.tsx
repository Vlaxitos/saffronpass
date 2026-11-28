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
  { x: -76, y: -44, size: 7, delay: 0 },
  { x: -44, y: -64, size: 5, delay: 0.04 },
  { x: 0, y: -76, size: 8, delay: 0.02 },
  { x: 46, y: -62, size: 6, delay: 0.06 },
  { x: 78, y: -40, size: 7, delay: 0.03 },
  { x: -84, y: 12, size: 6, delay: 0.05 },
  { x: 86, y: 8, size: 6, delay: 0.02 },
  { x: -58, y: 54, size: 7, delay: 0.04 },
  { x: 0, y: 68, size: 6, delay: 0.06 },
  { x: 60, y: 52, size: 7, delay: 0.01 },
];

/**
 * Interactive brushed metallic Gold-Foil Scratch-to-Reveal Date card.
 * Enforces touch-action: none so mobile guests rub off foil smoothly without
 * scrolling the page; auto-reveals with a gold sparkle celebration at 45%.
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

    const w = 340;
    const h = 110;
    canvas.width = w;
    canvas.height = h;

    // Realistic brushed antique gold metallic foil gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#B88433");
    grad.addColorStop(0.24, "#F1D48E");
    grad.addColorStop(0.48, "#C68F37");
    grad.addColorStop(0.74, "#F6E0A6");
    grad.addColorStop(1, "#9B6A20");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle brushed metal grain lines
    ctx.strokeStyle = "rgba(255, 250, 232, 0.14)";
    ctx.lineWidth = 1;
    for (let y = 2; y < h; y += 3) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Diagonal metallic light sheen bands
    ctx.fillStyle = "rgba(255, 250, 232, 0.2)";
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 68 - 22, 0);
      ctx.lineTo(i * 68 + 12, 0);
      ctx.lineTo(i * 68 - 26, h);
      ctx.lineTo(i * 68 - 60, h);
      ctx.closePath();
      ctx.fill();
    }

    // Fine inner foil border
    ctx.strokeStyle = "rgba(74, 41, 5, 0.24)";
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 8, w - 16, h - 16);

    // Subtle embossed foil hint
    ctx.fillStyle = "rgba(62, 34, 4, 0.82)";
    ctx.font = "600 11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("RUB GOLD FOIL TO REVEAL", w / 2, h / 2);
  }, [revealed]);

  const computeClearedRatio = () => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;
    const { width, height } = canvas;
    const pixels = ctx.getImageData(0, 0, width, height).data;
    let cleared = 0;
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
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    strokeCountRef.current += 1;
    if (strokeCountRef.current % 6 === 0 && computeClearedRatio() >= 0.45) {
      setRevealed(true);
    }
  };

  return (
    <div className="relative mx-auto mt-5 flex max-w-[330px] flex-col items-center">
      <p
        className={`mb-2 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] ${theme.accentText}`}
      >
        <Sparkles className="h-3 w-3" />
        <span>{revealed ? "Save the Date" : "Rub Gold Foil to Reveal"}</span>
      </p>

      <div
        className={`relative h-[104px] w-full overflow-hidden rounded-2xl border shadow-inner ${theme.cardBorder} ${theme.countdownCell}`}
      >
        <div className="flex h-full w-full flex-col items-center justify-center px-4 text-center">
          <span
            className={`text-[9px] font-semibold uppercase tracking-[0.26em] ${theme.accentText}`}
          >
            Save the Date
          </span>
          <span
            className={`mt-1 font-editorial text-xl font-semibold sm:text-2xl ${theme.headingText}`}
          >
            {formattedDate}
          </span>
        </div>

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
            aria-label="Rub gold foil to reveal celebration date"
            className="absolute inset-0 h-full w-full cursor-pointer select-none"
          />
        )}
      </div>

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
                scale: [0.6, 1.3, 0],
                opacity: [1, 1, 0],
                rotate: 135,
              }}
              transition={{
                duration: 0.92,
                delay: sp.delay,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                width: sp.size,
                height: sp.size,
                backgroundColor: idx % 2 === 0 ? "#E7C06B" : "#C88A2E",
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
          className={`mt-2 min-h-[36px] cursor-pointer text-[10px] font-medium uppercase tracking-[0.18em] opacity-75 hover:opacity-100 hover:underline ${theme.mutedText}`}
        >
          Tap to reveal directly
        </button>
      )}
    </div>
  );
}
