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
      "Full Wax-Seal or Palace Doors opening",
      "Unlimited guest RSVPs & headcounts",
      "Custom URL slug & Google Maps links",
      "Zero preview watermark banner",
    ],
    ctaLabel: "Start with Free Preview",
  },
  {
    id: "celebration_pro",
    name: "Celebration Pro",
    inr: "₹699",
    usd: "$15",
    description:
      "Elevated single-day hosting with multiple guest circles and strict seat etiquette.",
    features: [
      "Everything in Celebration Pass",
      "Unlimited smart category links & seat caps",
      "Meal preference & guest notes tracking",
      "Priority host support",
    ],
    ctaLabel: "Start with Free Preview",
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
      "Live per-function headcount summary cards",
      "Anti-duplicate phone RSVP & edit memory",
    ],
    ctaLabel: "Start with Free Preview",
  },
  {
    id: "wedding_pro",
    name: "Wedding Pro",
    badge: "Most Popular",
    inr: "₹2,999",
    usd: "$59",
    highlighted: true,
    description:
      "Complete luxury command center for Bride & Groom families hosting grand weddings.",
    features: [
      "Unlimited sub-events & smart category links",
      "Bride's Side / Groom's Side / Common filters",
      "Solo, Couple & Saparivar seat etiquette caps",
      "Full RSVP moderation & priority concierge",
    ],
    ctaLabel: "Create Your Wedding Invite",
  },
  {
    id: "vip",
    name: "Done-For-You VIP",
    inr: "₹5,999+",
    usd: "$129+",
    description:
      "White-glove concierge where our studio designs, configures, and tests every invite link for you.",
    features: [
      "Everything in Wedding Pro included",
      "Dedicated studio setup for all ceremonies",
      "Custom family etiquette link structuring",
      "Direct WhatsApp concierge support",
    ],
    ctaLabel: "Start with Free Preview",
  },
];

