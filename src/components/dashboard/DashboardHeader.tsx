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
    <header className="glass-luxury sticky top-0 z-30 border-x-0 border-t-0">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/dashboard"
          aria-label="SaffronPass Host Dashboard"
          className="inline-flex min-h-[44px] items-center"
        >
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
              className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-full border border-[#B88433]/35 bg-[#FFFDF9] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#54121F] transition-all hover:border-[#54121F] hover:bg-[#FCF5E8]"
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
