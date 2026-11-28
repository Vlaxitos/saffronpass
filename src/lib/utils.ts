import type { EtiquetteType } from "@/types/database";

const CODE_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

/**
 * Generates an unguessable 8-character lowercase alphanumeric secret code.
 * Uses Web Crypto API so it works safely in both browser and Node/Edge runtimes.
 */
export function generateInviteCode(length = 8): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return out;
}

/**
 * Converts freeform text into a clean URL-safe lowercase slug matching the SQL constraint.
 */
export function slugify(input: string): string {
  const cleaned = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 68);
  return cleaned;
}

/**
 * Generates a unique-friendly starter slug by appending a short 4-char suffix if needed.
 */
export function buildDefaultSlug(titleOrNames: string): string {
  const base = slugify(titleOrNames) || "celebration";
  const suffix = generateInviteCode(4);
  const trimmed = base.slice(0, 60).replace(/-+$/g, "");
  return `${trimmed}-${suffix}`;
}

/**
 * Validates slug format against the database constraint.
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length >= 3 && slug.length <= 80;
}

/**
 * Validates secret invite category code format (8 lowercase alphanumeric characters).
 */
export function isValidInviteCode(code: string): boolean {
  return /^[a-z0-9]{8}$/.test(code);
}

/**
 * Normalizes a guest phone number to digits only for reliable anti-duplicate matching.
 * Strips spaces, dashes, parentheses, plus sign, and leading 00 international prefix.
 */
export function normalizePhoneNumber(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00") && digits.length > 10) {
    digits = digits.slice(2);
  }
  return digits;
}

/**
 * Validates normalized phone number has 10 to 15 digits.
 */
export function isValidPhoneNumber(normalized: string): boolean {
  return /^\d{10,15}$/.test(normalized);
}

/**
 * Validates external URLs (such as Google Maps links) to ensure safe http/https protocols.
 */
export function getSafeExternalUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Formats an ISO date string (YYYY-MM-DD) into an elegant human-readable date
 * without local-timezone off-by-one shifts.
 */
export function formatEventDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "Date to be announced";
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return dateStr;
  const [year, month, day] = parts;
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatShortDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "TBA";
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return dateStr;
  const [year, month, day] = parts;
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/**
 * Returns user-facing etiquette copy shown on the guest invitation and RSVP card.
 */
export function getEtiquetteHeadline(
  etiquette: EtiquetteType,
  maxSeats: number,
  greetingPrefix?: string | null
): string {
  if (etiquette === "solo") {
    return "Personal Invitation for 1 Guest";
  }
  if (etiquette === "couple") {
    return "Invitation for Up to 2 Guests";
  }
  const base = `With Family — Up to ${maxSeats} Guests`;
  if (greetingPrefix && greetingPrefix.trim()) {
    return `${greetingPrefix.trim()} · Up to ${maxSeats} Guests`;
  }
  return base;
}

/**
 * Extracts a safe relative redirect target to prevent open-redirect attacks.
 */
export function getSafeNextPath(next: string | null | undefined, fallback = "/dashboard"): string {
  if (!next) return fallback;
  if (next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\")) {
    return next;
  }
  return fallback;
}

/**
 * Derives crisp royal monogram initials for wax seals and crests.
 * Example: "Aarav & Meera" -> "A & M", "The Sharma Family" -> "S".
 */
export function extractMonogram(hostNames: string | null | undefined): string {
  const cleaned = (hostNames ?? "").trim();
  if (!cleaned) return "SP";

  const pairMatch = cleaned.split(/\s*(?:&|\band\b|\+|weds)\s*/i).filter(Boolean);
  if (pairMatch.length >= 2) {
    const firstLetter = pairMatch[0].replace(/^[^a-zA-Z0-9]+/, "").charAt(0).toUpperCase();
    const secondLetter = pairMatch[1].replace(/^[^a-zA-Z0-9]+/, "").charAt(0).toUpperCase();
    if (firstLetter && secondLetter) {
      return `${firstLetter} & ${secondLetter}`;
    }
  }

  const words = cleaned
    .replace(/^the\s+/i, "")
    .split(/\s+/)
    .filter((w) => /^[a-zA-Z0-9]/.test(w));

  if (words.length >= 2) {
    return `${words[0][0].toUpperCase()}${words[1][0].toUpperCase()}`;
  }
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return "SP";
}

