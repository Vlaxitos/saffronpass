"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  DoorOpen,
  Film,
  MailOpen,
  Maximize2,
  Music,
  Play,
  RotateCcw,
  Sparkles,
  Square,
} from "lucide-react";
import { InviteExperience } from "@/components/invite/InviteExperience";
import { SaffronAudioPlayer } from "@/lib/audioPlayer";
import { MUSIC_TRACKS, PARTICLE_EFFECTS, THEMES } from "@/lib/constants";
import type {
  MusicTrackType,
  OpeningAnimationType,
  ParticleEffectType,
  PublicInviteDTO,
  ThemeId,
} from "@/types/database";

const SAMPLE_ALL_EVENTS = [
  {
    id: "udaipur-haldi",
    name: "Haldi & Phoolon Ki Holi",
    event_date: "2027-02-18",
    start_time: "10:30 AM",
    venue_name: "Zenana Mahal Courtyard, Udaipur",
    maps_url: "https://maps.google.com/?q=City+Palace+Udaipur",
    dress_code: "Marigold & Sunshine Yellow",
    sort_order: 0,
  },
  {
    id: "udaipur-sangeet",
    name: "Moonlit Sangeet Soirée",
    event_date: "2027-02-18",
    start_time: "7:30 PM",
    venue_name: "Jagmandir Island Palace, Lake Pichola",
    maps_url: "https://maps.google.com/?q=Jagmandir+Island+Palace+Udaipur",
    dress_code: "Indo-Western Glamour",
    sort_order: 1,
  },
  {
    id: "udaipur-wedding",
    name: "Royal Palace Pheras",
    event_date: "2027-02-19",
    start_time: "6:00 PM",
    venue_name: "City Palace Promenade, Udaipur",
    maps_url: "https://maps.google.com/?q=City+Palace+Udaipur",
    dress_code: "Heritage Indian Couture",
    sort_order: 2,
  },
];

const OPENING_STYLE_CARDS: {
  id: OpeningAnimationType;
  label: string;
  shortLabel: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: "wax_seal",
    label: "3D Wax-Seal Envelope",
    shortLabel: "Wax Seal",
    subtitle: "Embossed gold monogram seal",
    icon: MailOpen,
  },
  {
    id: "palace_doors",
    label: "3D Palace Gates",
    shortLabel: "Palace Gates",
    subtitle: "Architectural Jharokha arch",
    icon: DoorOpen,
  },
  {
    id: "cinematic_scroll",
    label: "Cinematic Editorial",
    shortLabel: "Cinematic",
    subtitle: "Full-bleed magazine reveal",
    icon: Film,
  },
];

const STUDIO_MUSIC_OPTIONS = MUSIC_TRACKS.filter((t) => t.id !== "custom");

interface LiveStudioPlaygroundProps {
  onLaunchFullScreen: (invite: PublicInviteDTO) => void;
}

