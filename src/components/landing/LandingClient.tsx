"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Lock, MailOpen, Sparkles, Users } from "lucide-react";
import { SaffronLogo } from "@/components/brand/SaffronLogo";
import { FullScreenDemoOverlay } from "@/components/landing/FullScreenDemoOverlay";
import { LiveStudioPlayground } from "@/components/landing/LiveStudioPlayground";
import { PricingSection } from "@/components/landing/PricingSection";
import type { PublicInviteDTO } from "@/types/database";

const HERO_DEFAULT_DEMO: PublicInviteDTO = {
  event: {
    slug: "aarav-and-meera-udaipur",
    event_type: "wedding",
    title: "The Royal Udaipur Wedding",
    host_names: "Aarav & Meera",
    tradition_symbol: "ganesh",
    event_date: "2027-02-19",
    welcome_message:
      "With the blessings of our elders and boundless joy in our hearts, the Singhania & Kapoor families warmly invite you to grace our wedding celebrations overlooking Lake Pichola, Udaipur.",
    theme_id: "royal_saffron",
    opening_animation: "wax_seal",
    rsvp_enabled: true,
    plan: "wedding_pro",
    cover_image_url: null,
    gallery_images: [],
    particle_effect: "marigold",
    scratch_reveal_enabled: true,
    music_track: "royal_shehnai",
    custom_music_url: null,
  },
  category: {
    code: "udaipur1",
    etiquette_type: "family",
    max_seats: 4,
    greeting_prefix: "With Family (Saparivar)",
  },
  sub_events: [
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
  ],
};