export function PricingSection() {
  const [currency, setCurrency] = useState<Currency>("INR");

  return (
    <section id="pricing" className="border-t border-[#C88A2E]/20 bg-[#FAF3E8] py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* Section Header & Currency Toggle */}
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#C88A2E]">
              Transparent One-Time Pricing
            </p>
            <h2 className="mt-2 font-serif text-4xl font-semibold tracking-[-0.01em] text-[#4A101C] sm:text-5xl">
              Crafted for Every Celebration
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[#69564E]">
              Build and test your full animated invitation free before upgrading.
              No subscriptions—pay once per event.
            </p>
          </div>

          {/* India (INR) / Global (USD) Toggle */}
          <div
            className="inline-flex items-center rounded-full border border-[#C88A2E]/40 bg-[#FFFDF8] p-1 shadow-sm"
            role="group"
            aria-label="Currency selector"
          >
            <button
              type="button"
              onClick={() => setCurrency("INR")}
              className={`cursor-pointer rounded-full px-4 py-2 text-xs font-semibold tracking-[0.06em] transition-all ${
                currency === "INR"
                  ? "bg-[#5B1422] text-[#FCF8F1] shadow-sm"
                  : "text-[#5B1422] hover:bg-[#FCF5E8]"
              }`}
            >
              India (INR ₹)
            </button>
            <button
              type="button"
              onClick={() => setCurrency("USD")}
              className={`cursor-pointer rounded-full px-4 py-2 text-xs font-semibold tracking-[0.06em] transition-all ${
                currency === "USD"
                  ? "bg-[#5B1422] text-[#FCF8F1] shadow-sm"
                  : "text-[#5B1422] hover:bg-[#FCF5E8]"
              }`}
            >
              Global (USD $)
            </button>
          </div>
        </div>

        {/* Free Preview Banner Card */}
        <div className="mt-10 flex flex-col items-start justify-between gap-6 rounded-2xl border border-[#C88A2E]/35 bg-[#FFFDF8] p-6 shadow-[0_6px_26px_rgba(74,16,28,0.05)] sm:flex-row sm:items-center sm:p-8">
          <div>
            <div className="flex flex-wrap items-baseline gap-3">
              <h3 className="font-serif text-2xl font-semibold text-[#4A101C]">
                Free Preview
              </h3>
              <span className="font-serif text-3xl font-semibold text-[#C88A2E]">
                {currency === "INR" ? "₹0" : "$0"}
              </span>
            </div>
            <p className="mt-1.5 max-w-2xl text-sm text-[#69564E]">
              Design your entire invitation, test both Wax-Seal and Royal Palace
              Doors animations, create private guest-circle links, and collect up
              to 5 test RSVPs at zero cost.
            </p>
          </div>

          <Link
            href="/login?mode=signup"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#5B1422] px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#FCF8F1] transition-colors hover:bg-[#460E19]"
          >
            Create Free Invite
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Single-Day Events */}
        <div className="mt-12">
          <div className="mb-5 flex items-center gap-3">
            <h3 className="font-serif text-2xl font-semibold text-[#4A101C]">
              Single-Day Events
            </h3>
            <span className="h-px flex-1 bg-[#C88A2E]/25" />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {SINGLE_DAY_PLANS.map((plan) => (
              <PlanCard key={plan.id} plan={plan} currency={currency} />
            ))}
          </div>
        </div>

        {/* Multi-Day Weddings */}
        <div className="mt-12">
          <div className="mb-5 flex items-center gap-3">
            <h3 className="font-serif text-2xl font-semibold text-[#4A101C]">
              Multi-Day Weddings
            </h3>
            <span className="h-px flex-1 bg-[#C88A2E]/25" />
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {WEDDING_PLANS.map((plan) => (
              <PlanCard key={plan.id} plan={plan} currency={currency} />
            ))}
          </div>
        </div>

        {/* B2B Planner / Card-Shop Credit Pack */}
        <div className="mt-12 overflow-hidden rounded-3xl border border-[#E7C06B]/35 bg-royal-velvet p-7 text-[#FCF8F1] shadow-xl sm:p-10">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#E7C06B]">
                <Building2 className="h-4 w-4" />
                <span>B2B Planner &amp; Card-Shop Credit Pack</span>
              </div>
              <h3 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">
                10 Weddings for{" "}
                <span className="text-[#E7C06B]">
                  {currency === "INR" ? "₹4,999" : "$99"}
                </span>
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-[#F4E4C1]/85 sm:text-base">
                Designed for wedding planners, luxury invitation studios, and card
                shops. Manage multiple client celebrations from one agency account
                with prepaid credits and custom agency branding support.
              </p>
            </div>

            <Link
              href="/login?mode=signup"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#E0AD4F] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#281404] shadow-md transition-colors hover:bg-[#ECC16E]"
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
          ? "border-[#5B1422] bg-[#FFFDF8] shadow-[0_14px_38px_rgba(91,20,34,0.12)]"
          : "border-[#C88A2E]/30 bg-[#FFFDF8] shadow-[0_4px_20px_rgba(74,16,28,0.04)]"
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-serif text-2xl font-semibold text-[#4A101C]">
            {plan.name}
          </h4>
          {plan.badge && (
            <span className="rounded-full bg-[#5B1422] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#F6DC9C]">
              {plan.badge}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="font-serif text-4xl font-semibold text-[#241815]">
            {currency === "INR" ? plan.inr : plan.usd}
          </span>
          <span className="text-xs text-[#7A6258]">/ event</span>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-[#69564E]">
          {plan.description}
        </p>

        <ul className="mt-5 space-y-2.5 border-t border-[#C88A2E]/20 pt-5">
          {plan.features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2.5 text-sm text-[#3F2F29]"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#C88A2E]" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link
        href="/login?mode=signup"
        className={`mt-7 inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${
          plan.highlighted
            ? "bg-[#5B1422] text-[#FCF8F1] hover:bg-[#460E19]"
            : "border border-[#5B1422]/25 bg-[#FCF8F1] text-[#5B1422] hover:bg-[#5B1422] hover:text-[#FCF8F1]"
        }`}
      >
        {plan.ctaLabel}
      </Link>
    </div>
  );
}
