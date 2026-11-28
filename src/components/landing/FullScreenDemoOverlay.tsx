"use client";

import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { InviteExperience } from "@/components/invite/InviteExperience";
import type { PublicInviteDTO } from "@/types/database";

interface FullScreenDemoOverlayProps {
  open: boolean;
  onClose: () => void;
  invite: PublicInviteDTO;
  launchKey: number;
}

/**
 * True zero-scroll full-screen interactive demo (`fixed inset-0 h-[100dvh] w-screen z-50`)
 * with a floating glassmorphic "Close Demo" pill at top-right.
 */
export function FullScreenDemoOverlay({
  open,
  onClose,
  invite,
  launchKey,
}: FullScreenDemoOverlayProps) {
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 h-[100dvh] w-screen overflow-hidden bg-[#14060B]"
          role="dialog"
          aria-modal="true"
          aria-label="Full-Screen SaffronPass Live Demo"
        >
          {/* Floating Top-Right Close Demo Pill */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Live Demo"
            className="glass-luxury-dark fixed right-4 top-4 z-[60] inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F6E4B8] shadow-2xl transition-transform hover:scale-[1.03] active:scale-[0.97] sm:right-6 sm:top-5"
          >
            <X className="h-4 w-4 text-[#E7C06B]" />
            <span>Close Demo</span>
          </button>

          {/* Scrollable Container once Unsealed; Zero-Scroll while Opening Cover is Active */}
          <div className="h-full w-full overflow-y-auto overflow-x-hidden">
            <InviteExperience
              key={`fs-${launchKey}`}
              invite={invite}
              demoMode
              embedded={false}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
