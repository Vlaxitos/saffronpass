import React from "react";
import Link from "next/link";
import { SaffronLogo } from "@/components/brand/SaffronLogo";

export default function InviteNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-parchment px-6 py-16 text-center">
      <div className="w-full max-w-md rounded-3xl border border-[#C88A2E]/35 bg-[#FFFDF8] p-8 shadow-[0_14px_45px_rgba(74,16,28,0.08)] sm:p-10">
        <div className="flex justify-center">
          <SaffronLogo />
        </div>

        <div className="mx-auto my-6 h-px w-16 bg-[#C88A2E]/45" />

        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#C88A2E]">
          Invitation Unavailable
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-[#4A101C]">
          This Seal Could Not Be Found
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#69564E]">
          The invitation link may have been mistyped, updated, or removed by the
          host. Please check the link shared with you or contact your host for a
          fresh invitation.
        </p>

        <div className="mt-7">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-[#5B1422] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#FCF8F1] transition-colors hover:bg-[#460E19]"
          >
            Return to SaffronPass
          </Link>
        </div>
      </div>
    </main>
  );
}
