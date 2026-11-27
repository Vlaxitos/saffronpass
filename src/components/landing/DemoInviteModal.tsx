"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { InviteExperience } from "@/components/invite/InviteExperience";
import type {
  OpeningAnimationType,
  ParticleEffectType,
  PublicInviteDTO,
  ThemeId,
} from "@/types/database";

interface DemoInviteModalProps {
  open: boolean;
  onClose: () => void;
  initialAnimation?: OpeningAnimationType;
}

const DEMO_CLOSE_FAMILY_EVENTS = [
  {
    id: "demo-haldi",
    name: "Haldi & Phoolon Ki Holi",
    event_date: "2027-02-18",
    start_time: "10:30 AM",
    venue_name: "Courtyard Lawn, Rambagh Heritage Palace, Jaipur",
    maps_url: "https://maps.google.com/?q=Rambagh+Palace+Jaipur",
    dress_code: "Marigold & Sunshine Yellow",
    sort_order: 0,
  },
  {
    id: "demo-sangeet",
    name: "Royal Sangeet Soirée",
    event_date: "2027-02-18",
    start_time: "7:30 PM",
    venue_name: "Sheesh Mahal Terrace, Jaipur",
    maps_url: "https://maps.google.com/?q=Jaipur+Rajasthan",
    dress_code: "Indo-Western Glamour",
    sort_order: 1,
  },
  {
    id: "demo-wedding",
    name: "Pheras & Wedding Ceremony",
    event_date: "2027-02-19",
    start_time: "6:00 PM",
    venue_name: "Grand Darbar Lawn, Jaipur",
    maps_url: "https://maps.google.com/?q=Jaipur+Rajasthan",
    dress_code: "Traditional Royal Ethnic",
    sort_order: 2,
  },
];

const DEMO_COLLEAGUES_EVENTS = [DEMO_CLOSE_FAMILY_EVENTS[2]];

const DEMO_THEME_OPTIONS: { id: ThemeId; label: string }[] = [
  { id: "royal_saffron", label: "Royal Saffron" },
  { id: "minimal_ivory", label: "Minimal Ivory" },
  { id: "pastel_udaipur", label: "Pastel Udaipur" },
  { id: "south_indian_silk", label: "Silk & Jasmine" },
  { id: "dark_sangeet_glam", label: "Dark Sangeet" },
];

export function DemoInviteModal({
  open,
  onClose,
  initialAnimation = "wax_seal",
}: DemoInviteModalProps) {
  const [animation, setAnimation] =
    useState<OpeningAnimationType>(initialAnimation);
  const [theme, setTheme] = useState<ThemeId>("royal_saffron");
  const [circle, setCircle] = useState<"family" | "colleagues">("family");
  const [particle, setParticle] = useState<ParticleEffectType>("marigold");
  const [instanceKey, setInstanceKey] = useState(0);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const demoInvite: PublicInviteDTO = {
    event: {
      slug: "aanya-and-kabir",
      event_type: "wedding",
      title: "The Royal Wedding Celebration",
      host_names: "Aanya & Kabir",
      tradition_symbol: "ganesh",
      event_date: "2027-02-19",
      welcome_message:
        "With the blessings of our elders and immense joy in our hearts, the Sharma & Malhotra families warmly invite you to grace our wedding celebrations in Jaipur.",
      theme_id: theme,
      opening_animation: animation,
      rsvp_enabled: true,
      plan: "wedding_pro",
      cover_image_url: null,
      gallery_images: [],
      particle_effect: particle,
      scratch_reveal_enabled: true,
      music_track: "royal_shehnai",
      custom_music_url: null,
    },
    category:
      circle === "family"
        ? {
            code: "demo1234",
            etiquette_type: "family",
            max_seats: 4,
            greeting_prefix: "With Family (Saparivar)",
          }
        : {
            code: "demo5678",
            etiquette_type: "solo",
            max_seats: 1,
            greeting_prefix: "Warmly Inviting You",
          },
    sub_events:
      circle === "family" ? DEMO_CLOSE_FAMILY_EVENTS : DEMO_COLLEAGUES_EVENTS,
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1D070C]/80 p-2 backdrop-blur-sm sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-label="Interactive SaffronPass Invitation Demo"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.28 }}
            className="relative flex h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[#E7C06B]/35 bg-[#FCF8F1] shadow-2xl"
          >
            {/* Interactive Demo Control Bar */}
            <div className="z-50 flex flex-wrap items-center justify-between gap-2 border-b border-[#C88A2E]/30 bg-[#3D0C16] px-4 py-3 text-[#FCF8F1]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E7C06B]">
                  Live Demo
                </span>

                {/* Animation Switcher */}
                <div className="inline-flex rounded-lg border border-[#E7C06B]/30 bg-[#2A070F] p-0.5 text-[11px]">
                  {(
                    [
                      ["wax_seal", "Wax Seal"],
                      ["palace_doors", "Palace Doors"],
                      ["cinematic_scroll", "Cinematic"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setAnimation(id);
                        setInstanceKey((k) => k + 1);
                      }}
                      className={`cursor-pointer rounded-md px-2.5 py-1 font-medium transition-colors ${
                        animation === id
                          ? "bg-[#C88A2E] text-[#241405]"
                          : "text-[#F4E4C1]/80 hover:text-white"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Guest Circle Switcher */}
                <div className="inline-flex rounded-lg border border-[#E7C06B]/30 bg-[#2A070F] p-0.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setCircle("family");
                      setInstanceKey((k) => k + 1);
                    }}
                    className={`cursor-pointer rounded-md px-2.5 py-1 font-medium transition-colors ${
                      circle === "family"
                        ? "bg-[#FCF8F1] text-[#3D0C16]"
                        : "text-[#F4E4C1]/80 hover:text-white"
                    }`}
                  >
                    Family (3 Events)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCircle("colleagues");
                      setInstanceKey((k) => k + 1);
                    }}
                    className={`cursor-pointer rounded-md px-2.5 py-1 font-medium transition-colors ${
                      circle === "colleagues"
                        ? "bg-[#FCF8F1] text-[#3D0C16]"
                        : "text-[#F4E4C1]/80 hover:text-white"
                    }`}
                  >
                    Solo (1 Event)
                  </button>
                </div>

                {/* Theme & Particles Compact Selectors */}
                <select
                  aria-label="Demo theme selector"
                  value={theme}
                  onChange={(e) => {
                    const nextTheme = e.target.value as ThemeId;
                    setTheme(nextTheme);
                    if (nextTheme === "dark_sangeet_glam") setParticle("gold_sparkles");
                    else if (nextTheme === "pastel_udaipur") setParticle("rose_petals");
                    else setParticle("marigold");
                    setInstanceKey((k) => k + 1);
                  }}
                  className="cursor-pointer rounded-lg border border-[#E7C06B]/35 bg-[#2A070F] px-2.5 py-1 text-[11px] font-medium text-[#F4E4C1] focus:outline-none"
                >
                  {DEMO_THEME_OPTIONS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close invitation demo"
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#E7C06B]/30 text-[#F4E4C1] transition-colors hover:bg-[#5B1422]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Interactive Invitation Viewport */}
            <div className="relative flex-1 overflow-y-auto">
              <InviteExperience
                key={instanceKey}
                invite={demoInvite}
                demoMode
                inModal
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
