"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Building2, Check } from "lucide-react";

type Currency = "INR" | "USD";

interface PricingPlan {
  id: string;
  name: string;
  badge?: string;
  inr: string;
  usd: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  ctaLabel: string;
}

const SINGLE_DAY_PLANS: PricingPlan[] = [
  {
    id: "celebration_pass",
    name: "Celebration Pass",
    inr: "₹399",
    usd: "$9",
    description:
      "Ideal for Engagements, Griha Pravesh, Milestone Birthdays, Baby Showers & Anniversaries.",
    features: [
      "All 5 luxury themes & 3D openings",
      "Unlimited guest RSVPs & headcounts",
      "Custom URL slug & Google Maps links",
      "Zero preview watermark banner",
    ],
    ctaLabel: "Start Free Preview",
  },
  {
    id: "celebration_pro",
    name: "Celebration Pro",
    inr: "₹699",
    usd: "$15",
    description:
      "Elevated single-day hosting with multiple guest circles, gallery photos, and strict seat etiquette.",
    features: [
      "Everything in Celebration Pass",
      "Unlimited smart category links & seat caps",
      "Meal preference, notes & CSV export",
      "Priority host support",
    ],
    ctaLabel: "Start Free Preview",
  },
];

const WEDDING_PLANS: PricingPlan[] = [
  {
    id: "wedding_standard",
    name: "Wedding Standard",
    inr: "₹1,299",
    usd: "$29",
    description:
      "Built for multi-day weddings with Haldi, Mehendi, Sangeet, Wedding & Reception.",
    features: [
      "Up to 6 sub-events with dress codes & maps",
      "Private guest-circle links (keep Haldi private)",
      "Live per-function headcounts & caterer CSV",
      "Anti-duplicate phone RSVP & edit memory",
    ],
    ctaLabel: "Start Free Preview",
  },
  {
    id: "wedding_pro",
    name: "Wedding Pro",
    badge: "Most Popular",
    inr: "₹2,999",
    usd: "$59",
    highlighted: true,
    description:
      "Complete luxury command center for Bride & Groom families hosting multi-day weddings.",
    features: [
      "Unlimited sub-events & smart category links",
      "Family Co-Hosts (up to 3) & Bride/Groom filters",
      "Manual phone RSVP entry & WhatsApp sharing",
      "Gold scratch-reveal, particles & custom MP3",
    ],
    ctaLabel: "Craft Your Wedding Invite",
  },
  {
    id: "vip",
    name: "Done-For-You VIP",
    inr: "₹5,999+",
    usd: "$129+",
    description:
      "White-glove studio concierge where our team designs, configures, and tests every invite link for you.",
    features: [
      "Everything in Wedding Pro included",
      "Dedicated studio setup for all ceremonies",
      "Custom family etiquette link structuring",
      "Direct WhatsApp concierge support",
    ],
    ctaLabel: "Start Free Preview",
  },
];

