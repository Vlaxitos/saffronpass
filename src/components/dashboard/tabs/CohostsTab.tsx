"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  addCohostAction,
  removeCohostAction,
} from "@/app/dashboard/actions";
import {
  getSideTagLabel,
  MAX_COHOSTS_PER_EVENT,
  SIDE_TAGS,
} from "@/lib/constants";
import type { EventCohostRecord, SideTag } from "@/types/database";

interface CohostsTabProps {
  eventId: string;
  isOwner: boolean;
  cohosts: EventCohostRecord[];
}

export function CohostsTab({ eventId, isOwner, cohosts }: CohostsTabProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sideTag, setSideTag] = useState<SideTag>("common");
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const slotsRemaining = Math.max(0, MAX_COHOSTS_PER_EVENT - cohosts.length);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await addCohostAction({
        event_id: eventId,
        email,
        side_tag: sideTag,
      });

      if (!res.ok) {
        toast.error(res.error || "Could not add Co-Host.");
        return;
      }

      toast.success(
        `Co-Host access granted to ${email.trim().toLowerCase()}.`
      );
      setEmail("");
      setSideTag("common");
      router.refresh();
    } catch {
      toast.error("Network error while adding Co-Host.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (cohostId: string, cohostEmail: string) => {
    setRemovingId(cohostId);
    try {
      const res = await removeCohostAction(eventId, cohostId);
      if (!res.ok) {
        toast.error(res.error || "Could not remove Co-Host.");
      } else {
        toast.success(`Removed Co-Host ${cohostEmail}.`);
        router.refresh();
      }
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* Invite Co-Host Form */}
      <section className="gold-shimmer-border rounded-2xl bg-[#FFFDF9] p-5 sm:p-6 lg:col-span-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-editorial text-2xl font-semibold text-[#470F1B]">
            Invite Family Co-Hosts
          </h2>
          <span className="rounded-full bg-[#FBF3E5] px-3 py-1 text-[11px] font-semibold text-[#8E5B17]">
            {cohosts.length} / {MAX_COHOSTS_PER_EVENT}
          </span>
        </div>

        <p className="mt-1.5 text-xs leading-relaxed text-[#6C5950]">
          Collaborate effortlessly with parents, siblings, or wedding planners.
          Co-Hosts can manage ceremonies, generate links, add manual phone
          RSVPs, and export caterer CSVs—while only you can delete the event or
          manage Co-Hosts.
        </p>

        {!isOwner ? (
          <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-[#B88433]/35 bg-[#FBF3E5] p-4 text-xs text-[#54121F]">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#B88433]" />
            <span>
              You are signed in as a <strong>Co-Host</strong> on this event.
              Only the primary event host can invite or remove Co-Hosts.
            </span>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="cohost-email"
                className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#54121F]"
              >
                Co-Host Email Address *
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9C897E]" />
                <input
                  id="cohost-email"
                  type="email"
                  required
                  disabled={slotsRemaining === 0}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="family.member@gmail.com"
                  className="min-h-[44px] w-full rounded-xl border border-[#B88433]/32 bg-white py-2.5 pl-10 pr-3.5 text-sm text-[#221714] focus:border-[#54121F] focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#54121F]">
                Assigned Side Tag
              </span>
              <div className="grid grid-cols-3 gap-2">
                {SIDE_TAGS.map((tag) => (
                  <button
                    key={tag.value}
                    type="button"
                    disabled={slotsRemaining === 0}
                    onClick={() => setSideTag(tag.value)}
                    className={`min-h-[42px] cursor-pointer rounded-xl border px-2 py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${
                      sideTag === tag.value
                        ? "border-[#54121F] bg-[#54121F] text-[#FBF7F0]"
                        : "border-[#B88433]/28 bg-white text-[#54121F] hover:bg-[#FBF3E5]"
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || slotsRemaining === 0}
              className="inline-flex min-h-[46px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#54121F] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FBF7F0] shadow-xs transition-colors hover:bg-[#3D0B16] disabled:cursor-not-allowed disabled:opacity-55"
            >
              <UserPlus className="h-4 w-4" />
              {slotsRemaining === 0
                ? "Co-Host Limit Reached (3/3)"
                : saving
                  ? "Inviting..."
                  : "Grant Co-Host Access"}
            </button>
          </form>
        )}
      </section>

      {/* Active Co-Hosts List */}
      <section className="space-y-4 lg:col-span-7">
        <div>
          <h2 className="font-editorial text-2xl font-semibold text-[#470F1B]">
            Active Co-Hosts ({cohosts.length})
          </h2>
          <p className="text-xs text-[#796258]">
            Co-Hosts simply sign in at SaffronPass using their invited email to
            view and manage this event.
          </p>
        </div>

        {cohosts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#B88433]/40 bg-[#FFFDF9] p-10 text-center">
            <Users className="mx-auto h-8 w-8 text-[#B88433]" />
            <p className="mt-3 font-editorial text-xl font-semibold text-[#470F1B]">
              No Co-Hosts Invited Yet
            </p>
            <p className="mt-1.5 text-sm text-[#6C5950]">
              Add up to 3 family members or wedding coordinators so both sides
              can track RSVPs in real time.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {cohosts.map((ch) => (
              <div
                key={ch.id}
                className="gold-shimmer-border flex flex-col gap-3 rounded-2xl bg-[#FFFDF9] p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#470F1B]">
                    {ch.email}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#FBF3E5] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8E5B17]">
                      {getSideTagLabel(ch.side_tag)}
                    </span>
                    <span className="text-[11px] text-[#796258]">
                      Can edit schedule, links &amp; RSVPs
                    </span>
                  </div>
                </div>

                {isOwner && (
                  <button
                    type="button"
                    disabled={removingId === ch.id}
                    onClick={() => handleRemove(ch.id, ch.email)}
                    className="inline-flex min-h-[42px] shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#8E1E31]/25 bg-white px-3.5 py-2 text-xs font-semibold text-[#8E1E31] transition-colors hover:bg-[#8E1E31]/8 disabled:opacity-45"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {removingId === ch.id ? "Removing..." : "Remove"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
