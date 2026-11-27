"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, UserPlus, X } from "lucide-react";
import { addManualRsvpAction } from "@/app/dashboard/actions";
import { getSideTagLabel, MEAL_PREFERENCES } from "@/lib/constants";
import type {
  InviteCategoryRecord,
  SubEventRecord,
} from "@/types/database";

interface ManualGuestModalProps {
  open: boolean;
  onClose: () => void;
  eventId: string;
  subEvents: SubEventRecord[];
  categories: InviteCategoryRecord[];
}

export function ManualGuestModal({
  open,
  onClose,
  eventId,
  subEvents,
  categories,
}: ManualGuestModalProps) {
  const router = useRouter();

  const [guestName, setGuestName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id ?? "");
  const [overallAttending, setOverallAttending] = useState(true);
  const [mealPreference, setMealPreference] = useState("Veg");
  const [note, setNote] = useState("");
  const [subEventSelections, setSubEventSelections] = useState<
    Record<string, { attending: boolean; guestCount: number }>
  >(() =>
    subEvents.reduce<Record<string, { attending: boolean; guestCount: number }>>(
      (acc, se) => {
        acc[se.id] = { attending: true, guestCount: 2 };
        return acc;
      },
      {}
    )
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const res = await addManualRsvpAction({
        event_id: eventId,
        guest_name: guestName,
        phone_number: phoneNumber,
        category_id: categoryId || null,
        overall_attending: overallAttending,
        meal_preference: overallAttending ? mealPreference : "",
        note,
        sub_events: subEvents.map((se) => {
          const current = subEventSelections[se.id] ?? {
            attending: true,
            guestCount: 1,
          };
          return {
            sub_event_id: se.id,
            attending: overallAttending && current.attending,
            guest_count:
              overallAttending && current.attending ? current.guestCount : 0,
          };
        }),
      });

      if (!res.ok) {
        setError(res.error || "Could not add manual guest.");
        return;
      }

      onClose();
      router.refresh();
    } catch {
      setError("Network error while saving manual guest.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#23070D]/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Add Guest Manually"
    >
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-[#C88A2E]/40 bg-[#FFFDF8] p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#C88A2E]">
              Phone / Offline Confirmation
            </p>
            <h2 className="mt-1 font-serif text-3xl font-semibold text-[#4A101C]">
              Add Guest Manually
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close manual guest modal"
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#C88A2E]/30 text-[#5B1422] hover:bg-[#FCF5E8]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-1.5 text-xs text-[#69564E]">
          Log relatives or elders who confirmed via phone call so your caterer
          headcounts stay 100% accurate.
        </p>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#8E1E31]/30 bg-[#8E1E31]/8 p-3 text-xs text-[#6B1222]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="manual-guest-name"
                className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]"
              >
                Guest / Family Name *
              </label>
              <input
                id="manual-guest-name"
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g., Mama Ji & Family"
                className="w-full rounded-xl border border-[#C88A2E]/35 bg-white px-3.5 py-2.5 text-sm text-[#241815] focus:border-[#5B1422] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="manual-guest-phone"
                className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]"
              >
                Phone Number (Optional)
              </label>
              <input
                id="manual-guest-phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Leave blank if unavailable"
                className="w-full rounded-xl border border-[#C88A2E]/35 bg-white px-3.5 py-2.5 text-sm text-[#241815] focus:border-[#5B1422] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="manual-guest-category"
                className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]"
              >
                Category / Side Tag
              </label>
              <select
                id="manual-guest-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-[#C88A2E]/35 bg-white px-3 py-2.5 text-sm text-[#241815] focus:border-[#5B1422] focus:outline-none"
              >
                <option value="">Uncategorized (Common)</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({getSideTagLabel(cat.side_tag)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]">
                Status
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOverallAttending(true)}
                  className={`cursor-pointer rounded-xl border py-2.5 text-xs font-semibold transition-colors ${
                    overallAttending
                      ? "border-[#1F6E4A] bg-[#1F6E4A] text-white"
                      : "border-[#C88A2E]/30 bg-white text-[#5B1422]"
                  }`}
                >
                  Attending
                </button>
                <button
                  type="button"
                  onClick={() => setOverallAttending(false)}
                  className={`cursor-pointer rounded-xl border py-2.5 text-xs font-semibold transition-colors ${
                    !overallAttending
                      ? "border-[#5B1422] bg-[#5B1422] text-white"
                      : "border-[#C88A2E]/30 bg-white text-[#69564E]"
                  }`}
                >
                  Declined
                </button>
              </div>
            </div>
          </div>

          {/* Per-Event Headcounts */}
          {overallAttending && subEvents.length > 0 && (
            <div>
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]">
                Ceremony Attendance &amp; Headcount
              </span>
              <div className="space-y-2 rounded-xl border border-[#C88A2E]/25 bg-[#FCF8F1] p-3">
                {subEvents.map((se) => {
                  const sel = subEventSelections[se.id] ?? {
                    attending: true,
                    guestCount: 2,
                  };
                  return (
                    <div
                      key={se.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-3 py-2.5"
                    >
                      <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-[#4A101C]">
                        <input
                          type="checkbox"
                          checked={sel.attending}
                          onChange={(e) =>
                            setSubEventSelections((prev) => ({
                              ...prev,
                              [se.id]: {
                                attending: e.target.checked,
                                guestCount: prev[se.id]?.guestCount || 1,
                              },
                            }))
                          }
                          className="h-4 w-4 accent-[#1F6E4A]"
                        />
                        {se.name}
                      </label>

                      {sel.attending ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-[#7A6258]">
                            Guests:
                          </span>
                          <input
                            type="number"
                            min={1}
                            max={50}
                            value={sel.guestCount}
                            onChange={(e) =>
                              setSubEventSelections((prev) => ({
                                ...prev,
                                [se.id]: {
                                  attending: true,
                                  guestCount: Math.max(
                                    1,
                                    Math.min(50, Number(e.target.value) || 1)
                                  ),
                                },
                              }))
                            }
                            className="w-16 rounded-lg border border-[#C88A2E]/40 bg-white px-2 py-1 text-center text-xs font-semibold text-[#4A101C]"
                          />
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#9A8579]">
                          Not attending
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {overallAttending && (
            <div>
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]">
                Meal Preference
              </span>
              <div className="flex flex-wrap gap-2">
                {MEAL_PREFERENCES.map((meal) => (
                  <button
                    key={meal}
                    type="button"
                    onClick={() =>
                      setMealPreference(mealPreference === meal ? "" : meal)
                    }
                    className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                      mealPreference === meal
                        ? "border-[#C88A2E] bg-[#C88A2E] text-[#241405]"
                        : "border-[#C88A2E]/35 bg-white text-[#5B1422]"
                    }`}
                  >
                    {meal}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="manual-guest-note"
              className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]"
            >
              Notes (Optional)
            </label>
            <input
              id="manual-guest-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Confirmed on phone call with Dad, arriving Friday evening"
              className="w-full rounded-xl border border-[#C88A2E]/35 bg-white px-3.5 py-2.5 text-sm text-[#241815] focus:border-[#5B1422] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-xl border border-[#C88A2E]/35 bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422] hover:bg-[#FCF5E8]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#5B1422] px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#FCF8F1] shadow-sm transition-colors hover:bg-[#460E19] disabled:opacity-60"
            >
              <UserPlus className="h-3.5 w-3.5" />
              {saving ? "Saving..." : "Save Manual Guest"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
