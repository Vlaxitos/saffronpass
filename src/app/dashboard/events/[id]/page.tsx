import React, { Suspense } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { EventEditorClient } from "@/components/dashboard/EventEditorClient";
import { createClient } from "@/lib/supabase/server";
import type {
  EventRecord,
  InviteCategoryRecord,
  RsvpRecord,
  SubEventRecord,
} from "@/types/database";

export const metadata: Metadata = {
  title: "Event Editor",
  description: "Customize your SaffronPass invitation, ceremonies, links, and live RSVPs.",
};

interface EventEditorPageProps {
  params: Promise<{ id: string }>;
}

function EditorSkeleton() {
  return (
    <div className="min-h-screen bg-parchment">
      <div className="h-16 border-b border-[#C88A2E]/20 bg-[#FCF8F1]" />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="h-10 w-72 animate-pulse rounded-xl bg-[#EFE5D5]" />
        <div className="mt-6 h-12 w-full animate-pulse rounded-xl bg-[#EFE5D5]" />
        <div className="mt-6 h-96 w-full animate-pulse rounded-2xl bg-[#FFFDF8]" />
      </div>
    </div>
  );
}

async function EventEditorLoader({ params }: EventEditorPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/dashboard/events/${id}`);
  }

  const [{ data: profile }, { data: eventRow, error: eventError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .eq("host_id", user.id)
        .maybeSingle(),
    ]);

  if (eventError || !eventRow) {
    notFound();
  }

  const [{ data: subEvents }, { data: categories }, { data: rsvps }] =
    await Promise.all([
      supabase
        .from("sub_events")
        .select("*")
        .eq("event_id", eventRow.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("invite_categories")
        .select("*")
        .eq("event_id", eventRow.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("rsvps")
        .select("*, rsvp_sub_events(*)")
        .eq("event_id", eventRow.id)
        .order("updated_at", { ascending: false }),
    ]);

  const userEmail = profile?.email || user.email || "";
  const userName =
    profile?.full_name ||
    (user.user_metadata?.full_name as string | undefined) ||
    userEmail.split("@")[0] ||
    "Host";

  return (
    <div className="flex min-h-screen flex-col bg-parchment">
      <DashboardHeader userName={userName} userEmail={userEmail} />
      <EventEditorClient
        event={eventRow as EventRecord}
        subEvents={(subEvents as SubEventRecord[] | null) ?? []}
        categories={(categories as InviteCategoryRecord[] | null) ?? []}
        rsvps={(rsvps as RsvpRecord[] | null) ?? []}
      />
    </div>
  );
}

export default function EventEditorPage({ params }: EventEditorPageProps) {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <EventEditorLoader params={params} />
    </Suspense>
  );
}
