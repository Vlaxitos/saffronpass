"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  DoorOpen,
  Film,
  ImagePlus,
  Loader2,
  MailOpen,
  Music,
  Play,
  RefreshCw,
  RotateCcw,
  Save,
  Sparkles,
  Square,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  deleteEventAction,
  updateEventBasicsAction,
} from "@/app/dashboard/actions";
import { TraditionSymbol } from "@/components/invite/TraditionSymbol";
import { SaffronAudioPlayer } from "@/lib/audioPlayer";
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

export interface LiveEventDraft {
  event_type: EventType;
  tradition_symbol: TraditionSymbolType;
  title: string;
  host_names: string;
  event_date: string | null;
  slug: string;
  welcome_message: string;
  theme_id: ThemeId;
  opening_animation: OpeningAnimationType;
  rsvp_enabled: boolean;
  cover_image_url: string | null;
  gallery_images: string[];
  particle_effect: ParticleEffectType;
  scratch_reveal_enabled: boolean;
  music_track: MusicTrackType;
  custom_music_url: string | null;
}

interface BasicsDesignTabProps {
  event: EventRecord;
  isOwner: boolean;
  onDraftChange?: (draft: LiveEventDraft) => void;
}

const OPENING_ICONS: Record<
  OpeningAnimationType,
  React.ComponentType<{ className?: string }>
> = {
  wax_seal: MailOpen,
  palace_doors: DoorOpen,
  cinematic_scroll: Film,
};

function buildInitialDraft(event: EventRecord): LiveEventDraft {
  return {
    event_type: event.event_type,
    tradition_symbol: event.tradition_symbol,
    title: event.title,
    host_names: event.host_names,
    event_date: event.event_date ?? null,
    slug: event.slug,
    welcome_message: event.welcome_message ?? "",
    theme_id: normalizeThemeId(event.theme_id),
    opening_animation: event.opening_animation,
    rsvp_enabled: event.rsvp_enabled,
    cover_image_url: event.cover_image_url ?? null,
    gallery_images: Array.isArray(event.gallery_images)
      ? event.gallery_images.filter(Boolean).slice(0, MAX_GALLERY_IMAGES)
      : [],
    particle_effect: event.particle_effect ?? "none",
    scratch_reveal_enabled: Boolean(event.scratch_reveal_enabled),
    music_track: event.music_track ?? "none",
    custom_music_url: event.custom_music_url ?? null,
  };
}

