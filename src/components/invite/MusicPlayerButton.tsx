"use client";

import React from "react";
import { Volume2, VolumeX } from "lucide-react";

interface MusicPlayerButtonProps {
  playing: boolean;
  onToggle: () => void;
  isDark?: boolean;
  embedded?: boolean;
}

export function MusicPlayerButton({
  playing,
  onToggle,
  isDark = false,
  embedded = false,
}: MusicPlayerButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={playing ? "Mute background music" : "Play background music"}
      aria-pressed={playing}
      className={`${
        embedded
          ? "sticky float-right bottom-3 right-3 mr-3 mb-3"
          : "fixed bottom-5 right-5"
      } z-40 inline-flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] shadow-xl transition-all hover:scale-[1.03] active:scale-[0.97] ${
        isDark
          ? "glass-luxury-dark text-[#F6E4B8]"
          : "glass-luxury text-[#470F1B]"
      }`}
    >
      {playing ? (
        <>
          <span
            className="flex h-3.5 items-end gap-[2.5px]"
            aria-hidden="true"
          >
            <span className="animate-eq-1 w-[2.5px] rounded-full bg-[#C88A2E]" />
            <span className="animate-eq-2 w-[2.5px] rounded-full bg-[#C88A2E]" />
            <span className="animate-eq-3 w-[2.5px] rounded-full bg-[#C88A2E]" />
          </span>
          <span>Sound On</span>
          <Volume2 className="h-3.5 w-3.5 text-[#C88A2E]" />
        </>
      ) : (
        <>
          <VolumeX className="h-3.5 w-3.5 opacity-65" />
          <span>Sound Off</span>
        </>
      )}
    </button>
  );
}
