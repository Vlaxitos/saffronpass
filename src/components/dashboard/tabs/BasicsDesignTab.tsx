"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  Music,
  Play,
  RefreshCw,
  Save,
  Sparkles,
  Square,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  deleteEventAction,
  updateEventBasicsAction,
} from "@/app/dashboard/actions";
import { TraditionSymbol } from "@/components/invite/TraditionSymbol";
import { SaffronAudioEngine } from "@/lib/audio-engine";
import {
  EVENT_TYPES,
  MAX_GALLERY_IMAGES,
  MUSIC_TRACKS,
  normalizeThemeId,
  OPENING_ANIMATIONS,
  PARTICLE_EFFECTS,
  THEMES,
  TRADITION_SYMBOLS,
} from "@/lib/constants";
import {
  formatBytesKb,
  uploadCompressedEventPhoto,
  uploadCustomEventAudio,
} from "@/lib/media-upload";
import { buildDefaultSlug, slugify } from "@/lib/utils";
import type {
  EventRecord,
  EventType,
  MusicTrackType,
  OpeningAnimationType,
  ParticleEffectType,
  ThemeId,
  TraditionSymbolType,
} from "@/types/database";

interface BasicsDesignTabProps {
  event: EventRecord;
  isOwner: boolean;
}

export function BasicsDesignTab({ event, isOwner }: BasicsDesignTabProps) {
  const router = useRouter();
  const previewAudioRef = useRef<SaffronAudioEngine | null>(null);

  const [eventType, setEventType] = useState<EventType>(event.event_type);
  const [traditionSymbol, setTraditionSymbol] = useState<TraditionSymbolType>(
    event.tradition_symbol
  );
  const [title, setTitle] = useState(event.title);
  const [hostNames, setHostNames] = useState(event.host_names);
  const [eventDate, setEventDate] = useState(event.event_date ?? "");
  const [slug, setSlug] = useState(event.slug);
  const [welcomeMessage, setWelcomeMessage] = useState(
    event.welcome_message ?? ""
  );
  const [themeId, setThemeId] = useState<ThemeId>(
    normalizeThemeId(event.theme_id)
  );
  const [openingAnimation, setOpeningAnimation] =
    useState<OpeningAnimationType>(event.opening_animation);
  const [rsvpEnabled, setRsvpEnabled] = useState(event.rsvp_enabled);

  // Phase 2 Design, Media, Animation & Audio state
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(
    event.cover_image_url ?? null
  );
  const [coverSizeBadge, setCoverSizeBadge] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>(
    Array.isArray(event.gallery_images)
      ? event.gallery_images.filter(Boolean).slice(0, MAX_GALLERY_IMAGES)
      : []
  );
  const [gallerySizeBadges, setGallerySizeBadges] = useState<
    Record<string, string>
  >({});
  const [particleEffect, setParticleEffect] = useState<ParticleEffectType>(
    event.particle_effect ?? "none"
  );
  const [scratchRevealEnabled, setScratchRevealEnabled] = useState<boolean>(
    Boolean(event.scratch_reveal_enabled)
  );
  const [musicTrack, setMusicTrack] = useState<MusicTrackType>(
    event.music_track ?? "none"
  );
  const [customMusicUrl, setCustomMusicUrl] = useState<string | null>(
    event.custom_music_url ?? null
  );
  const [customMusicBadge, setCustomMusicBadge] = useState<string | null>(null);
  const [previewingTrack, setPreviewingTrack] = useState<MusicTrackType | null>(
    null
  );

  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      previewAudioRef.current?.dispose();
      previewAudioRef.current = null;
    };
  }, []);

  const stopPreviewAudio = () => {
    previewAudioRef.current?.stop();
    setPreviewingTrack(null);
  };

  const toggleTrackPreview = (track: MusicTrackType) => {
    if (track === "none") return;
    if (previewingTrack === track) {
      stopPreviewAudio();
      return;
    }

    if (!previewAudioRef.current) {
      previewAudioRef.current = new SaffronAudioEngine();
    } else {
      previewAudioRef.current.stop();
    }

    previewAudioRef.current.configure(
      track,
      track === "custom" ? customMusicUrl : null
    );
    const started = previewAudioRef.current.start();
    setPreviewingTrack(started ? track : null);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    setSavedNotice(null);
    setUploadingCover(true);
    try {
      const uploaded = await uploadCompressedEventPhoto(
        event.id,
        "cover",
        file
      );
      setCoverImageUrl(uploaded.publicUrl);
      const savedPct = Math.max(
        0,
        Math.round((1 - uploaded.sizeBytes / Math.max(uploaded.originalBytes, 1)) * 100)
      );
      setCoverSizeBadge(
        `WebP · ${formatBytesKb(uploaded.sizeBytes)}${savedPct > 5 ? ` (-${savedPct}%)` : ""}`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not compress and upload cover photo."
      );
    } finally {
      setUploadingCover(false);
    }
  };

  const handleGalleryUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    const slotsLeft = MAX_GALLERY_IMAGES - galleryImages.length;
    if (slotsLeft <= 0) {
      setError(`Maximum of ${MAX_GALLERY_IMAGES} gallery photos allowed.`);
      return;
    }

    setError(null);
    setSavedNotice(null);
    setUploadingGallery(true);
    try {
      const selected = files.slice(0, slotsLeft);
      const addedUrls: string[] = [];
      const newBadges: Record<string, string> = {};

      for (const file of selected) {
        const uploaded = await uploadCompressedEventPhoto(
          event.id,
          "gallery",
          file
        );
        addedUrls.push(uploaded.publicUrl);
        newBadges[uploaded.publicUrl] = `WebP · ${formatBytesKb(uploaded.sizeBytes)}`;
      }

      setGalleryImages((prev) =>
        [...prev, ...addedUrls].slice(0, MAX_GALLERY_IMAGES)
      );
      setGallerySizeBadges((prev) => ({ ...prev, ...newBadges }));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not compress and upload gallery photo."
      );
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleCustomAudioUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    setSavedNotice(null);
    stopPreviewAudio();
    setUploadingAudio(true);
    try {
      const uploaded = await uploadCustomEventAudio(event.id, file);
      setCustomMusicUrl(uploaded.publicUrl);
      setCustomMusicBadge(`MP3 · ${formatBytesKb(uploaded.sizeBytes)}`);
      setMusicTrack("custom");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not upload MP3 file."
      );
    } finally {
      setUploadingAudio(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSavedNotice(null);
    setSaving(true);

    try {
      const res = await updateEventBasicsAction({
        eventId: event.id,
        event_type: eventType,
        tradition_symbol: traditionSymbol,
        title,
        host_names: hostNames,
        event_date: eventDate || null,
        slug,
        welcome_message: welcomeMessage,
        theme_id: themeId,
        opening_animation: openingAnimation,
        rsvp_enabled: rsvpEnabled,
        cover_image_url: coverImageUrl,
        gallery_images: galleryImages,
        particle_effect: particleEffect,
        scratch_reveal_enabled: scratchRevealEnabled,
        music_track: musicTrack,
        custom_music_url: customMusicUrl,
      });

      if (!res.ok) {
        setError(res.error || "Could not save changes.");
        return;
      }

      setSlug(slugify(slug));
      setSavedNotice("Invitation basics, media & luxury design saved successfully.");
      router.refresh();
    } catch {
      setError("Network error while saving changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async () => {
    setDeleting(true);
    setError(null);
    try {
      const res = await deleteEventAction(event.id);
      if (!res.ok) {
        setError(res.error || "Could not delete event.");
        setDeleting(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Unexpected error deleting event.");
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-[#8E1E31]/30 bg-[#8E1E31]/8 p-4 text-sm text-[#6B1222]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {savedNotice && (
        <div className="flex items-start gap-2.5 rounded-xl border border-[#1F6E4A]/30 bg-[#1F6E4A]/8 p-4 text-sm text-[#175438]">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* 1. Event Type Picker */}
      <section className="rounded-2xl border border-[#C88A2E]/30 bg-[#FFFDF8] p-5 sm:p-7">
        <h2 className="font-serif text-2xl font-semibold text-[#4A101C]">
          Celebration Type
        </h2>
        <p className="mt-1 text-xs text-[#7A6258]">
          Select the occasion to tailor your invitation tone and metadata.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          {EVENT_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setEventType(type.value)}
              className={`cursor-pointer rounded-xl border p-3.5 text-left transition-all ${
                eventType === type.value
                  ? "border-[#5B1422] bg-[#5B1422] text-[#FCF8F1] shadow-sm"
                  : "border-[#C88A2E]/30 bg-white text-[#4A101C] hover:bg-[#FCF5E8]"
              }`}
            >
              <p className="text-sm font-semibold">{type.label}</p>
              <p
                className={`mt-0.5 text-[11px] ${
                  eventType === type.value
                    ? "text-[#F4E4C1]/85"
                    : "text-[#7A6258]"
                }`}
              >
                {type.subtitle}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* 2. Core Details & Slug */}
      <section className="rounded-2xl border border-[#C88A2E]/30 bg-[#FFFDF8] p-5 sm:p-7">
        <h2 className="font-serif text-2xl font-semibold text-[#4A101C]">
          Event Details &amp; Invitation Link
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="basics-host-names"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]"
            >
              Host / Couple Names *
            </label>
            <input
              id="basics-host-names"
              type="text"
              required
              value={hostNames}
              onChange={(e) => setHostNames(e.target.value)}
              placeholder="e.g., Aanya & Kabir"
              className="w-full rounded-xl border border-[#C88A2E]/35 bg-white px-3.5 py-2.5 text-sm text-[#241815] focus:border-[#5B1422] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="basics-title"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]"
            >
              Event Title *
            </label>
            <input
              id="basics-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., The Royal Wedding Celebration"
              className="w-full rounded-xl border border-[#C88A2E]/35 bg-white px-3.5 py-2.5 text-sm text-[#241815] focus:border-[#5B1422] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="basics-date"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]"
            >
              Main Event Date
            </label>
            <input
              id="basics-date"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full rounded-xl border border-[#C88A2E]/35 bg-white px-3.5 py-2.5 text-sm text-[#241815] focus:border-[#5B1422] focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-[#7A6258]">
              Drives the live countdown timer, Scratch-to-Reveal card, and WhatsApp preview.
            </p>
          </div>

          <div>
            <label
              htmlFor="basics-slug"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]"
            >
              Custom URL Slug *
            </label>
            <div className="flex gap-2">
              <input
                id="basics-slug"
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder="aanya-kabir-2026"
                className="flex-1 rounded-xl border border-[#C88A2E]/35 bg-white px-3.5 py-2.5 font-mono text-xs text-[#241815] focus:border-[#5B1422] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSlug(buildDefaultSlug(hostNames || title))}
                title="Generate a fresh slug from host names"
                className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-[#C88A2E]/35 bg-[#FCF8F1] px-3 py-2 text-xs font-medium text-[#5B1422] hover:bg-[#F5ECDC]"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Auto
              </button>
            </div>
            <p className="mt-1 font-mono text-[11px] text-[#7A6258]">
              Invite URL format: /{slug || "your-slug"}/[secret-code]
            </p>
          </div>
        </div>

        <div className="mt-5">
          <label
            htmlFor="basics-welcome"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]"
          >
            Welcome Message
          </label>
          <textarea
            id="basics-welcome"
            rows={3}
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            placeholder="With the blessings of our elders, we joyfully invite you to celebrate with us..."
            className="w-full rounded-xl border border-[#C88A2E]/35 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-[#241815] focus:border-[#5B1422] focus:outline-none"
          />
        </div>
      </section>

      {/* 3. Cover Photo & Couple Gallery (Browser-Side WebP Compression <300KB) */}
      <section className="rounded-2xl border border-[#C88A2E]/30 bg-[#FFFDF8] p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-[#4A101C]">
              Cover Portrait &amp; Photo Gallery
            </h2>
            <p className="mt-1 text-xs text-[#7A6258]">
              Every image is automatically resized (max 1200px) and compressed in
              your browser to crisp WebP under 300KB before uploading.
            </p>
          </div>
          <span className="rounded-full bg-[#1F6E4A]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#175438]">
            Auto WebP &lt; 300KB
          </span>
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-12">
          {/* 1 Cover Photo */}
          <div className="lg:col-span-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]">
              Hero Cover &amp; WhatsApp Preview Photo (1)
            </p>

            {coverImageUrl ? (
              <div className="relative overflow-hidden rounded-2xl border border-[#C88A2E]/35 bg-[#FCF8F1]">
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src={coverImageUrl}
                    alt="Event cover preview"
                    fill
                    sizes="(max-width: 1024px) 100vw, 420px"
                    className="object-cover"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                  <span className="rounded-full bg-[#1F6E4A]/12 px-2.5 py-0.5 text-[11px] font-semibold text-[#175438]">
                    {coverSizeBadge ?? "Uploaded Cover"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCoverImageUrl(null);
                      setCoverSizeBadge(null);
                    }}
                    className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-[#8E1E31] hover:underline"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex aspect-[16/10] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#C88A2E]/40 bg-[#FCF8F1] px-4 text-center transition-colors hover:border-[#5B1422] hover:bg-[#F7EFE1]">
                <ImagePlus className="h-7 w-7 text-[#C88A2E]" />
                <span className="mt-2 text-xs font-semibold text-[#5B1422]">
                  {uploadingCover
                    ? "Compressing & Uploading..."
                    : "Upload Cover Photo"}
                </span>
                <span className="mt-1 text-[11px] text-[#7A6258]">
                  JPG, PNG, or WebP · Auto-compressed under 300KB
                </span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingCover}
                  onChange={handleCoverUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Up to 4 Couple / Event Gallery Photos */}
          <div className="lg:col-span-7">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5B1422]">
                Couple &amp; Event Gallery ({galleryImages.length} /{" "}
                {MAX_GALLERY_IMAGES})
              </p>
              {galleryImages.length < MAX_GALLERY_IMAGES && (
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#5B1422]/25 bg-white px-3 py-1.5 text-xs font-semibold text-[#5B1422] transition-colors hover:bg-[#FCF5E8]">
                  <Upload className="h-3.5 w-3.5" />
                  <span>{uploadingGallery ? "Compressing..." : "Add Photos"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploadingGallery}
                    onChange={handleGalleryUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {galleryImages.length === 0 ? (
              <label className="flex min-h-[168px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#C88A2E]/35 bg-[#FCF8F1] px-4 text-center transition-colors hover:border-[#5B1422]">
                <ImagePlus className="h-6 w-6 text-[#C88A2E]" />
                <span className="mt-2 text-xs font-semibold text-[#5B1422]">
                  {uploadingGallery
                    ? "Compressing & Uploading..."
                    : "Add up to 4 Couple / Pre-Wedding Photos"}
                </span>
                <span className="mt-1 text-[11px] text-[#7A6258]">
                  Displayed in a responsive swipe/tap gallery inside the invite
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={uploadingGallery}
                  onChange={handleGalleryUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {galleryImages.map((url, idx) => (
                  <div
                    key={url}
                    className="relative overflow-hidden rounded-xl border border-[#C88A2E]/35 bg-[#FCF8F1]"
                  >
                    <div className="relative aspect-[4/3] w-full">
                      <Image
                        src={url}
                        alt={`Gallery photo ${idx + 1}`}
                        fill
                        sizes="(max-width: 768px) 45vw, 240px"
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setGalleryImages((prev) =>
                          prev.filter((item) => item !== url)
                        )
                      }
                      aria-label={`Remove gallery photo ${idx + 1}`}
                      className="absolute right-2 top-2 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#241815]/80 text-white hover:bg-[#8E1E31]"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    {gallerySizeBadges[url] && (
                      <span className="absolute bottom-2 left-2 rounded-full bg-[#175438]/90 px-2 py-0.5 text-[10px] font-semibold text-white">
                        {gallerySizeBadges[url]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Tradition Symbol Picker */}
      <section className="rounded-2xl border border-[#C88A2E]/30 bg-[#FFFDF8] p-5 sm:p-7">
        <h2 className="font-serif text-2xl font-semibold text-[#4A101C]">
          Tradition Symbol
        </h2>
        <p className="mt-1 text-xs text-[#7A6258]">
          Displayed delicately at the crown of your invitation stationery.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {TRADITION_SYMBOLS.map((sym) => {
            const active = traditionSymbol === sym.value;
            return (
              <button
                key={sym.value}
                type="button"
                onClick={() => setTraditionSymbol(sym.value)}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border px-3 py-4 text-center transition-all ${
                  active
                    ? "border-[#5B1422] bg-[#FCF5E8] shadow-sm ring-1 ring-[#5B1422]"
                    : "border-[#C88A2E]/30 bg-white hover:bg-[#FCF8F1]"
                }`}
              >
                <div className="flex h-12 items-center justify-center">
                  {sym.value === "none" ? (
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-[#8E786C]">
                      —
                    </span>
                  ) : (
                    <TraditionSymbol
                      symbol={sym.value}
                      size={44}
                      className={active ? "text-[#5B1422]" : "text-[#C88A2E]"}
                    />
                  )}
                </div>
                <p className="mt-2 text-xs font-semibold text-[#4A101C]">
                  {sym.label}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 5. 5 Luxury Themes Selector */}
      <section className="rounded-2xl border border-[#C88A2E]/30 bg-[#FFFDF8] p-5 sm:p-7">
        <h2 className="font-serif text-2xl font-semibold text-[#4A101C]">
          Luxury Theme Palette (5 Themes)
        </h2>
        <p className="mt-1 text-xs text-[#7A6258]">
          Each theme styles your envelope/doors cover, stationery borders,
          typography, and RSVP card harmoniously.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {THEMES.map((theme) => {
            const active = themeId === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => setThemeId(theme.id)}
                className={`flex w-full cursor-pointer flex-col justify-between rounded-xl border p-4 text-left transition-all ${
                  active
                    ? "border-[#5B1422] bg-[#FCF5E8] ring-1 ring-[#5B1422]"
                    : "border-[#C88A2E]/30 bg-white hover:bg-[#FCF8F1]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-serif text-xl font-semibold text-[#4A101C]">
                    {theme.name}
                  </p>
                  <div className="flex shrink-0 items-center -space-x-1.5 pt-0.5">
                    {theme.swatches.map((hex) => (
                      <span
                        key={hex}
                        className="h-5 w-5 rounded-full border border-black/15 shadow-xs"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[#69564E]">
                  {theme.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 6. Opening Animation, Falling Particles & Gold-Foil Scratch Reveal */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#C88A2E]/30 bg-[#FFFDF8] p-5 sm:p-7">
          <h2 className="font-serif text-2xl font-semibold text-[#4A101C]">
            Opening Animation
          </h2>
          <div className="mt-4 space-y-3">
            {OPENING_ANIMATIONS.map((anim) => {
              const active = openingAnimation === anim.id;
              return (
                <button
                  key={anim.id}
                  type="button"
                  onClick={() => setOpeningAnimation(anim.id)}
                  className={`block w-full cursor-pointer rounded-xl border p-4 text-left transition-all ${
                    active
                      ? "border-[#5B1422] bg-[#FCF5E8] ring-1 ring-[#5B1422]"
                      : "border-[#C88A2E]/30 bg-white hover:bg-[#FCF8F1]"
                  }`}
                >
                  <p className="font-serif text-xl font-semibold text-[#4A101C]">
                    {anim.name}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#69564E]">
                    {anim.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          {/* Falling Particles */}
          <div className="rounded-2xl border border-[#C88A2E]/30 bg-[#FFFDF8] p-5 sm:p-7">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#C88A2E]" />
              <h2 className="font-serif text-2xl font-semibold text-[#4A101C]">
                Falling Particles Effect
              </h2>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {PARTICLE_EFFECTS.map((effect) => {
                const active = particleEffect === effect.id;
                return (
                  <button
                    key={effect.id}
                    type="button"
                    onClick={() => setParticleEffect(effect.id)}
                    className={`cursor-pointer rounded-xl border p-3 text-left transition-all ${
                      active
                        ? "border-[#5B1422] bg-[#FCF5E8] ring-1 ring-[#5B1422]"
                        : "border-[#C88A2E]/30 bg-white hover:bg-[#FCF8F1]"
                    }`}
                  >
                    <p className="text-xs font-semibold text-[#4A101C]">
                      {effect.name}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#7A6258]">
                      {effect.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gold-Foil Scratch-to-Reveal Date Toggle */}
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#C88A2E]/30 bg-[#FFFDF8] p-5 sm:p-6">
            <div>
              <h3 className="font-serif text-xl font-semibold text-[#4A101C]">
                Gold-Foil Scratch-to-Reveal Date
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-[#69564E]">
                Lets guests rub away metallic gold foil with their finger to
                uncover your main celebration date with a sparkle burst.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={scratchRevealEnabled}
              aria-label="Toggle Gold-Foil Scratch-to-Reveal Date"
              onClick={() => setScratchRevealEnabled((prev) => !prev)}
              className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer items-center rounded-full p-1 transition-colors ${
                scratchRevealEnabled ? "bg-[#C88A2E]" : "bg-[#C7B8AD]"
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
                  scratchRevealEnabled ? "translate-x-8" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* 7. Tap-to-Start Background Music */}
      <section className="rounded-2xl border border-[#C88A2E]/30 bg-[#FFFDF8] p-5 sm:p-7">
        <div className="flex items-center gap-2">
          <Music className="h-5 w-5 text-[#C88A2E]" />
          <h2 className="font-serif text-2xl font-semibold text-[#4A101C]">
            Tap-to-Start Background Music
          </h2>
        </div>
        <p className="mt-1 text-xs text-[#7A6258]">
          Starts seamlessly when guests tap the Wax Seal, Palace Doors, or Begin
          Celebration—with a floating Mute/Play pill on screen.
        </p>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {MUSIC_TRACKS.map((track) => {
            const active = musicTrack === track.id;
            const canPreview =
              track.id !== "none" &&
              (track.id !== "custom" || Boolean(customMusicUrl));
            const isPreviewing = previewingTrack === track.id;

            return (
              <div
                key={track.id}
                className={`flex items-start justify-between gap-2 rounded-xl border p-3.5 transition-all ${
                  active
                    ? "border-[#5B1422] bg-[#FCF5E8] ring-1 ring-[#5B1422]"
                    : "border-[#C88A2E]/30 bg-white hover:bg-[#FCF8F1]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    stopPreviewAudio();
                    setMusicTrack(track.id);
                  }}
                  className="flex-1 cursor-pointer text-left"
                >
                  <p className="text-xs font-semibold text-[#4A101C]">
                    {track.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#7A6258]">
                    {track.description}
                  </p>
                </button>

                {canPreview && (
                  <button
                    type="button"
                    onClick={() => toggleTrackPreview(track.id)}
                    aria-label={
                      isPreviewing
                        ? `Stop preview of ${track.name}`
                        : `Preview ${track.name}`
                    }
                    className={`inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors ${
                      isPreviewing
                        ? "border-[#5B1422] bg-[#5B1422] text-[#F6DC9C]"
                        : "border-[#C88A2E]/40 bg-white text-[#5B1422] hover:bg-[#F5ECDC]"
                    }`}
                  >
                    {isPreviewing ? (
                      <Square className="h-3 w-3 fill-current" />
                    ) : (
                      <Play className="h-3.5 w-3.5 fill-current" />
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Custom MP3 Uploader (<3MB strictly validated) */}
        {musicTrack === "custom" && (
          <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-xl border border-[#C88A2E]/35 bg-[#FCF8F1] p-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold text-[#4A101C]">
                Custom MP3 Track (Max 3 MB)
              </p>
              <p className="mt-0.5 text-[11px] text-[#7A6258]">
                {customMusicUrl
                  ? customMusicBadge ?? "Custom MP3 uploaded and ready"
                  : "Upload a lightweight .mp3 track under 3 MB to play on tap."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#5B1422] px-4 py-2 text-xs font-semibold text-[#FCF8F1] hover:bg-[#460E19]">
                <Upload className="h-3.5 w-3.5" />
                <span>
                  {uploadingAudio
                    ? "Uploading..."
                    : customMusicUrl
                      ? "Replace MP3"
                      : "Upload MP3"}
                </span>
                <input
                  type="file"
                  accept="audio/mpeg,.mp3"
                  disabled={uploadingAudio}
                  onChange={handleCustomAudioUpload}
                  className="hidden"
                />
              </label>

              {customMusicUrl && (
                <button
                  type="button"
                  onClick={() => {
                    stopPreviewAudio();
                    setCustomMusicUrl(null);
                    setCustomMusicBadge(null);
                  }}
                  className="cursor-pointer rounded-xl border border-[#8E1E31]/30 bg-white px-3 py-2 text-xs font-semibold text-[#8E1E31] hover:bg-[#8E1E31]/8"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* 8. RSVP Enabled Toggle */}
      <section className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-[#C88A2E]/30 bg-[#FFFDF8] p-5 sm:flex-row sm:items-center sm:p-7">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#4A101C]">
            Guest RSVP Collection
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-[#69564E]">
            When enabled, guests can confirm attendance and seat counts per
            ceremony. Turn off to make your invitation view-only.
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={rsvpEnabled}
          aria-label="Toggle RSVP Enabled"
          onClick={() => setRsvpEnabled((prev) => !prev)}
          className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer items-center rounded-full p-1 transition-colors ${
            rsvpEnabled ? "bg-[#1F6E4A]" : "bg-[#C7B8AD]"
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
              rsvpEnabled ? "translate-x-8" : "translate-x-0"
            }`}
          />
        </button>
      </section>

      {/* Save Action & Owner-Only Danger Zone */}
      <div className="flex flex-col-reverse items-stretch justify-between gap-4 border-t border-[#C88A2E]/25 pt-6 sm:flex-row sm:items-center">
        <div>
          {isOwner &&
            (!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-[#8E1E31] hover:underline"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete This Event
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#8E1E31]/35 bg-[#8E1E31]/8 px-3.5 py-2 text-xs">
                <span className="font-medium text-[#6B1222]">
                  Permanently delete event &amp; all RSVPs?
                </span>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDeleteEvent}
                  className="cursor-pointer rounded-lg bg-[#8E1E31] px-3 py-1 font-semibold text-white hover:bg-[#6B1222]"
                >
                  {deleting ? "Deleting..." : "Confirm Delete"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="cursor-pointer rounded-lg border border-[#8E1E31]/30 bg-white px-2.5 py-1 font-medium text-[#6B1222]"
                >
                  Cancel
                </button>
              </div>
            ))}
        </div>

        <button
          type="submit"
          disabled={saving || uploadingCover || uploadingGallery || uploadingAudio}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#5B1422] px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#FCF8F1] shadow-md transition-colors hover:bg-[#460E19] disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving Changes..." : "Save Basics & Design"}
        </button>
      </div>
    </form>
  );
}
