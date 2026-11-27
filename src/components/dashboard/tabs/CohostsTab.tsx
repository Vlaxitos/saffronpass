"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Mail,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
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
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const slotsRemaining = Math.max(0, MAX_COHOSTS_PER_EVENT - cohosts.length);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setSaving(true);

    try {
      const res = await addCohostAction({
        event_id: eventId,
        email,
        side_tag: sideTag,
      });

      if (!res.ok) {
        setError(res.error || "Could not add Co-Host.");
        return;
      }

      setEmail("");
      setSideTag("common");
      setNotice(
        "Co-Host added! When they sign in with that email address, this celebration will appear automatically under 'Shared With Me'."
      );
      router.refresh();
    } catch {
      setError("Network error while adding Co-Host.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (cohostId: string) => {
    setRemovingId(cohostId);
    setError(null);
    setNotice(null);
    try {
      const res = await removeCohostAction(eventId, cohostId);
      if (!res.ok) {
        setError(res.error || "Could not remove Co-Host.");
      } else {
        router.refresh();
      }
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* Invite Co-Host Form (Primary Host Owner Only) */}
      <section className="rounded-2xl border border-[#C88A2E]/30 bg-[#FFFDF8] p-5 sm:p-6 lg:col-span-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-serif text-2xl font-semibold text-[#4A101C]">
            Invite Family Co-Hosts
          </h2>
          <span className="rounded-full bg-[#FCF5E8] px-3 py-1 text-[11px] font-semibold text-[#8E5B17]">
            {cohosts.length} / {MAX_COHOSTS_PER_EVENT}
          </span>
        </div>

        <p className="mt-1.5 text-xs leading-relaxed text-[#69564E]">
          Collaborate effortlessly with parents, siblings, or wedding planners.
          Co-Hosts can manage ceremonies, generate category links, add manual
          phone RSVPs, and export caterer CSVs—while only you can delete the
          event or manage Co-Hosts.
        </p>

        {!isOwner ? (
          <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-[#C88A2E]/35 bg-[#FCF5E8] p-4 text-xs text-[#5B1422]">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#C88A2E]" />
            <span>
              You are signed in as a <strong>Co-Host</strong> on this event.
              Only the primary event host can invite or remove Co-Hosts.
            </span>
          </div>
        ) : (
          <>
            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#8E1E31]/30 bg-[#8E1E31]/8 p-3 text-xs text-[#6B1222]">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {notice && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#1F6E4A]/30 bg-[#1F6E4A]/8 p-3 text-xs text-[#175438]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{notice}</span>
              </div>
            )}

            <form onSubmit={handleInvite} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="cohost-email"
                  className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]"
                >
                  Co-Host Email Address *
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A8579]" />
                  <input
                    id="cohost-email"
                    type="email"
                    required
                    disabled={slotsRemaining === 0}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="family.member@gmail.com"
                    className="w-full rounded-xl border border-[#C88A2E]/35 bg-white py-2.5 pl-10 pr-3.5 text-sm text-[#241815] focus:border-[#5B1422] focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]">
                  Assigned Side Tag
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {SIDE_TAGS.map((tag) => (
                    <button
                      key={tag.value}
                      type="button"
                      disabled={slotsRemaining === 0}
                      onClick={() => setSideTag(tag.value)}
                      className={`cursor-pointer rounded-xl border px-2.5 py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${
                        sideTag === tag.value
                          ? "border-[#5B1422] bg-[#5B1422] text-[#FCF8F1]"
                          : "border-[#C88A2E]/30 bg-white text-[#5B1422] hover:bg-[#FCF5E8]"
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
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#5B1422] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#FCF8F1] shadow-sm transition-colors hover:bg-[#460E19] disabled:cursor-not-allowed disabled:opacity-55"
              >
                <UserPlus className="h-4 w-4" />
                {slotsRemaining === 0
                  ? "Co-Host Limit Reached (3/3)"
                  : saving
                    ? "Inviting..."
                    : "Grant Co-Host Access"}
              </button>
            </form>
          </>
        )}
      </section>

      {/* Active Co-Hosts List */}
      <section className="space-y-4 lg:col-span-7">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#4A101C]">
            Active Co-Hosts ({cohosts.length})
          </h2>
          <p className="text-xs text-[#7A6258]">
            Co-Hosts simply sign in at SaffronPass using their invited email to
            view and manage this event.
          </p>
        </div>

        {cohosts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#C88A2E]/40 bg-[#FFFDF8] p-10 text-center">
            <Users className="mx-auto h-8 w-8 text-[#C88A2E]" />
            <p className="mt-3 font-serif text-xl font-semibold text-[#4A101C]">
              No Co-Hosts Invited Yet
            </p>
            <p className="mt-1.5 text-sm text-[#69564E]">
              Add up to 3 family members or wedding coordinators so both sides
              can track RSVPs in real time.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {cohosts.map((ch) => (
              <div
                key={ch.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-[#C88A2E]/30 bg-[#FFFDF8] p-5 shadow-2xs"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#4A101C]">
                    {ch.email}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="rounded-full bg-[#FCF5E8] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8E5B17]">
                      {getSideTagLabel(ch.side_tag)}
                    </span>
                    <span className="text-[11px] text-[#7A6258]">
                      Can edit schedule, links &amp; RSVPs
                    </span>
                  </div>
                </div>

                {isOwner && (
                  <button
                    type="button"
                    disabled={removingId === ch.id}
                    onClick={() => handleRemove(ch.id)}
                    className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-[#8E1E31]/25 bg-white px-3 py-2 text-xs font-semibold text-[#8E1E31] transition-colors hover:bg-[#8E1E31]/8 disabled:opacity-45"
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
