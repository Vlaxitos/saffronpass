"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";
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
      const msg =
        "Supabase environment variables are not configured yet. See SETUP.md to add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.";
      setErrorMessage(msg);
      toast.error(msg);
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
        toast.error(error.message);
        setGoogleLoading(false);
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Unable to start Google sign-in.";
      setErrorMessage(msg);
      toast.error(msg);
      setGoogleLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured) {
      const msg =
        "Supabase environment variables are not configured yet. See SETUP.md to connect your Supabase project.";
      setErrorMessage(msg);
      toast.error(msg);
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
          toast.error(error.message);
          return;
        }
        toast.success("Welcome back to SaffronPass.");
        router.push(nextPath);
        router.refresh();
      } else {
        if (password.length < 6) {
          const msg = "Password must be at least 6 characters long.";
          setErrorMessage(msg);
          toast.error(msg);
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
          toast.error(error.message);
          return;
        }

        if (data.session) {
          toast.success("Host account created! Entering your studio.");
          router.push(nextPath);
          router.refresh();
        } else {
          const msg =
            "Account created! Please check your inbox for the verification link to complete sign-in.";
          setInfoMessage(msg);
          toast.success("Verification email sent — check your inbox.");
        }
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Authentication failed. Please retry.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="texture-paper gold-shimmer-border w-full max-w-md rounded-[28px] bg-[#FFFDF9] p-6 sm:p-9">
      <div className="relative z-10">
        <div className="text-center">
          <Link href="/" className="inline-flex min-h-[44px] items-center">
            <SaffronLogo />
          </Link>
          <p className="mt-4 font-display text-[10px] font-semibold uppercase tracking-[0.26em] text-[#B88433]">
            Host Atelier
          </p>
          <h1 className="mt-1.5 font-editorial text-[clamp(1.85rem,4vw,2.25rem)] font-medium leading-tight text-[#3E0D17]">
            {mode === "signin" ? "Welcome Back, Host" : "Create Your Host Account"}
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-[#6C5950]">
            {mode === "signin"
              ? "Sign in to craft invitations and track live per-event RSVPs."
              : "Start crafting your interactive luxury invite free."}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="mt-6 grid grid-cols-2 rounded-full border border-[#B88433]/30 bg-[#FBF7F0] p-1">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setErrorMessage(null);
              setInfoMessage(null);
            }}
            className={`min-h-[44px] cursor-pointer rounded-full py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition-all ${
              mode === "signin"
                ? "bg-[#54121F] text-[#FBF7F0] shadow-sm"
                : "text-[#6C5950] hover:text-[#54121F]"
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
            className={`min-h-[44px] cursor-pointer rounded-full py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition-all ${
              mode === "signup"
                ? "bg-[#54121F] text-[#FBF7F0] shadow-sm"
                : "text-[#6C5950] hover:text-[#54121F]"
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
          <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-[#1B6343]/30 bg-[#1B6343]/8 p-3.5 text-xs leading-relaxed text-[#145236]">
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
          className="mt-6 flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-3 rounded-full border border-[#B88433]/35 bg-white px-4 py-3 text-sm font-semibold text-[#221714] shadow-sm transition-colors hover:border-[#B88433]/70 hover:bg-[#FCF5E8] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {googleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-[#B88433]" />
          ) : (
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
          )}
          <span>
            {googleLoading ? "Connecting to Google..." : "Continue with Google"}
          </span>
        </button>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-[#B88433]/25" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8E786C]">
            or with email
          </span>
          <span className="h-px flex-1 bg-[#B88433]/25" />
        </div>

        {/* Email + Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label
                htmlFor="auth-fullname"
                className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#54121F]"
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
                  className="min-h-[44px] w-full rounded-xl border border-[#B88433]/35 bg-white py-2.5 pl-10 pr-3.5 text-sm text-[#221714] placeholder:text-[#9A877D] focus:border-[#54121F] focus:outline-none focus:ring-2 focus:ring-[#B88433]/25"
                />
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="auth-email"
              className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#54121F]"
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
                className="min-h-[44px] w-full rounded-xl border border-[#B88433]/35 bg-white py-2.5 pl-10 pr-3.5 text-sm text-[#221714] placeholder:text-[#9A877D] focus:border-[#54121F] focus:outline-none focus:ring-2 focus:ring-[#B88433]/25"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#54121F]"
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
                className="min-h-[44px] w-full rounded-xl border border-[#B88433]/35 bg-white py-2.5 pl-10 pr-3.5 text-sm text-[#221714] placeholder:text-[#9A877D] focus:border-[#54121F] focus:outline-none focus:ring-2 focus:ring-[#B88433]/25"
              />
            </div>
          </div>

          <button
            type="submit"
            id="email-auth-submit-btn"
            disabled={loading || googleLoading}
            className="inline-flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#54121F] px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FBF7F0] shadow-[0_10px_26px_rgba(84,18,31,0.22)] transition-all hover:bg-[#3E0D17] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>
              {loading
                ? mode === "signin"
                  ? "Signing In..."
                  : "Creating Account..."
                : mode === "signin"
                  ? "Sign In with Email"
                  : "Create Free Account"}
            </span>
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center text-xs font-medium text-[#7A6258] transition-colors hover:text-[#54121F]"
          >
            ← Back to SaffronPass Home
          </Link>
        </div>
      </div>
    </div>
  );
}
