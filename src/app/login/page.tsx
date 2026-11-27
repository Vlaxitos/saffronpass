import React, { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in or create your SaffronPass host account.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-parchment px-4 py-12">
      <Suspense
        fallback={
          <div className="h-[460px] w-full max-w-md animate-pulse rounded-3xl border border-[#C88A2E]/25 bg-[#FFFDF8]" />
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
