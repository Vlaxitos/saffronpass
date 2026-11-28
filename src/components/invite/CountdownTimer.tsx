"use client";

import React, { useEffect, useState } from "react";
import { getInviteTheme } from "@/lib/theme-styles";

interface CountdownTimerProps {
  eventDate: string | null;
  themeId?: string;
}

interface TimeRemaining {
  status: "upcoming" | "today" | "past";
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateRemaining(dateStr: string): TimeRemaining {
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return { status: "today", days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const [year, month, day] = parts;
  const now = new Date();
  const targetStart = new Date(year, month - 1, day, 0, 0, 0);
  const targetEnd = new Date(year, month - 1, day, 23, 59, 59);

  if (now >= targetStart && now <= targetEnd) {
    return { status: "today", days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  if (now > targetEnd) {
    return { status: "past", days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const diffMs = targetStart.getTime() - now.getTime();
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { status: "upcoming", days, hours, minutes, seconds };
}

export function CountdownTimer({ eventDate, themeId }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState<TimeRemaining | null>(null);
  const theme = getInviteTheme(themeId);

  useEffect(() => {
    if (!eventDate) return;
    const update = () => setRemaining(calculateRemaining(eventDate));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [eventDate]);

  if (!eventDate) return null;

  if (remaining?.status === "today") {
    return (
      <div
        className={`mx-auto mt-6 inline-flex items-center rounded-full border px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] ${theme.pillBg} ${theme.pillText}`}
      >
        Celebrating Today
      </div>
    );
  }

  if (remaining?.status === "past") {
    return (
      <div
        className={`mx-auto mt-6 inline-flex items-center rounded-full border px-5 py-2 text-[10px] font-medium uppercase tracking-[0.22em] ${theme.pillBg} ${theme.mutedText}`}
      >
        Celebrated with Joy
      </div>
    );
  }

  const cells = [
    { value: remaining ? String(remaining.days).padStart(2, "0") : "--", label: "Days" },
    { value: remaining ? String(remaining.hours).padStart(2, "0") : "--", label: "Hours" },
    { value: remaining ? String(remaining.minutes).padStart(2, "0") : "--", label: "Mins" },
    { value: remaining ? String(remaining.seconds).padStart(2, "0") : "--", label: "Secs" },
  ];

  return (
    <div
      className={`mx-auto mt-6 grid max-w-[340px] grid-cols-4 divide-x rounded-2xl border py-3.5 ${theme.countdownCell} ${
        theme.isDark ? "divide-[#E2BD72]/20" : "divide-[#B88433]/22"
      }`}
      aria-label="Countdown to the main celebration"
    >
      {cells.map((cell) => (
        <div key={cell.label} className="px-1.5 text-center">
          <div
            className={`font-editorial text-2xl font-semibold tabular-nums leading-none sm:text-[28px] ${theme.countdownValue}`}
          >
            {cell.value}
          </div>
          <div
            className={`mt-1.5 text-[9px] font-semibold uppercase tracking-[0.22em] ${theme.mutedText}`}
          >
            {cell.label}
          </div>
        </div>
      ))}
    </div>
  );
}
