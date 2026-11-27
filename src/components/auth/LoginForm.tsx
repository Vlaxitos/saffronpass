"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Mail, Lock, User } from "lucide-react";
import { SaffronLogo } from "@/components/brand/SaffronLogo";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSafeNextPath } from "@/lib/utils";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const nextPath = getSafeNextPath(searchParams.get("next"), "/dashboard");
  const callbackError = searchParams.get("error");

  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    callbackError === "auth_callback_failed"
      ? "Sign-in callback could not be completed. Please try signing in again."
      : null
  );
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const configured = isSupabaseConfigured();

  const handleGoogleSignIn = async () => {
    if (!configured) {
      setErrorMessage(
        "Supabase environment variables are not configured yet. See SETUP.md to add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
      );
      return;
    }

    setErrorMessage(null);
    setInfoMessage(null);
    setGoogleLoading(true);
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });
      if (error) {
        setErrorMessage(error.message);
        setGoogleLoading(false);
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Unable to start Google sign-in."
      );
      setGoogleLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured) {
      setErrorMessage(
        "Supabase environment variables are not configured yet. See SETUP.md to connect your Supabase project."
      );
      return;
    }

    setErrorMessage(null);
    setInfoMessage(null);
    setLoading(true);

    try {
      const supabase = createClient();

      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) {
          setErrorMessage(error.message);
          return;
        }
        router.push(nextPath);
        router.refresh();
      } else {
        if (password.length < 6) {
          setErrorMessage("Password must be at least 6 characters long.");
          return;
        }

        const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: redirectTo,
            data: {
              full_name: fullName.trim() || undefined,
            },
          },
        });

        if (error) {
          setErrorMessage(error.message);
          return;
        }

        if (data.session) {
          router.push(nextPath);
          router.refresh();
        } else {
          setInfoMessage(
            "Account created! Please check your inbox for the verification link to complete sign-in."
          );
        }
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Authentication failed. Please retry."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-[#C88A2E]/35 bg-[#FFFDF8] p-7 shadow-[0_18px_50px_rgba(74,16,28,0.09)] sm:p-9">
      <div className="text-center">
        <Link href="/" className="inline-block">
          <SaffronLogo />
        </Link>
        <h1 className="mt-5 font-serif text-3xl font-semibold text-[#4A101C]">
          {mode === "signin" ? "Welcome Back, Host" : "Create Your Host Account"}
        </h1>
        <p className="mt-1.5 text-sm text-[#69564E]">
          {mode === "signin"
            ? "Sign in to craft invitations and track live per-event RSVPs."
            : "Start building your interactive luxury invite free."}
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="mt-6 grid grid-cols-2 rounded-xl border border-[#C88A2E]/30 bg-[#FCF8F1] p-1">
        <button
          type="button"
          onClick={() => {
            setMode("signin");
            setErrorMessage(null);
            setInfoMessage(null);
          }}
          className={`cursor-pointer rounded-lg py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
            mode === "signin"
              ? "bg-[#5B1422] text-[#FCF8F1] shadow-sm"
              : "text-[#69564E] hover:text-[#5B1422]"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setErrorMessage(null);
            setInfoMessage(null);
          }}
          className={`cursor-pointer rounded-lg py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
            mode === "signup"
              ? "bg-[#5B1422] text-[#FCF8F1] shadow-sm"
              : "text-[#69564E] hover:text-[#5B1422]"
          }`}
        >
          Sign Up
        </button>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-2.5 rounded-xl border border-[#8E1E31]/30 bg-[#8E1E31]/8 p-3.5 text-xs leading-relaxed text-[#6B1222]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {infoMessage && (
        <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-[#1F6E4A]/30 bg-[#1F6E4A]/8 p-3.5 text-xs leading-relaxed text-[#175438]">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{infoMessage}</span>
        </div>
      )}

      {/* Continue with Google */}
      <button
        type="button"
        id="google-oauth-btn"
        onClick={handleGoogleSignIn}
        disabled={googleLoading || loading}
        className="mt-6 flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-[#C88A2E]/40 bg-white px-4 py-3 text-sm font-semibold text-[#241815] shadow-sm transition-colors hover:bg-[#FCF5E8] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        <span>{googleLoading ? "Connecting to Google..." : "Continue with Google"}</span>
      </button>

      {/* Divider */}
      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-[#C88A2E]/25" />
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#8E786C]">
          or with email
        </span>
        <span className="h-px flex-1 bg-[#C88A2E]/25" />
      </div>

      {/* Email + Password Form */}
      <form onSubmit={handleEmailAuth} className="space-y-4">
        {mode === "signup" && (
          <div>
            <label
              htmlFor="auth-fullname"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]"
            >
              Your Name
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A8579]" />
              <input
                id="auth-fullname"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., Meera Sharma"
                className="w-full rounded-xl border border-[#C88A2E]/35 bg-white py-2.5 pl-10 pr-3.5 text-sm text-[#241815] placeholder:text-[#9A877D] focus:border-[#5B1422] focus:outline-none focus:ring-2 focus:ring-[#C88A2E]/25"
              />
            </div>
          </div>
        )}

        <div>
          <label
            htmlFor="auth-email"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A8579]" />
            <input
              id="auth-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-[#C88A2E]/35 bg-white py-2.5 pl-10 pr-3.5 text-sm text-[#241815] placeholder:text-[#9A877D] focus:border-[#5B1422] focus:outline-none focus:ring-2 focus:ring-[#C88A2E]/25"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="auth-password"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A8579]" />
            <input
              id="auth-password"
              type="password"
              required
              minLength={6}
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full rounded-xl border border-[#C88A2E]/35 bg-white py-2.5 pl-10 pr-3.5 text-sm text-[#241815] placeholder:text-[#9A877D] focus:border-[#5B1422] focus:outline-none focus:ring-2 focus:ring-[#C88A2E]/25"
            />
          </div>
        </div>

        <button
          type="submit"
          id="email-auth-submit-btn"
          disabled={loading || googleLoading}
          className="w-full cursor-pointer rounded-xl bg-[#5B1422] px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#FCF8F1] shadow-md transition-colors hover:bg-[#460E19] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? mode === "signin"
              ? "Signing In..."
              : "Creating Account..."
            : mode === "signin"
              ? "Sign In with Email"
              : "Create Free Account"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/"
          className="text-xs font-medium text-[#7A6258] transition-colors hover:text-[#5B1422]"
        >
          ← Back to SaffronPass Home
        </Link>
      </div>
    </div>
  );
}
