import React, { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InviteExperience } from "@/components/invite/InviteExperience";
import { getPublicInviteBySlugAndCode } from "@/lib/invite-server";

interface InvitePageProps {
  params: Promise<{ slug: string; code: string }>;
}

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

  return {
    title: `${invite.event.host_names} — ${invite.event.title}`,
    description:
      invite.event.welcome_message?.slice(0, 155) ||
      `You are warmly invited to ${invite.event.title}.`,
    robots: { index: false, follow: false },
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
