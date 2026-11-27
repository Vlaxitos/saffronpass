import React from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { SaffronLogo } from "@/components/brand/SaffronLogo";
import { signOutAction } from "@/app/dashboard/actions";

interface DashboardHeaderProps {
  userName: string;
  userEmail: string;
}

export function DashboardHeader({ userName, userEmail }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#C88A2E]/25 bg-[#FCF8F1]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <Link href="/dashboard" aria-label="SaffronPass Host Dashboard">
          <SaffronLogo />
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-semibold text-[#4A101C]">{userName}</p>
            <p className="text-[11px] text-[#7A6258]">{userEmail}</p>
          </div>

          <form action={signOutAction}>
            <button
              type="submit"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#C88A2E]/35 bg-white px-3.5 py-2 text-xs font-semibold text-[#5B1422] transition-colors hover:border-[#5B1422] hover:bg-[#FCF5E8]"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
