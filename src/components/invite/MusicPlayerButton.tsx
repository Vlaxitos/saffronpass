"use client";

import React from "react";
import { Volume2, VolumeX } from "lucide-react";

interface MusicPlayerButtonProps {
  playing: boolean;
  onToggle: () => void;
  isDark?: boolean;
  inModal?: boolean;
}

export function MusicPlayerButton({
  playing,
  onToggle,
  isDark = false,
  inModal = false,
}: MusicPlayerButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={playing ? "Mute background music" : "Play background music"}
      aria-pressed={playing}
      className={`${
        inModal ? "sticky float-right bottom-4 right-4 mr-4 mb-4" : "fixed bottom-5 right-5"
      } z-40 inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold shadow-lg backdrop-blur-md transition-all hover:scale-[1.03] active:scale-[0.97] ${
        isDark
          ? "border-[#E8C67A]/45 bg-[#24102A]/90 text-[#F7E5B7]"
          : "border-[#C88A2E]/45 bg-[#FFFDF8]/92 text-[#4A101C]"
      }`}
    >
      {playing ? (
        <>
          <Volume2 className="h-3.5 w-3.5 text-[#C88A2E]" />
          <span>Playing</span>
          <span className="flex items-end gap-0.5 h-3" aria-hidden="true">
            <span className="h-2 w-0.5 animate-pulse rounded-full bg-[#C88A2E]" />
            <span className="h-3 w-0.5 animate-pulse rounded-full bg-[#C88A2E] [animation-delay:150ms]" />
            <span className="h-1.5 w-0.5 animate-pulse rounded-full bg-[#C88A2E] [animation-delay:300ms]" />
          </span>
        </>
      ) : (
        <>
          <VolumeX className="h-3.5 w-3.5 opacity-70" />
          <span>Music Off</span>
        </>
      )}
    </button>
  );
}
