"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Lock,
  MailOpen,
  Sparkles,
  Users,
} from "lucide-react";
import { SaffronLogo } from "@/components/brand/SaffronLogo";
import { DemoInviteModal } from "@/components/landing/DemoInviteModal";
import { PricingSection } from "@/components/landing/PricingSection";
import type { OpeningAnimationType } from "@/types/database";

export function LandingClient() {
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoLaunchId, setDemoLaunchId] = useState(0);
  const [demoAnimation, setDemoAnimation] =
    useState<OpeningAnimationType>("wax_seal");

  const openDemo = (anim: OpeningAnimationType = "wax_seal") => {
    setDemoAnimation(anim);
    setDemoLaunchId((id) => id + 1);
    setDemoOpen(true);
  };

  return (
    <div className="min-h-screen bg-parchment text-ink">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-[#C88A2E]/20 bg-[#FCF8F1]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" aria-label="SaffronPass Home">
            <SaffronLogo />
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-[#5C4942] md:flex">
            <a href="#features" className="transition-colors hover:text-[#5B1422]">
              How It Works
            </a>
            <a href="#pricing" className="transition-colors hover:text-[#5B1422]">
              Pricing
            </a>
            <button
              type="button"
              onClick={() => openDemo("wax_seal")}
              className="cursor-pointer transition-colors hover:text-[#5B1422]"
            >
              Interactive Demo
            </button>
          </nav>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              href="/login"
              className="rounded-xl px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422] transition-colors hover:bg-[#F5ECDC]"
            >
              Sign In
            </Link>
            <Link
              href="/login?mode=signup"
              className="rounded-xl bg-[#5B1422] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#FCF8F1] shadow-sm transition-colors hover:bg-[#460E19]"
            >
              Create Free Invite
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="relative overflow-hidden py-14 sm:py-20 lg:py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-10">
            {/* Editorial Copy Column */}
            <div className="lg:col-span-7">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#C88A2E]">
                Heirloom Digital Invitations for Weddings &amp; Celebrations
              </p>

              <h1 className="mt-4 font-serif text-5xl font-semibold leading-[1.06] tracking-[-0.015em] text-[#4A101C] sm:text-6xl lg:text-[66px]">
                Interactive Animated Invites &amp; Smart Indian RSVP
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-[#5C4942] sm:text-lg">
                Replace static PDFs and chaotic WhatsApp headcount spreadsheets.
                Send one tactile wax-seal or palace-door invitation per guest
                circle—keeping intimate rituals like Haldi private while capturing
                exact per-function guest counts automatically.
              </p>

              <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
                <Link
                  href="/login?mode=signup"
                  id="hero-create-invite-cta"
                  className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#5B1422] px-7 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#FCF8F1] shadow-[0_10px_28px_rgba(91,20,34,0.22)] transition-all hover:bg-[#460E19]"
                >
                  Create Your Free Invite
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <button
                  type="button"
                  id="hero-wax-seal-demo-btn"
                  onClick={() => openDemo("wax_seal")}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#C88A2E]/60 bg-[#FFFDF8] px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#5B1422] shadow-sm transition-all hover:border-[#5B1422] hover:bg-[#FCF5E8]"
                >
                  <MailOpen className="h-4 w-4 text-[#C88A2E]" />
                  Test Wax-Seal Envelope
                </button>
              </div>

              {/* Subtle Trust Proof Row */}
              <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-2 border-t border-[#C88A2E]/20 pt-6 text-xs font-medium text-[#69564E]">
                <span>60fps Mobile-First Animations</span>
                <span className="hidden h-1 w-1 rounded-full bg-[#C88A2E] sm:inline-block" />
                <span>Private Sub-Event Visibility</span>
                <span className="hidden h-1 w-1 rounded-full bg-[#C88A2E] sm:inline-block" />
                <span>Zero Guest Login Required</span>
              </div>
            </div>

            {/* Interactive Sealed Envelope Hero Showcase */}
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="relative mx-auto max-w-[430px]"
              >
                <div className="rounded-[28px] border border-[#C88A2E]/35 bg-royal-velvet p-6 text-center shadow-[0_24px_64px_rgba(61,12,22,0.28)] sm:p-8">
                  <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#E7C06B]">
                    Interactive Preview · Tap the Seal
                  </p>

                  {/* Mini Envelope Preview Card */}
                  <button
                    type="button"
                    onClick={() => openDemo("wax_seal")}
                    aria-label="Open interactive Wax-Seal envelope demo"
                    className="group relative mt-5 block w-full cursor-pointer overflow-hidden rounded-2xl border border-[#E7C06B]/35 bg-[#5B1422] pt-[74%] text-left shadow-xl transition-transform duration-300 hover:scale-[1.015] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E7C06B]"
                  >
                    {/* Envelope Fold Geometry */}
                    <svg
                      viewBox="0 0 400 300"
                      preserveAspectRatio="none"
                      className="pointer-events-none absolute inset-0 h-full w-full"
                      aria-hidden="true"
                    >
                      <polygon points="0,0 400,0 200,152" fill="#6D192A" />
                      <polyline
                        points="0,0 200,152 400,0"
                        fill="none"
                        stroke="rgba(231,192,107,0.45)"
                        strokeWidth="1.5"
                      />
                      <polygon
                        points="0,300 200,145 400,300"
                        fill="#4B0F1C"
                        stroke="rgba(231,192,107,0.28)"
                        strokeWidth="1"
                      />
                    </svg>

                    {/* Center Wax Seal */}
                    <span className="wax-seal-surface absolute left-1/2 top-[48%] flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110">
                      <span className="flex h-16 w-16 flex-col items-center justify-center rounded-full border border-[#5B3507]/35">
                        <Sparkles className="h-4 w-4 text-[#4A2905]" />
                        <span className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.18em] text-[#4A2905]">
                          Tap
                        </span>
                      </span>
                    </span>

                    <div className="absolute inset-x-4 bottom-4 text-center">
                      <p className="font-serif text-2xl font-semibold text-[#FCF8F1]">
                        Aanya &amp; Kabir
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.22em] text-[#E7C06B]/90">
                        Jaipur · Royal Wedding Demo
                      </p>
                    </div>
                  </button>

                  {/* Quick Animation Switcher Links */}
                  <div className="mt-5 flex items-center justify-center gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => openDemo("wax_seal")}
                      className="cursor-pointer rounded-full border border-[#E7C06B]/35 bg-[#3D0C16]/70 px-3.5 py-1.5 font-medium text-[#F4E4C1] transition-colors hover:bg-[#C88A2E] hover:text-[#241405]"
                    >
                      Try Wax Seal
                    </button>
                    <button
                      type="button"
                      onClick={() => openDemo("palace_doors")}
                      className="cursor-pointer rounded-full border border-[#E7C06B]/35 bg-[#3D0C16]/70 px-3.5 py-1.5 font-medium text-[#F4E4C1] transition-colors hover:bg-[#C88A2E] hover:text-[#241405]"
                    >
                      Try Palace Doors
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Three Core Architectural Pillars */}
        <section
          id="features"
          className="border-t border-[#C88A2E]/20 bg-[#FFFDF8] py-20 sm:py-24"
        >
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#C88A2E]">
                Engineered for Indian Etiquette
              </p>
              <h2 className="mt-2 font-serif text-4xl font-semibold text-[#4A101C] sm:text-5xl">
                One Celebration. Tailored Links for Every Guest Circle.
              </h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <article className="rounded-2xl border border-[#C88A2E]/28 bg-[#FCF8F1] p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#5B1422] text-[#E7C06B]">
                  <MailOpen className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-serif text-2xl font-semibold text-[#4A101C]">
                  Royal Opening Rituals
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#69564E]">
                  Choose between our tactile gold Wax-Seal Envelope or ornate
                  Royal Palace Doors—engineered for silky 60fps opening directly
                  inside WhatsApp mobile browsers.
                </p>
              </article>

              <article className="rounded-2xl border border-[#C88A2E]/28 bg-[#FCF8F1] p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#5B1422] text-[#E7C06B]">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-serif text-2xl font-semibold text-[#4A101C]">
                  Private Sub-Event Filtering
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#69564E]">
                  Generate unguessable 8-character secret links for Close Family,
                  Friends, or Office Colleagues. Hidden ceremonies like Haldi are
                  strictly withheld on the server and never leak to guests.
                </p>
              </article>

              <article className="rounded-2xl border border-[#C88A2E]/28 bg-[#FCF8F1] p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#5B1422] text-[#E7C06B]">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-serif text-2xl font-semibold text-[#4A101C]">
                  Exact Per-Function Headcounts
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#69564E]">
                  Enforce Solo, Couple, or Saparivar seat caps cleanly per link.
                  Watch live confirmed headcounts update separately for Haldi,
                  Sangeet, Wedding &amp; Reception—with zero duplicate RSVPs.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <PricingSection />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#C88A2E]/20 bg-[#FCF8F1] py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 sm:flex-row sm:px-8">
          <SaffronLogo />
          <p className="text-xs text-[#7A6258]">
            SaffronPass · Luxury Interactive Invitations &amp; Multi-Event RSVP.
          </p>
        </div>
      </footer>

      {/* Interactive No-Login Wax Seal / Palace Doors Demo Modal */}
      <DemoInviteModal
        key={demoLaunchId}
        open={demoOpen}
        onClose={() => setDemoOpen(false)}
        initialAnimation={demoAnimation}
      />
    </div>
  );
}