export function PricingSection() {
  const [currency, setCurrency] = useState<Currency>("INR");

  return (
    <section
      id="pricing"
      className="texture-paper border-t border-[#B88433]/20 bg-[#F7EFE2] py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        {/* Section Header & Currency Pill Toggle */}
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="font-display text-[10px] font-semibold uppercase tracking-[0.28em] text-[#B88433]">
              Transparent One-Time Pricing
            </p>
            <h2 className="mt-2 font-editorial text-[clamp(2.1rem,4.8vw,3.4rem)] font-semibold leading-[1.06] text-[#470F1B]">
              Crafted for Every Celebration
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#6C5950] sm:text-base">
              Design and test your full animated invitation free before
              upgrading. One-time event pass—zero recurring subscriptions.
            </p>
          </div>

          <div
            className="inline-flex items-center rounded-full border border-[#B88433]/35 bg-[#FFFDF9] p-1 shadow-xs"
            role="group"
            aria-label="Currency selector"
          >
            <button
              type="button"
              onClick={() => setCurrency("INR")}
              className={`min-h-[40px] cursor-pointer rounded-full px-4 py-2 text-xs font-semibold tracking-[0.06em] transition-all ${
                currency === "INR"
                  ? "bg-[#54121F] text-[#FBF7F0] shadow-xs"
                  : "text-[#54121F] hover:bg-[#FBF3E5]"
              }`}
            >
              India (INR ₹)
            </button>
            <button
              type="button"
              onClick={() => setCurrency("USD")}
              className={`min-h-[40px] cursor-pointer rounded-full px-4 py-2 text-xs font-semibold tracking-[0.06em] transition-all ${
                currency === "USD"
                  ? "bg-[#54121F] text-[#FBF7F0] shadow-xs"
                  : "text-[#54121F] hover:bg-[#FBF3E5]"
              }`}
            >
              Global (USD $)
            </button>
          </div>
        </div>

        {/* Free Preview Banner Card */}
        <div className="gold-shimmer-border mt-10 flex flex-col items-start justify-between gap-5 rounded-2xl bg-[#FFFDF9] p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <div className="flex flex-wrap items-baseline gap-3">
              <h3 className="font-editorial text-2xl font-semibold text-[#470F1B] sm:text-3xl">
                Free Preview
              </h3>
              <span className="font-editorial text-3xl font-semibold text-[#B88433]">
                {currency === "INR" ? "₹0" : "$0"}
              </span>
            </div>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[#6C5950]">
              Design your entire invitation with all 5 themes, 3D opening
              animations, private guest-circle links, and up to 5 test RSVPs at
              zero cost.
            </p>
          </div>

          <Link
            href="/login?mode=signup"
            className="inline-flex min-h-[46px] shrink-0 items-center gap-2 rounded-xl bg-[#54121F] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FBF7F0] transition-colors hover:bg-[#3D0B16]"
          >
            Craft Free Invite
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Single-Day Events */}
        <div className="mt-12">
          <div className="mb-5 flex items-center gap-3">
            <h3 className="font-editorial text-2xl font-semibold text-[#470F1B]">
              Single-Day Events
            </h3>
            <span className="h-px flex-1 bg-[#B88433]/25" />
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {SINGLE_DAY_PLANS.map((plan) => (
              <PlanCard key={plan.id} plan={plan} currency={currency} />
            ))}
          </div>
        </div>

        {/* Multi-Day Weddings */}
        <div className="mt-12">
          <div className="mb-5 flex items-center gap-3">
            <h3 className="font-editorial text-2xl font-semibold text-[#470F1B]">
              Multi-Day Weddings
            </h3>
            <span className="h-px flex-1 bg-[#B88433]/25" />
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {WEDDING_PLANS.map((plan) => (
              <PlanCard key={plan.id} plan={plan} currency={currency} />
            ))}
          </div>
        </div>

        {/* B2B Planner / Card-Shop Credit Pack */}
        <div className="texture-paper mt-12 overflow-hidden rounded-3xl border border-[#E7C06B]/30 bg-royal-velvet p-6 text-[#FBF7F0] shadow-xl sm:p-10">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#E7C06B]">
                <Building2 className="h-4 w-4" />
                <span>B2B Planner &amp; Card-Shop Credit Pack</span>
              </div>
              <h3 className="mt-2.5 font-editorial text-3xl font-semibold sm:text-4xl">
                10 Weddings for{" "}
                <span className="text-[#E7C06B]">
                  {currency === "INR" ? "₹4,999" : "$99"}
                </span>
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-[#F3E4C6]/85 sm:text-base">
                Designed for wedding planners, couture invitation studios, and
                card shops. Manage client celebrations from one agency account
                with prepaid credits and white-label brand support.
              </p>
            </div>

            <Link
              href="/login?mode=signup"
              className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-xl bg-[#D7A955] px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#221204] shadow-md transition-colors hover:bg-[#E7C06B]"
            >
              Get Agency Access
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function PlanCard({
  plan,
  currency,
}: {
  plan: PricingPlan;
  currency: Currency;
}) {
  return (
    <div
      className={`flex flex-col justify-between rounded-2xl border p-6 transition-shadow sm:p-7 ${
        plan.highlighted
          ? "border-[#54121F] bg-[#FFFDF9] shadow-[0_18px_44px_rgba(84,18,31,0.12)]"
          : "border-[#B88433]/28 bg-[#FFFDF9] shadow-[0_4px_18px_rgba(48,12,20,0.04)]"
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-editorial text-2xl font-semibold text-[#470F1B]">
            {plan.name}
          </h4>
          {plan.badge && (
            <span className="shrink-0 rounded-full bg-[#54121F] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#F6DC9C]">
              {plan.badge}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="font-editorial text-4xl font-semibold text-[#221714]">
            {currency === "INR" ? plan.inr : plan.usd}
          </span>
          <span className="text-xs text-[#796258]">/ event</span>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-[#6C5950]">
          {plan.description}
        </p>

        <ul className="mt-5 space-y-2.5 border-t border-[#B88433]/20 pt-5">
          {plan.features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2.5 text-sm text-[#3F2F29]"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#B88433]" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link
        href="/login?mode=signup"
        className={`mt-7 inline-flex min-h-[46px] w-full items-center justify-center rounded-xl px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors ${
          plan.highlighted
            ? "bg-[#54121F] text-[#FBF7F0] hover:bg-[#3D0B16]"
            : "border border-[#54121F]/22 bg-[#FBF7F0] text-[#54121F] hover:bg-[#54121F] hover:text-[#FBF7F0]"
        }`}
      >
        {plan.ctaLabel}
      </Link>
    </div>
  );
}