export function BasicsDesignTab({
  event,
  isOwner,
  onDraftChange,
}: BasicsDesignTabProps) {
  const router = useRouter();
  const previewPlayerRef = useRef<SaffronAudioPlayer | null>(null);

  const baseline = useMemo(() => buildInitialDraft(event), [event]);

  const [eventType, setEventType] = useState<EventType>(baseline.event_type);
  const [traditionSymbol, setTraditionSymbol] = useState<TraditionSymbolType>(
    baseline.tradition_symbol
  );
  const [title, setTitle] = useState(baseline.title);
  const [hostNames, setHostNames] = useState(baseline.host_names);
  const [eventDate, setEventDate] = useState(baseline.event_date ?? "");
  const [slug, setSlug] = useState(baseline.slug);
  const [welcomeMessage, setWelcomeMessage] = useState(
    baseline.welcome_message
  );
  const [themeId, setThemeId] = useState<ThemeId>(baseline.theme_id);
  const [openingAnimation, setOpeningAnimation] =
    useState<OpeningAnimationType>(baseline.opening_animation);
  const [rsvpEnabled, setRsvpEnabled] = useState(baseline.rsvp_enabled);

  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(
    baseline.cover_image_url
  );
  const [coverSizeBadge, setCoverSizeBadge] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>(
    baseline.gallery_images
  );
  const [gallerySizeBadges, setGallerySizeBadges] = useState<
    Record<string, string>
  >({});
  const [particleEffect, setParticleEffect] = useState<ParticleEffectType>(
    baseline.particle_effect
  );
  const [scratchRevealEnabled, setScratchRevealEnabled] = useState<boolean>(
    baseline.scratch_reveal_enabled
  );
  const [musicTrack, setMusicTrack] = useState<MusicTrackType>(
    baseline.music_track
  );
  const [customMusicUrl, setCustomMusicUrl] = useState<string | null>(
    baseline.custom_music_url
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

  const currentDraft = useMemo<LiveEventDraft>(
    () => ({
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
    }),
    [
      eventType,
      traditionSymbol,
      title,
      hostNames,
      eventDate,
      slug,
      welcomeMessage,
      themeId,
      openingAnimation,
      rsvpEnabled,
      coverImageUrl,
      galleryImages,
      particleEffect,
      scratchRevealEnabled,
      musicTrack,
      customMusicUrl,
    ]
  );

  const isDirty = useMemo(
    () => JSON.stringify(currentDraft) !== JSON.stringify(baseline),
    [currentDraft, baseline]
  );

  // Push real-time draft updates to parent EventEditorClient for Live Phone Preview
  useEffect(() => {
    onDraftChange?.(currentDraft);
  }, [currentDraft, onDraftChange]);

  useEffect(() => {
    return () => {
      previewPlayerRef.current?.dispose();
      previewPlayerRef.current = null;
    };
  }, []);

  const stopPreviewAudio = () => {
    previewPlayerRef.current?.stop();
    setPreviewingTrack(null);
  };

  const toggleTrackPreview = (track: MusicTrackType) => {
    if (track === "none") return;
    if (previewingTrack === track) {
      stopPreviewAudio();
      return;
    }

    if (!previewPlayerRef.current) {
      previewPlayerRef.current = new SaffronAudioPlayer((playing) => {
        if (!playing) setPreviewingTrack(null);
      });
    } else {
      previewPlayerRef.current.stop();
    }

    previewPlayerRef.current.configure(
      track,
      track === "custom" ? customMusicUrl : null
    );
    const started = previewPlayerRef.current.start();
    setPreviewingTrack(started ? track : null);
  };

  const handleResetChanges = () => {
    stopPreviewAudio();
    setEventType(baseline.event_type);
    setTraditionSymbol(baseline.tradition_symbol);
    setTitle(baseline.title);
    setHostNames(baseline.host_names);
    setEventDate(baseline.event_date ?? "");
    setSlug(baseline.slug);
    setWelcomeMessage(baseline.welcome_message);
    setThemeId(baseline.theme_id);
    setOpeningAnimation(baseline.opening_animation);
    setRsvpEnabled(baseline.rsvp_enabled);
    setCoverImageUrl(baseline.cover_image_url);
    setGalleryImages(baseline.gallery_images);
    setParticleEffect(baseline.particle_effect);
    setScratchRevealEnabled(baseline.scratch_reveal_enabled);
    setMusicTrack(baseline.music_track);
    setCustomMusicUrl(baseline.custom_music_url);
    toast.info("Unsaved changes discarded.");
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

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
        Math.round(
          (1 - uploaded.sizeBytes / Math.max(uploaded.originalBytes, 1)) * 100
        )
      );
      const badge = `WebP · ${formatBytesKb(uploaded.sizeBytes)}${
        savedPct > 5 ? ` (-${savedPct}%)` : ""
      }`;
      setCoverSizeBadge(badge);
      toast.success(`Cover compressed & uploaded (${badge}). Click Save Changes.`);
    } catch (err) {
      toast.error(
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
      toast.error(`Maximum of ${MAX_GALLERY_IMAGES} gallery photos allowed.`);
      return;
    }

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
        newBadges[uploaded.publicUrl] = `WebP · ${formatBytesKb(
          uploaded.sizeBytes
        )}`;
      }

      setGalleryImages((prev) =>
        [...prev, ...addedUrls].slice(0, MAX_GALLERY_IMAGES)
      );
      setGallerySizeBadges((prev) => ({ ...prev, ...newBadges }));
      toast.success(
        `${addedUrls.length} gallery ${addedUrls.length === 1 ? "photo" : "photos"} compressed & uploaded.`
      );
    } catch (err) {
      toast.error(
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

    stopPreviewAudio();
    setUploadingAudio(true);
    try {
      const uploaded = await uploadCustomEventAudio(event.id, file);
      setCustomMusicUrl(uploaded.publicUrl);
      const badge = `MP3 · ${formatBytesKb(uploaded.sizeBytes)}`;
      setCustomMusicBadge(badge);
      setMusicTrack("custom");
      toast.success(`Custom soundtrack uploaded (${badge}). Click Save Changes.`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not upload MP3 file."
      );
    } finally {
      setUploadingAudio(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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
        toast.error(res.error || "Could not save changes.");
        return;
      }

      setSlug(slugify(slug));
      toast.success("Invitation basics & luxury design saved.");
      router.refresh();
    } catch {
      toast.error("Network error while saving changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async () => {
    setDeleting(true);
    try {
      const res = await deleteEventAction(event.id);
      if (!res.ok) {
        toast.error(res.error || "Could not delete event.");
        setDeleting(false);
        return;
      }
      toast.success("Celebration deleted.");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Unexpected error deleting event.");
      setDeleting(false);
    }
  };

  const busyUploading = uploadingCover || uploadingGallery || uploadingAudio;

  return (
    <form
      id="basics-design-form"
      onSubmit={handleSave}
      className={`space-y-6 ${isDirty ? "pb-24" : "pb-6"}`}
    >
      {/* 1. Celebration Type Visual Grid */}
      <section className="gold-shimmer-border rounded-2xl bg-[#FFFDF9] p-5 sm:p-6">
        <p className="font-display text-[10px] font-semibold uppercase tracking-[0.24em] text-[#B88433]">
          Step 01
        </p>
        <h2 className="mt-1 font-editorial text-2xl font-semibold text-[#470F1B]">
          Celebration Type
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {EVENT_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setEventType(type.value)}
              className={`min-h-[60px] cursor-pointer rounded-xl border p-3 text-left transition-all ${
                eventType === type.value
                  ? "border-[#54121F] bg-[#54121F] text-[#FBF7F0] shadow-xs"
                  : "border-[#B88433]/26 bg-white text-[#470F1B] hover:border-[#B88433]/60 hover:bg-[#FBF3E5]"
              }`}
            >
              <p className="text-xs font-semibold sm:text-sm">{type.label}</p>
              <p
                className={`mt-0.5 text-[11px] ${
                  eventType === type.value
                    ? "text-[#F3E4C6]/82"
                    : "text-[#796258]"
                }`}
              >
                {type.subtitle}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* 2. Event Details & Custom URL Slug */}
      <section className="gold-shimmer-border rounded-2xl bg-[#FFFDF9] p-5 sm:p-6">
        <p className="font-display text-[10px] font-semibold uppercase tracking-[0.24em] text-[#B88433]">
          Step 02
        </p>
        <h2 className="mt-1 font-editorial text-2xl font-semibold text-[#470F1B]">
          Event Details &amp; Invitation Link
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="basics-host-names"
              className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#54121F]"
            >
              Host / Couple Names *
            </label>
            <input
              id="basics-host-names"
              type="text"
              required
              value={hostNames}
              onChange={(e) => setHostNames(e.target.value)}
              placeholder="e.g., Aarav & Meera"
              className="min-h-[44px] w-full rounded-xl border border-[#B88433]/32 bg-white px-3.5 py-2.5 text-sm text-[#221714] focus:border-[#54121F] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="basics-title"
              className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#54121F]"
            >
              Event Title *
            </label>
            <input
              id="basics-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., The Royal Udaipur Wedding"
              className="min-h-[44px] w-full rounded-xl border border-[#B88433]/32 bg-white px-3.5 py-2.5 text-sm text-[#221714] focus:border-[#54121F] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="basics-date"
              className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#54121F]"
            >
              Main Event Date
            </label>
            <input
              id="basics-date"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="min-h-[44px] w-full rounded-xl border border-[#B88433]/32 bg-white px-3.5 py-2.5 text-sm text-[#221714] focus:border-[#54121F] focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-[#796258]">
              Drives countdown, Scratch Card, and WhatsApp preview.
            </p>
          </div>

          <div>
            <label
              htmlFor="basics-slug"
              className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#54121F]"
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
                placeholder="aarav-meera-2027"
                className="min-h-[44px] flex-1 rounded-xl border border-[#B88433]/32 bg-white px-3.5 py-2.5 font-mono text-xs text-[#221714] focus:border-[#54121F] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSlug(buildDefaultSlug(hostNames || title))}
                title="Generate a fresh slug from host names"
                className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 rounded-xl border border-[#B88433]/32 bg-[#FBF7F0] px-3 text-xs font-semibold text-[#54121F] hover:bg-[#F3EADC]"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Auto
              </button>
            </div>
            <p className="mt-1 truncate font-mono text-[11px] text-[#796258]">
              /{slug || "your-slug"}/[secret-code]
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label
            htmlFor="basics-welcome"
            className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#54121F]"
          >
            Welcome Message
          </label>
          <textarea
            id="basics-welcome"
            rows={3}
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            placeholder="With the blessings of our elders, we joyfully invite you to celebrate with us..."
            className="w-full rounded-xl border border-[#B88433]/32 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-[#221714] focus:border-[#54121F] focus:outline-none"
          />
        </div>
      </section>

      {/* 3. Cover Portrait & Couple Photo Gallery (Auto WebP < 300KB) */}
      <section className="gold-shimmer-border rounded-2xl bg-[#FFFDF9] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-display text-[10px] font-semibold uppercase tracking-[0.24em] text-[#B88433]">
              Step 03
            </p>
            <h2 className="mt-1 font-editorial text-2xl font-semibold text-[#470F1B]">
              Cover Portrait &amp; Photo Gallery
            </h2>
            <p className="mt-1 text-xs text-[#796258]">
              Automatically resized (max 1200px) and compressed in-browser to
              crisp WebP under 300KB.
            </p>
          </div>
          <span className="rounded-full bg-[#1B6343]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#154F35]">
            Auto WebP &lt; 300KB
          </span>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-12">
          {/* 1 Cover Photo */}
          <div className="md:col-span-5">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#54121F]">
              Hero Cover &amp; WhatsApp Card (1)
            </p>

            {coverImageUrl ? (
              <div className="relative overflow-hidden rounded-2xl border border-[#B88433]/32 bg-[#FBF7F0]">
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src={coverImageUrl}
                    alt="Event cover preview"
                    fill
                    sizes="(max-width: 1024px) 100vw, 360px"
                    className="object-cover"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                  <span className="rounded-full bg-[#1B6343]/12 px-2.5 py-0.5 text-[11px] font-semibold text-[#154F35]">
                    {coverSizeBadge ?? "Uploaded Cover"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCoverImageUrl(null);
                      setCoverSizeBadge(null);
                    }}
                    className="inline-flex min-h-[32px] cursor-pointer items-center gap-1 text-xs font-semibold text-[#8E1E31] hover:underline"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex aspect-[16/10] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#B88433]/45 bg-[#FBF7F0] px-4 text-center transition-colors hover:border-[#54121F] hover:bg-[#F5ECDE]">
                <ImagePlus className="h-6 w-6 text-[#B88433]" />
                <span className="mt-2 text-xs font-semibold text-[#54121F]">
                  {uploadingCover
                    ? "Compressing & Uploading..."
                    : "Upload Cover Photo"}
                </span>
                <span className="mt-1 text-[11px] text-[#796258]">
                  Auto-compressed under 300KB WebP
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

          {/* Up to 4 Gallery Photos */}
          <div className="md:col-span-7">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#54121F]">
                Couple Gallery ({galleryImages.length} / {MAX_GALLERY_IMAGES})
              </p>
              {galleryImages.length < MAX_GALLERY_IMAGES && (
                <label className="inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-lg border border-[#54121F]/22 bg-white px-3 py-1.5 text-xs font-semibold text-[#54121F] transition-colors hover:bg-[#FBF3E5]">
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
              <label className="flex min-h-[156px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#B88433]/40 bg-[#FBF7F0] px-4 text-center transition-colors hover:border-[#54121F]">
                <ImagePlus className="h-6 w-6 text-[#B88433]" />
                <span className="mt-2 text-xs font-semibold text-[#54121F]">
                  {uploadingGallery
                    ? "Compressing & Uploading..."
                    : "Add up to 4 Couple Photos"}
                </span>
                <span className="mt-1 text-[11px] text-[#796258]">
                  Displayed with tap-to-zoom lightbox inside the invite
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
              <div className="grid grid-cols-2 gap-2.5">
                {galleryImages.map((url, idx) => (
                  <div
                    key={url}
                    className="relative overflow-hidden rounded-xl border border-[#B88433]/32 bg-[#FBF7F0]"
                  >
                    <div className="relative aspect-[4/3] w-full">
                      <Image
                        src={url}
                        alt={`Gallery photo ${idx + 1}`}
                        fill
                        sizes="(max-width: 768px) 45vw, 220px"
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
                      className="absolute right-2 top-2 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#221714]/80 text-white hover:bg-[#8E1E31]"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    {gallerySizeBadges[url] && (
                      <span className="absolute bottom-2 left-2 rounded-full bg-[#154F35]/90 px-2 py-0.5 text-[10px] font-semibold text-white">
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

      {/* 4. Tradition Symbol Visual Picker */}
      <section className="gold-shimmer-border rounded-2xl bg-[#FFFDF9] p-5 sm:p-6">
        <p className="font-display text-[10px] font-semibold uppercase tracking-[0.24em] text-[#B88433]">
          Step 04
        </p>
        <h2 className="mt-1 font-editorial text-2xl font-semibold text-[#470F1B]">
          Tradition Symbol
        </h2>

        <div className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-6">
          {TRADITION_SYMBOLS.map((sym) => {
            const active = traditionSymbol === sym.value;
            return (
              <button
                key={sym.value}
                type="button"
                onClick={() => setTraditionSymbol(sym.value)}
                className={`flex min-h-[96px] cursor-pointer flex-col items-center justify-center rounded-xl border px-2 py-3 text-center transition-all ${
                  active
                    ? "border-[#54121F] bg-[#FBF3E5] shadow-2xs ring-1 ring-[#54121F]"
                    : "border-[#B88433]/26 bg-white hover:bg-[#FBF7F0]"
                }`}
              >
                <div className="flex h-11 items-center justify-center">
                  {sym.value === "none" ? (
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-[#8E786C]">
                      None
                    </span>
                  ) : (
                    <TraditionSymbol
                      symbol={sym.value}
                      size={40}
                      className={active ? "text-[#54121F]" : "text-[#B88433]"}
                    />
                  )}
                </div>
                <p className="mt-1.5 text-[11px] font-semibold text-[#470F1B]">
                  {sym.label}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 5. Couture Theme Visual Palette Cards */}
      <section className="gold-shimmer-border rounded-2xl bg-[#FFFDF9] p-5 sm:p-6">
        <p className="font-display text-[10px] font-semibold uppercase tracking-[0.24em] text-[#B88433]">
          Step 05
        </p>
        <h2 className="mt-1 font-editorial text-2xl font-semibold text-[#470F1B]">
          Couture Theme Palette
        </h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {THEMES.map((theme) => {
            const active = themeId === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => setThemeId(theme.id)}
                className={`flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border p-4 text-left transition-all ${
                  active
                    ? "border-[#54121F] bg-[#FBF3E5] shadow-xs ring-1 ring-[#54121F]"
                    : "border-[#B88433]/28 bg-white hover:border-[#B88433]/65 hover:bg-[#FBF7F0]"
                }`}
              >
                {/* Miniature 3-stripe real color palette preview */}
                <div className="mb-3 flex h-3 w-full overflow-hidden rounded-full border border-black/10">
                  {theme.swatches.map((hex) => (
                    <span
                      key={hex}
                      className="flex-1"
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
                <p className="font-editorial text-xl font-semibold text-[#470F1B]">
                  {theme.name}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#6C5950]">
                  {theme.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 6. Opening Style Icon Cards + Particles + Scratch Reveal */}
      <section className="gold-shimmer-border rounded-2xl bg-[#FFFDF9] p-5 sm:p-6">
        <p className="font-display text-[10px] font-semibold uppercase tracking-[0.24em] text-[#B88433]">
          Step 06
        </p>
        <h2 className="mt-1 font-editorial text-2xl font-semibold text-[#470F1B]">
          3D Opening Ritual &amp; Interactive Craft
        </h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {OPENING_ANIMATIONS.map((anim) => {
            const Icon = OPENING_ICONS[anim.id];
            const active = openingAnimation === anim.id;
            return (
              <button
                key={anim.id}
                type="button"
                onClick={() => setOpeningAnimation(anim.id)}
                className={`flex cursor-pointer flex-col items-start rounded-2xl border p-4 text-left transition-all ${
                  active
                    ? "border-[#54121F] bg-[#54121F] text-[#FBF7F0] shadow-sm"
                    : "border-[#B88433]/28 bg-white text-[#470F1B] hover:border-[#B88433]/65 hover:bg-[#FBF7F0]"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    active ? "text-[#E7C06B]" : "text-[#B88433]"
                  }`}
                />
                <p className="mt-3 font-editorial text-xl font-semibold leading-snug">
                  {anim.name}
                </p>
                <p
                  className={`mt-1 text-xs leading-relaxed ${
                    active ? "text-[#F3E4C6]/82" : "text-[#6C5950]"
                  }`}
                >
                  {anim.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Particle Effect Visual Chips */}
        <div className="mt-6 border-t border-[#B88433]/20 pt-5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-[#B88433]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#54121F]">
              Falling Particles Overlay
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {PARTICLE_EFFECTS.map((effect) => {
              const active = particleEffect === effect.id;
              return (
                <button
                  key={effect.id}
                  type="button"
                  onClick={() => setParticleEffect(effect.id)}
                  className={`min-h-[56px] cursor-pointer rounded-xl border p-3 text-left transition-all ${
                    active
                      ? "border-[#54121F] bg-[#FBF3E5] ring-1 ring-[#54121F]"
                      : "border-[#B88433]/28 bg-white hover:bg-[#FBF7F0]"
                  }`}
                >
                  <p className="text-xs font-semibold text-[#470F1B]">
                    {effect.name}
                  </p>
                  <p className="mt-0.5 text-[10px] leading-snug text-[#796258]">
                    {effect.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Gold-Foil Scratch Reveal Toggle */}
        <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-[#B88433]/25 bg-[#FBF7F0] p-4">
          <div>
            <p className="text-sm font-semibold text-[#470F1B]">
              Gold-Foil Scratch-to-Reveal Date Card
            </p>
            <p className="mt-0.5 text-xs text-[#6C5950]">
              Guests rub brushed gold foil with their finger to reveal your main
              celebration date.
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
      </section>

      {/* 7. Real MP3 Studio Soundtrack Selector */}
      <section className="gold-shimmer-border rounded-2xl bg-[#FFFDF9] p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4 text-[#B88433]" />
          <p className="font-display text-[10px] font-semibold uppercase tracking-[0.24em] text-[#B88433]">
            Step 07 · Studio Audio
          </p>
        </div>
        <h2 className="mt-1 font-editorial text-2xl font-semibold text-[#470F1B]">
          Tap-to-Start Background Music
        </h2>
        <p className="mt-1 text-xs text-[#796258]">
          Plays real MP3 tracks from <code className="font-mono">/public/audio/</code>{" "}
          or your own uploaded MP3 (&lt;3MB) with a smooth 1.2s fade-in when guests tap to open.
        </p>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {MUSIC_TRACKS.map((track) => {
            const active = musicTrack === track.id;
            const canPreview =
              track.id !== "none" &&
              (track.id !== "custom" || Boolean(customMusicUrl));
            const isPreviewing = previewingTrack === track.id;

            return (
              <div
                key={track.id}
                className={`flex min-h-[58px] items-center justify-between gap-2 rounded-xl border p-3 transition-all ${
                  active
                    ? "border-[#54121F] bg-[#FBF3E5] ring-1 ring-[#54121F]"
                    : "border-[#B88433]/28 bg-white hover:bg-[#FBF7F0]"
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
                  <p className="text-xs font-semibold text-[#470F1B]">
                    {track.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#796258]">
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
                    className={`inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors ${
                      isPreviewing
                        ? "border-[#54121F] bg-[#54121F] text-[#F6DC9C]"
                        : "border-[#B88433]/38 bg-white text-[#54121F] hover:bg-[#F3EADC]"
                    }`}
                  >
                    {isPreviewing ? (
                      <Square className="h-3.5 w-3.5 fill-current" />
                    ) : (
                      <Play className="h-3.5 w-3.5 fill-current" />
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {musicTrack === "custom" && (
          <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-xl border border-[#B88433]/32 bg-[#FBF7F0] p-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold text-[#470F1B]">
                Custom MP3 Upload (Max 3 MB)
              </p>
              <p className="mt-0.5 text-[11px] text-[#796258]">
                {customMusicUrl
                  ? customMusicBadge ?? "Custom MP3 uploaded and ready"
                  : "Upload a lightweight .mp3 track under 3 MB."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-xl bg-[#54121F] px-4 py-2 text-xs font-semibold text-[#FBF7F0] hover:bg-[#3D0B16]">
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
                  className="min-h-[44px] cursor-pointer rounded-xl border border-[#8E1E31]/30 bg-white px-3.5 py-2 text-xs font-semibold text-[#8E1E31] hover:bg-[#8E1E31]/8"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* 8. RSVP Toggle + Owner-Only Delete */}
      <section className="gold-shimmer-border flex flex-col items-start justify-between gap-4 rounded-2xl bg-[#FFFDF9] p-5 sm:flex-row sm:items-center sm:p-6">
        <div>
          <h2 className="font-editorial text-2xl font-semibold text-[#470F1B]">
            Guest RSVP Collection
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-[#6C5950]">
            Toggle off to make your invitation view-only without an RSVP form.
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={rsvpEnabled}
          aria-label="Toggle RSVP Enabled"
          onClick={() => setRsvpEnabled((prev) => !prev)}
          className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer items-center rounded-full p-1 transition-colors ${
            rsvpEnabled ? "bg-[#1B6343]" : "bg-[#C7B8AD]"
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
              rsvpEnabled ? "translate-x-8" : "translate-x-0"
            }`}
          />
        </button>
      </section>

      {/* Standard Footer Save & Owner-Only Danger Zone */}
      <div className="flex flex-col-reverse items-stretch justify-between gap-4 border-t border-[#B88433]/22 pt-5 sm:flex-row sm:items-center">
        <div>
          {isOwner &&
            (!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 text-xs font-semibold text-[#8E1E31] hover:underline"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete This Event
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#8E1E31]/35 bg-[#8E1E31]/8 px-3.5 py-2 text-xs">
                <span className="font-medium text-[#6B1222]">
                  Delete event &amp; all RSVPs permanently?
                </span>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDeleteEvent}
                  className="min-h-[36px] cursor-pointer rounded-lg bg-[#8E1E31] px-3 py-1 font-semibold text-white hover:bg-[#6B1222]"
                >
                  {deleting ? "Deleting..." : "Confirm Delete"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="min-h-[36px] cursor-pointer rounded-lg border border-[#8E1E31]/30 bg-white px-2.5 py-1 font-medium text-[#6B1222]"
                >
                  Cancel
                </button>
              </div>
            ))}
        </div>

        <button
          type="submit"
          disabled={saving || busyUploading}
          className="inline-flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#54121F] px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FBF7F0] shadow-md transition-colors hover:bg-[#3D0B16] disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving Changes..." : "Save Basics & Design"}
        </button>
      </div>

      {/* Floating Glassmorphic Sticky Save Bar (Always Within Thumb Reach When Unsaved) */}
      {isDirty && (
        <div className="glass-luxury fixed inset-x-3 bottom-4 z-40 mx-auto flex max-w-lg items-center justify-between gap-3 rounded-2xl px-4 py-3 shadow-[0_18px_48px_rgba(48,12,20,0.22)] sm:inset-x-auto sm:left-1/2 sm:w-full sm:-translate-x-1/2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#C88A2E]" />
            <span className="truncate text-xs font-semibold text-[#470F1B]">
              Unsaved design changes
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleResetChanges}
              disabled={saving}
              className="inline-flex min-h-[40px] cursor-pointer items-center gap-1 rounded-xl border border-[#B88433]/35 bg-white px-3 py-1.5 text-xs font-semibold text-[#6C5950] hover:bg-[#FBF3E5]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              type="submit"
              disabled={saving || busyUploading}
              className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-xl bg-[#54121F] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#FBF7F0] shadow-sm transition-colors hover:bg-[#3D0B16] disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
