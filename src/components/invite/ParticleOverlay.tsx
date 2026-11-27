"use client";

import React, { useEffect, useRef } from "react";
import type { ParticleEffectType } from "@/types/database";

interface ParticleOverlayProps {
  effect: ParticleEffectType;
  inModal?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  vRot: number;
  wobblePhase: number;
  wobbleSpeed: number;
  opacity: number;
  color: string;
}

const PALETTES: Record<Exclude<ParticleEffectType, "none">, string[]> = {
  marigold: ["#F59E0B", "#EA580C", "#FBBF24", "#D97706", "#F97316"],
  rose_petals: ["#BE123C", "#E11D48", "#FB7185", "#9F1239", "#FDA4AF"],
  gold_sparkles: ["#F6DC9C", "#E7C06B", "#D9A441", "#FFF4D2", "#C88A2E"],
};

/**
 * Lightweight 60fps HTML5 Canvas particle overlay for Marigold Petals,
 * Rose Petals, and Gold Sparkles. Strictly pointer-events-none and pauses
 * when tab is hidden or prefers-reduced-motion is active.
 */
export function ParticleOverlay({
  effect,
  inModal = false,
}: ParticleOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (effect === "none") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let rafId = 0;
    let paused = false;

    const palette = PALETTES[effect];
    const count = effect === "gold_sparkles" ? 34 : 24;

    const resize = () => {
      const parent = canvas.parentElement;
      const w = inModal && parent ? parent.clientWidth : window.innerWidth;
      const h = inModal && parent ? parent.clientHeight : window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = w;
      height = h;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawn = (randomY: boolean): Particle => ({
      x: Math.random() * Math.max(width, 320),
      y: randomY ? Math.random() * Math.max(height, 480) : -20 - Math.random() * 40,
      vx: (Math.random() - 0.5) * 0.45,
      vy:
        effect === "gold_sparkles"
          ? 0.25 + Math.random() * 0.55
          : 0.55 + Math.random() * 0.85,
      size:
        effect === "gold_sparkles"
          ? 2 + Math.random() * 3.2
          : 5 + Math.random() * 6.5,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.035,
      wobblePhase: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.015 + Math.random() * 0.02,
      opacity:
        effect === "gold_sparkles"
          ? 0.35 + Math.random() * 0.55
          : 0.45 + Math.random() * 0.4,
      color: palette[Math.floor(Math.random() * palette.length)],
    });

    resize();
    const particles: Particle[] = Array.from({ length: count }, () =>
      spawn(true)
    );

    const drawFrame = () => {
      if (paused) return;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.wobblePhase += p.wobbleSpeed;
        p.x += p.vx + Math.sin(p.wobblePhase) * 0.45;
        p.y += p.vy;
        p.rotation += p.vRot;

        if (p.y > height + 30 || p.x < -40 || p.x > width + 40) {
          particles[i] = spawn(false);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (effect === "gold_sparkles") {
          const pulse = 0.55 + 0.45 * Math.sin(p.wobblePhase * 2.2);
          ctx.globalAlpha = p.opacity * pulse;
          ctx.fillStyle = p.color;
          // 4-point diamond sparkle
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 1.5);
          ctx.quadraticCurveTo(0, 0, p.size * 1.5, 0);
          ctx.quadraticCurveTo(0, 0, 0, p.size * 1.5);
          ctx.quadraticCurveTo(0, 0, -p.size * 1.5, 0);
          ctx.quadraticCurveTo(0, 0, 0, -p.size * 1.5);
          ctx.fill();
        } else {
          // Organic fluttering marigold / rose petal
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;
          const flutter = 0.65 + 0.35 * Math.cos(p.wobblePhase * 1.6);
          ctx.scale(1, flutter);
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.bezierCurveTo(
            p.size * 0.85,
            -p.size * 0.6,
            p.size * 0.75,
            p.size * 0.75,
            0,
            p.size
          );
          ctx.bezierCurveTo(
            -p.size * 0.75,
            p.size * 0.75,
            -p.size * 0.85,
            -p.size * 0.6,
            0,
            -p.size
          );
          ctx.fill();
        }

        ctx.restore();
      }

      rafId = window.requestAnimationFrame(drawFrame);
    };

    const onVisibilityChange = () => {
      paused = document.hidden;
      if (!paused) {
        rafId = window.requestAnimationFrame(drawFrame);
      } else {
        window.cancelAnimationFrame(rafId);
      }
    };

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibilityChange);
    rafId = window.requestAnimationFrame(drawFrame);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [effect, inModal]);

  if (effect === "none") return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none z-30 h-full w-full ${
        inModal ? "absolute inset-0" : "fixed inset-0"
      }`}
    />
  );
}