export function LandingClient() {
  const [fullScreenOpen, setFullScreenOpen] = useState(false);
  const [fullScreenInvite, setFullScreenInvite] =
    useState<PublicInviteDTO>(HERO_DEFAULT_DEMO);
  const [launchKey, setLaunchKey] = useState(0);

  const launchFullScreenDemo = (invite: PublicInviteDTO) => {
    setFullScreenInvite(invite);
    setLaunchKey((k) => k + 1);
    setFullScreenOpen(true);
  };

  return (
    <div className="texture-paper min-h-screen w-full overflow-x-hidden bg-parchment text-ink">
      {/* Top Couture Navigation */}
      <header className="glass-luxury sticky top-0 z-30 border-x-0 border-t-0">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-8">
          <Link href="/" aria-label="SaffronPass Home">
            <SaffronLogo />
          </Link>

          <nav className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-[0.18em] text-[#6C5950] md:flex">
            <a href="#studio" className="transition-colors hover:text-[#54121F]">
              Live Studio
            </a>
            <a href="#craft" className="transition-colors hover:text-[#54121F]">
              Craft
            </a>
            <a href="#pricing" className="transition-colors hover:text-[#54121F]">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="inline-flex min-h-[44px] items-center rounded-xl px-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#54121F] transition-colors hover:bg-[#F3EADC]"
            >
              Sign In
            </Link>
            <Link
              href="/login?mode=signup"
              className="inline-flex min-h-[44px] items-center rounded-xl bg-[#54121F] px-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#FBF7F0] shadow-xs transition-colors hover:bg-[#3D0B16]"
            >
              <span className="hidden sm:inline">Craft Your Invite</span>
              <span className="sm:hidden">Start Free</span>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Editorial Couture Hero */}
        <section className="relative py-16 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-8">
            <p className="font-display text-[10px] font-semibold uppercase tracking-[0.32em] text-[#B88433] sm:text-[11px]">
              Bespoke Interactive Web Invitations &amp; Smart Indian RSVP
            </p>

            <h1 className="mx-auto mt-5 max-w-4xl font-editorial text-[clamp(2.65rem,6.4vw,4.75rem)] font-semibold leading-[1.03] tracking-[-0.015em] text-[#470F1B]">
              Heirloom Animated Invites Built for Multi-Event Celebrations
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-[1.7] text-[#645149] sm:text-lg">
              Replace static PDFs and chaotic WhatsApp headcount spreadsheets.
              Send tactile 3D wax-seal envelopes or palace-gate invitations per
              guest circle—keeping intimate ceremonies like Haldi strictly
              private while collecting exact per-function headcounts.
            </p>

            <div className="mt-9 flex flex-col items-stretch justify-center gap-3.5 sm:flex-row sm:items-center">
              <Link
                href="/login?mode=signup"
                id="hero-create-invite-cta"
                className="inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-full bg-[#54121F] px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FBF7F0] shadow-[0_14px_34px_rgba(84,18,31,0.22)] transition-all hover:bg-[#3D0B16]"
              >
                Craft Your Invite Free
                <ArrowRight className="h-4 w-4" />
              </Link>

              <button
                type="button"
                id="hero-experience-demo-btn"
                onClick={() => launchFullScreenDemo(HERO_DEFAULT_DEMO)}
                className="inline-flex min-h-[52px] cursor-pointer items-center justify-center gap-2 rounded-full border border-[#B88433]/55 bg-[#FFFDF9] px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#54121F] shadow-xs transition-all hover:border-[#54121F] hover:bg-[#FBF3E5]"
              >
                <Sparkles className="h-4 w-4 text-[#B88433]" />
                Experience Live Demo
              </button>
            </div>

            <div className="mx-auto mt-10 flex max-w-xl flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-[#B88433]/22 pt-6 text-[11px] font-medium uppercase tracking-[0.14em] text-[#796258]">
              <span>5 Couture Themes</span>
              <span className="hidden h-1 w-1 rounded-full bg-[#B88433] sm:inline-block" />
              <span>Private Sub-Event Links</span>
              <span className="hidden h-1 w-1 rounded-full bg-[#B88433] sm:inline-block" />
              <span>Zero Guest Login</span>
            </div>
          </div>
        </section>

        {/* Embedded 2027 Interactive Live Studio Playground */}
        <LiveStudioPlayground onLaunchFullScreen={launchFullScreenDemo} />

        {/* Architectural Craft Pillars */}
        <section
          id="craft"
          className="border-t border-[#B88433]/20 bg-parchment py-16 sm:py-24"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-8">
            <div className="max-w-2xl">
              <p className="font-display text-[10px] font-semibold uppercase tracking-[0.28em] text-[#B88433]">
                Engineered for Indian Etiquette
              </p>
              <h2 className="mt-2 font-editorial text-[clamp(2rem,4.5vw,3.2rem)] font-semibold leading-[1.08] text-[#470F1B]">
                One Celebration. Tailored Links for Every Guest Circle.
              </h2>
            </div>

            <div className="mt-11 grid grid-cols-1 gap-6 md:grid-cols-3">
              <article className="gold-shimmer-border rounded-2xl bg-[#FFFDF9] p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#54121F] text-[#E7C06B]">
                  <MailOpen className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-editorial text-2xl font-semibold text-[#470F1B]">
                  3D Tactile Opening Rituals
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#6C5950]">
                  Choose between an embossed monogram Wax-Seal Envelope,
                  architectural Mughal Palace Gates, or a Cinematic Editorial
                  hero—paired with brushed gold scratch-to-reveal dates.
                </p>
              </article>

              <article className="gold-shimmer-border rounded-2xl bg-[#FFFDF9] p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#54121F] text-[#E7C06B]">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-editorial text-2xl font-semibold text-[#470F1B]">
                  Zero-Leak Private Ceremonies
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#6C5950]">
                  Unguessable 8-character secret links enforce sub-event
                  visibility strictly on the server—so Haldi &amp; Cocktail stay
                  invisible on links sent to colleagues or extended circles.
                </p>
              </article>

              <article className="gold-shimmer-border rounded-2xl bg-[#FFFDF9] p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#54121F] text-[#E7C06B]">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-editorial text-2xl font-semibold text-[#470F1B]">
                  Caterer-Ready Headcounts
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#6C5950]">
                  Invite up to 3 family Co-Hosts, log elders who confirmed by
                  phone, enforce Solo/Couple/Family seat caps, and export
                  UTF-8 Excel caterer sheets with live per-event totals.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <PricingSection />
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-[#B88433]/20 bg-[#FBF7F0] py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-8">
          <SaffronLogo />
          <p className="text-xs text-[#796258]">
            SaffronPass · Heirloom Interactive Invitations &amp; Multi-Event RSVP.
          </p>
        </div>
      </footer>

      {/* True Zero-Scroll Full-Screen Live Demo */}
      <FullScreenDemoOverlay
        open={fullScreenOpen}
        onClose={() => setFullScreenOpen(false)}
        invite={fullScreenInvite}
        launchKey={launchKey}
      />
    </div>
  );
}
