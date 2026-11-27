import React, { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InviteExperience } from "@/components/invite/InviteExperience";
import { getPublicInviteBySlugAndCode } from "@/lib/invite-server";
import { getSiteUrl } from "@/lib/supabase/env";
import { formatEventDate, getSafeExternalUrl } from "@/lib/utils";

interface InvitePageProps {
  params: Promise<{ slug: string; code: string }>;
}

/**
 * Rich Open Graph & WhatsApp preview metadata with ZERO private sub-event leakage.
 * NEVER includes sub-event names (e.g., Haldi/Cocktail) or internal category names.
 */
export async function generateMetadata({
  params,
}: InvitePageProps): Promise<Metadata> {
  const { slug, code } = await params;
  const invite = await getPublicInviteBySlugAndCode(slug, code);

  if (!invite) {
    return {
      title: "Invitation Not Found",
      description: "This SaffronPass invitation link could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const siteUrl = getSiteUrl();
  const formattedDate = invite.event.event_date
    ? formatEventDate(invite.event.event_date)
    : null;

  const fullTitle = `${invite.event.host_names} — ${invite.event.title} | SaffronPass`;
  const safeDescription = formattedDate
    ? `You are warmly invited to celebrate with us on ${formattedDate}. Tap to open your interactive invitation.`
    : "You are warmly invited to celebrate with us. Tap to open your interactive invitation.";

  const coverUrl = getSafeExternalUrl(invite.event.cover_image_url);
  const ogFallbackUrl = new URL("/api/og", siteUrl);
  ogFallbackUrl.searchParams.set("names", invite.event.host_names);
  ogFallbackUrl.searchParams.set("title", invite.event.title);
  if (formattedDate) {
    ogFallbackUrl.searchParams.set("date", formattedDate);
  }
  ogFallbackUrl.searchParams.set("theme", String(invite.event.theme_id));

  const ogImageUrl = coverUrl ?? ogFallbackUrl.toString();
  const canonicalUrl = `${siteUrl}/${invite.event.slug}/${invite.category.code}`;

  return {
    title: {
      absolute: fullTitle,
    },
    description: safeDescription,
    robots: { index: false, follow: false },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      siteName: "SaffronPass",
      title: fullTitle,
      description: safeDescription,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${invite.event.host_names} — ${invite.event.title}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: safeDescription,
      images: [ogImageUrl],
    },
  };
}

function InviteLoadingShell() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-royal-velvet px-6 text-center">
      <div className="space-y-4">
        <div className="mx-auto h-14 w-14 animate-pulse rounded-full border border-[#E7C06B]/50 bg-[#C88A2E]/25" />
        <p className="font-serif text-xl tracking-[0.06em] text-[#F4E4C1]">
          Unsealing Your Invitation...
        </p>
      </div>
    </div>
  );
}

async function InviteLoader({ params }: InvitePageProps) {
  const { slug, code } = await params;
  const invite = await getPublicInviteBySlugAndCode(slug, code);

  if (!invite) {
    notFound();
  }

  return <InviteExperience invite={invite} />;
}

export default function PublicInvitePage({ params }: InvitePageProps) {
  return (
    <Suspense fallback={<InviteLoadingShell />}>
      <InviteLoader params={params} />
    </Suspense>
  );
}