export function LiveStudioPlayground({
  onLaunchFullScreen,
}: LiveStudioPlaygroundProps) {
  const [themeId, setThemeId] = useState<ThemeId>("royal_saffron");
  const [openingAnimation, setOpeningAnimation] =
    useState<OpeningAnimationType>("wax_seal");
  const [particleEffect, setParticleEffect] =
    useState<ParticleEffectType>("marigold");
  const [musicTrack, setMusicTrack] = useState<MusicTrackType>("royal_shehnai");
  const [guestCircle, setGuestCircle] = useState<"family" | "colleagues">(
    "family"
  );
  const [scratchReveal, setScratchReveal] = useState(true);
  const [replaySeed, setReplaySeed] = useState(0);
  const [previewPlayingTrack, setPreviewPlayingTrack] =
    useState<MusicTrackType | null>(null);

  const previewPlayerRef = useRef<SaffronAudioPlayer | null>(null);

  useEffect(() => {
    return () => {
      previewPlayerRef.current?.dispose();
      previewPlayerRef.current = null;
    };
  }, []);

  const stopPreviewAudio = () => {
    previewPlayerRef.current?.stop();
    setPreviewPlayingTrack(null);
  };

  const handlePreviewMusic = (trackId: MusicTrackType) => {
    if (trackId === "none") {
      stopPreviewAudio();
      return;
    }

    if (previewPlayingTrack === trackId) {
      stopPreviewAudio();
      return;
    }

    if (!previewPlayerRef.current) {
      previewPlayerRef.current = new SaffronAudioPlayer((isPlaying) => {
        if (!isPlaying) setPreviewPlayingTrack(null);
      });
    } else {
      previewPlayerRef.current.stop();
    }

    previewPlayerRef.current.configure(trackId, null);
    const ok = previewPlayerRef.current.start();
    setPreviewPlayingTrack(ok ? trackId : null);
  };

  const sampleInvite = useMemo<PublicInviteDTO>(
    () => ({
      event: {
        slug: "aarav-and-meera-udaipur",
        event_type: "wedding",
        title: "The Royal Udaipur Wedding",
        host_names: "Aarav & Meera",
        tradition_symbol: "ganesh",
        event_date: "2027-02-19",
        welcome_message:
          "With the blessings of our elders and boundless joy in our hearts, the Singhania & Kapoor families warmly invite you to grace our wedding celebrations overlooking Lake Pichola, Udaipur.",
        theme_id: themeId,
        opening_animation: openingAnimation,
        rsvp_enabled: true,
        plan: "wedding_pro",
        cover_image_url: null,
        gallery_images: [],
        particle_effect: particleEffect,
        scratch_reveal_enabled: scratchReveal,
        music_track: musicTrack,
        custom_music_url: null,
      },
      category:
        guestCircle === "family"
          ? {
              code: "udaipur1",
              etiquette_type: "family",
              max_seats: 4,
              greeting_prefix: "With Family (Saparivar)",
            }
          : {
              code: "udaipur2",
              etiquette_type: "solo",
              max_seats: 1,
              greeting_prefix: "Cordially Inviting You",
            },
      sub_events:
        guestCircle === "family" ? SAMPLE_ALL_EVENTS : [SAMPLE_ALL_EVENTS[2]],
    }),
    [
      themeId,
      openingAnimation,
      particleEffect,
      scratchReveal,
      musicTrack,
      guestCircle,
    ]
  );

  const handleSelectOpening = (next: OpeningAnimationType) => {
    setOpeningAnimation(next);
    setReplaySeed((n) => n + 1);
  };

  return (
    <section
      id="studio"
      className="border-t border-[#B88433]/20 bg-[#FFFDF9] py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        {/* Section Heading */}
        <div className="max-w-2xl">
          <p className="font-display text-[10px] font-semibold uppercase tracking-[0.28em] text-[#B88433]">
            Interactive Live Studio · Zero Signup Needed
          </p>
          <h2 className="mt-2 font-editorial text-[clamp(2rem,4.5vw,3.3rem)] font-semibold leading-[1.08] text-[#470F1B]">
            Test-Drive Aarav &amp; Meera&apos;s Udaipur Invite Live
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#6C5950] sm:text-base">
            Switch couture themes, opening rituals, falling petals, and private
            guest circles below—every click updates the invitation instantaneously.
          </p>
        </div>

        {/* Studio Responsive Layout: 2-column on lg+, Compact Swatch Strip + Preview on Mobile/Tablet */}
        <div className="mt-10 grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
          {/* LEFT COLUMN: Visual Selector Controls (Zero Ugly Dropdowns) */}
          <div className="space-y-6 lg:col-span-7">
            {/* 1. 5 Luxury Themes Visual Swatch Cards */}
            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#54121F]">
                  01 · Couture Theme Palette
                </span>
                <span className="text-[11px] text-[#796258]">5 curated themes</span>
              </div>

              <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1 lg:grid lg:grid-cols-3 lg:overflow-visible">
                {THEMES.map((t) => {
                  const active = themeId === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setThemeId(t.id)}
                      className={`flex min-h-[60px] min-w-[162px] shrink-0 cursor-pointer flex-col justify-between rounded-2xl border p-3.5 text-left transition-all lg:min-w-0 ${
                        active
                          ? "border-[#54121F] bg-[#FBF3E5] shadow-sm ring-1 ring-[#54121F]"
                          : "border-[#B88433]/28 bg-white hover:border-[#B88433]/65 hover:bg-[#FBF7F0]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-[#470F1B]">
                          {t.name}
                        </span>
                        <span className="flex shrink-0 -space-x-1">
                          {t.swatches.map((hex) => (
                            <span
                              key={hex}
                              className="h-4 w-4 rounded-full border border-black/15"
                              style={{ backgroundColor: hex }}
                            />
                          ))}
                        </span>
                      </div>
                      <span className="mt-1.5 hidden text-[11px] leading-snug text-[#796258] lg:line-clamp-2 lg:block">
                        {t.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Tactile Opening Style Icon Cards */}
            <div>
              <span className="mb-2.5 block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#54121F]">
                02 · 3D Opening Ritual
              </span>
              <div className="grid grid-cols-3 gap-2.5">
                {OPENING_STYLE_CARDS.map((card) => {
                  const Icon = card.icon;
                  const active = openingAnimation === card.id;
                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => handleSelectOpening(card.id)}
                      className={`flex min-h-[76px] cursor-pointer flex-col items-start justify-between rounded-2xl border p-3.5 text-left transition-all ${
                        active
                          ? "border-[#54121F] bg-[#54121F] text-[#FBF7F0] shadow-md"
                          : "border-[#B88433]/28 bg-white text-[#470F1B] hover:border-[#B88433]/65 hover:bg-[#FBF7F0]"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 ${
                          active ? "text-[#E7C06B]" : "text-[#B88433]"
                        }`}
                      />
                      <div className="mt-2">
                        <p className="text-xs font-semibold leading-tight">
                          <span className="hidden sm:inline">{card.label}</span>
                          <span className="sm:hidden">{card.shortLabel}</span>
                        </p>
                        <p
                          className={`mt-0.5 hidden text-[10px] sm:block ${
                            active ? "text-[#F3E4C6]/80" : "text-[#796258]"
                          }`}
                        >
                          {card.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Falling Particles + Guest Circle Privacy Toggle */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <span className="mb-2.5 block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#54121F]">
                  03 · Falling Particles
                </span>
                <div className="flex flex-wrap gap-2">
                  {PARTICLE_EFFECTS.map((p) => {
                    const active = particleEffect === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setParticleEffect(p.id)}
                        className={`min-h-[40px] cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                          active
                            ? "border-[#54121F] bg-[#54121F] text-[#FBF7F0]"
                            : "border-[#B88433]/30 bg-white text-[#54121F] hover:bg-[#FBF3E5]"
                        }`}
                      >
                        {p.name.replace(" Petals", "")}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="mb-2.5 block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#54121F]">
                  04 · Smart Privacy Circle
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGuestCircle("family")}
                    className={`min-h-[40px] cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                      guestCircle === "family"
                        ? "border-[#54121F] bg-[#54121F] text-[#FBF7F0]"
                        : "border-[#B88433]/30 bg-white text-[#54121F] hover:bg-[#FBF3E5]"
                    }`}
                  >
                    Family · 3 Events
                  </button>
                  <button
                    type="button"
                    onClick={() => setGuestCircle("colleagues")}
                    className={`min-h-[40px] cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                      guestCircle === "colleagues"
                        ? "border-[#54121F] bg-[#54121F] text-[#FBF7F0]"
                        : "border-[#B88433]/30 bg-white text-[#54121F] hover:bg-[#FBF3E5]"
                    }`}
                  >
                    Colleagues · 1 Event
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Studio Music Pills with Live Play/Pause Preview + Scratch Foil Toggle */}
            <div className="rounded-2xl border border-[#B88433]/25 bg-[#FBF7F0] p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#54121F]">
                  <Music className="h-3.5 w-3.5 text-[#B88433]" />
                  05 · Ambient Soundtrack
                </span>

                <button
                  type="button"
                  onClick={() => setScratchReveal((prev) => !prev)}
                  className={`inline-flex min-h-[34px] cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors ${
                    scratchReveal
                      ? "border-[#B88433]/50 bg-[#F3E4C6]/75 text-[#470F1B]"
                      : "border-[#B88433]/25 bg-white text-[#796258]"
                  }`}
                >
                  <Sparkles className="h-3 w-3 text-[#B88433]" />
                  Gold Scratch Card: {scratchReveal ? "ON" : "OFF"}
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {STUDIO_MUSIC_OPTIONS.map((track) => {
                  const active = musicTrack === track.id;
                  const isPreviewing = previewPlayingTrack === track.id;
                  return (
                    <div
                      key={track.id}
                      className={`inline-flex min-h-[40px] items-center rounded-full border pl-3.5 pr-1.5 transition-all ${
                        active
                          ? "border-[#54121F] bg-[#54121F] text-[#FBF7F0]"
                          : "border-[#B88433]/30 bg-white text-[#470F1B]"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          stopPreviewAudio();
                          setMusicTrack(track.id);
                        }}
                        className="cursor-pointer pr-2 text-xs font-semibold"
                      >
                        {track.id === "none" ? "Silent" : track.name}
                      </button>
                      {track.id !== "none" && (
                        <button
                          type="button"
                          onClick={() => handlePreviewMusic(track.id)}
                          aria-label={
                            isPreviewing
                              ? `Stop ${track.name} preview`
                              : `Play ${track.name} preview`
                          }
                          className={`inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-colors ${
                            isPreviewing
                              ? "bg-[#E7C06B] text-[#221204]"
                              : active
                                ? "bg-white/15 text-[#F6E4B8] hover:bg-white/25"
                                : "bg-[#FBF3E5] text-[#54121F] hover:bg-[#F3E4C6]"
                          }`}
                        >
                          {isPreviewing ? (
                            <Square className="h-2.5 w-2.5 fill-current" />
                          ) : (
                            <Play className="h-3 w-3 fill-current" />
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sleek Interactive Phone / Keepsake Preview Viewport */}
          <div className="lg:col-span-5">
            <div className="mx-auto w-full max-w-[392px] overflow-hidden rounded-[36px] border border-[#B88433]/38 bg-[#1E0C13] p-2.5 shadow-[0_28px_72px_rgba(48,12,20,0.22)]">
              {/* Sleek Studio Preview Bezel Controls */}
              <div className="flex items-center justify-between gap-2 px-2.5 pb-2.5 pt-1 text-[#F3E4C6]">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#E7C06B]/85" />
                  <span className="font-mono text-[10px] tracking-[0.06em] text-[#F3E4C6]/85">
                    /aarav-meera/{guestCircle === "family" ? "family" : "solo"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setReplaySeed((n) => n + 1)}
                    aria-label="Replay opening animation"
                    className="inline-flex min-h-[32px] cursor-pointer items-center gap-1 rounded-full border border-[#E7C06B]/30 bg-white/8 px-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#F6E4B8] transition-colors hover:bg-white/16"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Replay
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      stopPreviewAudio();
                      onLaunchFullScreen(sampleInvite);
                    }}
                    className="inline-flex min-h-[32px] cursor-pointer items-center gap-1 rounded-full bg-[#C88A2E] px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#221204] transition-colors hover:bg-[#DDB05A]"
                  >
                    <Maximize2 className="h-3 w-3" />
                    Full Screen
                  </button>
                </div>
              </div>

              {/* Interactive Live Invite Viewport */}
              <div className="relative h-[560px] w-full overflow-y-auto overflow-x-hidden rounded-[26px] bg-[#190910] sm:h-[640px]">
                <InviteExperience
                  key={`${openingAnimation}-${replaySeed}`}
                  invite={sampleInvite}
                  demoMode
                  embedded
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
