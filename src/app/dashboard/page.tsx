import React, { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import {
  DashboardEventsClient,
  type DashboardEventSummary,
} from "@/components/dashboard/DashboardEventsClient";
import { createClient } from "@/lib/supabase/server";
import type { EventRecord, SideTag } from "@/types/database";

export const metadata: Metadata = {
  title: "Host Dashboard",
  description: "Manage your SaffronPass animated invitations and RSVPs.",
};

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-parchment">
      <div className="h-16 border-b border-[#C88A2E]/20 bg-[#FCF8F1]" />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="h-10 w-64 animate-pulse rounded-xl bg-[#EFE5D5]" />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-56 animate-pulse rounded-2xl border border-[#C88A2E]/20 bg-[#FFFDF8]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

async function DashboardLoader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  // RLS policy public.can_manage_event(id) returns BOTH owned events and Co-Hosted events
  const [{ data: profile }, { data: rawEvents }, { data: cohostEntries }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("events")
        .select(
          "*, sub_events(count), invite_categories(count), rsvps(count)"
        )
        .order("created_at", { ascending: false }),
      user.email
        ? supabase
            .from("event_cohosts")
            .select("event_id, side_tag")
            .eq("email", user.email.toLowerCase())
        : Promise.resolve({ data: [] as { event_id: string; side_tag: SideTag }[] }),
    ]);

  const userEmail = profile?.email || user.email || "";
  const userName =
    profile?.full_name ||
    (user.user_metadata?.full_name as string | undefined) ||
    userEmail.split("@")[0] ||
    "Host";

  const cohostSideMap = new Map<string, SideTag>();
  for (const row of (cohostEntries as { event_id: string; side_tag: SideTag }[] | null) ?? []) {
    cohostSideMap.set(row.event_id, row.side_tag);
  }

  interface RawEventWithCounts extends EventRecord {
    sub_events?: { count: number }[];
    invite_categories?: { count: number }[];
    rsvps?: { count: number }[];
  }

  const allSummaries: DashboardEventSummary[] = (
    (rawEvents as RawEventWithCounts[] | null) ?? []
  ).map((ev) => ({
    ...ev,
    sub_events_count: ev.sub_events?.[0]?.count ?? 0,
    categories_count: ev.invite_categories?.[0]?.count ?? 0,
    rsvps_count: ev.rsvps?.[0]?.count ?? 0,
    is_cohost: ev.host_id !== user.id,
    cohost_side_tag: cohostSideMap.get(ev.id) ?? null,
  }));

  const myEvents = allSummaries.filter((ev) => !ev.is_cohost);
  const sharedEvents = allSummaries.filter((ev) => ev.is_cohost);

  return (
    <div className="flex min-h-screen flex-col bg-parchment">
      <DashboardHeader userName={userName} userEmail={userEmail} />
      <DashboardEventsClient
        myEvents={myEvents}
        sharedEvents={sharedEvents}
        hostName={userName}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardLoader />
    </Suspense>
  );
}
