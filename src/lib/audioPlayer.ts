"use client";

import type { MusicTrackType } from "@/types/database";

const BUILTIN_TRACK_URLS: Record<
  Exclude<MusicTrackType, "none" | "custom">,
  string
> = {
  royal_shehnai: "/audio/royal-shehnai.mp3",
  romantic_piano: "/audio/romantic-piano.mp3",
  sitar_bliss: "/audio/sitar-bliss.mp3",
  celebration_chimes: "/audio/celebration-chimes.mp3",
  acoustic_warmth: "/audio/acoustic-warmth.mp3",
};

export function resolveMusicTrackUrl(
  track: MusicTrackType,
  customUrl?: string | null
): string | null {
  if (track === "none") return null;
  if (track === "custom") {
    const trimmed = customUrl?.trim();
    return trimmed ? trimmed : null;
  }
  return BUILTIN_TRACK_URLS[track] ?? null;
}

/**
 * Pure HTML5 <audio> studio playback controller for SaffronPass.
 * - Plays real MP3 tracks from /public/audio/ or uploaded custom Supabase Storage MP3s.
 * - Starts .play() synchronously inside user click/tap handlers for iOS Safari & Android Chrome.
 * - Smoothly fades volume from 0 -> 0.55 over 1.2 seconds with seamless looping.
 * - Fails silently and gracefully if a local MP3 file has not been added yet.
 */
export class SaffronAudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private fadeRafId: number | null = null;
  private activeUrl: string | null = null;
  private playing = false;
  private onStateChange?: (playing: boolean) => void;

  constructor(onStateChange?: (playing: boolean) => void) {
    this.onStateChange = onStateChange;
  }

  public configure(track: MusicTrackType, customUrl?: string | null) {
    const nextUrl = resolveMusicTrackUrl(track, customUrl);
    if (nextUrl === this.activeUrl) return;
    this.stop();
    this.activeUrl = nextUrl;
    if (this.audio) {
      this.audio.src = "";
      this.audio = null;
    }
  }

  public hasTrack(): boolean {
    return Boolean(this.activeUrl);
  }

  public isPlaying(): boolean {
    return this.playing;
  }

  private cancelFade() {
    if (this.fadeRafId !== null) {
      window.cancelAnimationFrame(this.fadeRafId);
      this.fadeRafId = null;
    }
  }

  private setPlayingState(next: boolean) {
    if (this.playing === next) return;
    this.playing = next;
    this.onStateChange?.(next);
  }

  private fadeVolumeTo(target: number, durationMs = 1200) {
    this.cancelFade();
    const audio = this.audio;
    if (!audio) return;

    const startVol = audio.volume;
    const startTime = performance.now();

    const step = (now: number) => {
      if (!this.audio || !this.playing) {
        this.fadeRafId = null;
        return;
      }
      const progress = Math.min(1, (now - startTime) / durationMs);
      // Smooth ease-out curve
      const eased = 1 - Math.pow(1 - progress, 2);
      this.audio.volume = Math.max(
        0,
        Math.min(1, startVol + (target - startVol) * eased)
      );
      if (progress < 1) {
        this.fadeRafId = window.requestAnimationFrame(step);
      } else {
        this.fadeRafId = null;
      }
    };

    this.fadeRafId = window.requestAnimationFrame(step);
  }

  /**
   * Must be invoked directly inside a click/tap event handler for mobile browser audio unlock.
   */
  public start(): boolean {
    if (!this.activeUrl) return false;
    if (this.playing && this.audio && !this.audio.paused) return true;

    try {
      if (!this.audio) {
        const el = new Audio(this.activeUrl);
        el.loop = true;
        el.preload = "auto";
        el.volume = 0;

        el.addEventListener("error", () => {
          // Missing MP3 or decode error: fail silently & gracefully
          this.cancelFade();
          this.setPlayingState(false);
        });

        el.addEventListener("pause", () => {
          if (this.playing) {
            this.cancelFade();
            this.setPlayingState(false);
          }
        });

        this.audio = el;
      }

      this.audio.volume = 0;
      const playPromise = this.audio.play();
      this.setPlayingState(true);
      this.fadeVolumeTo(0.55, 1200);

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          // Silently recover if file is absent or browser blocked autoplay
          this.cancelFade();
          this.setPlayingState(false);
        });
      }

      return true;
    } catch {
      this.cancelFade();
      this.setPlayingState(false);
      return false;
    }
  }

  public stop() {
    this.cancelFade();
    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.volume = 0;
      } catch {
        // Ignore pause errors
      }
    }
    this.setPlayingState(false);
  }

  public toggle(): boolean {
    if (this.playing) {
      this.stop();
      return false;
    }
    return this.start();
  }

  public dispose() {
    this.stop();
    if (this.audio) {
      try {
        this.audio.removeAttribute("src");
        this.audio.load();
      } catch {
        // Ignore cleanup errors
      }
      this.audio = null;
    }
  }
}
