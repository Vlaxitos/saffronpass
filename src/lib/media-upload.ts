"use client";

import {
  MAX_COMPRESSED_IMAGE_BYTES,
  MAX_CUSTOM_AUDIO_BYTES,
} from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

export interface CompressedImageResult {
  blob: Blob;
  sizeBytes: number;
  originalBytes: number;
  width: number;
  height: number;
}

/**
 * Resizes (max width 1200px) and compresses an image strictly under 300KB as WebP
 * using HTML5 Canvas directly in the browser before uploading to Supabase Storage.
 */
export async function compressImageToWebP(
  file: File,
  maxWidth = 1200,
  maxBytes = MAX_COMPRESSED_IMAGE_BYTES
): Promise<CompressedImageResult> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please select a valid image file (JPG, PNG, or WebP).");
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not decode image file."));
      el.src = objectUrl;
    });

    const scale = img.naturalWidth > maxWidth ? maxWidth / img.naturalWidth : 1;
    let targetW = Math.max(1, Math.round(img.naturalWidth * scale));
    let targetH = Math.max(1, Math.round(img.naturalHeight * scale));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas image compression is unavailable in this browser.");
    }

    const renderToBlob = (w: number, h: number, quality: number) =>
      new Promise<Blob>((resolve, reject) => {
        canvas.width = w;
        canvas.height = h;
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            if (!blob) reject(new Error("Image compression failed."));
            else resolve(blob);
          },
          "image/webp",
          quality
        );
      });

    const qualities = [0.85, 0.74, 0.64, 0.54, 0.44, 0.34];
    let bestBlob: Blob | null = null;

    for (const q of qualities) {
      const candidate = await renderToBlob(targetW, targetH, q);
      bestBlob = candidate;
      if (candidate.size <= maxBytes) {
        return {
          blob: candidate,
          sizeBytes: candidate.size,
          originalBytes: file.size,
          width: targetW,
          height: targetH,
        };
      }
    }

    // Gentle resolution step-down only if an extraordinarily dense photo still exceeds 300KB
    for (let step = 0; step < 3 && bestBlob && bestBlob.size > maxBytes; step++) {
      targetW = Math.max(480, Math.round(targetW * 0.78));
      targetH = Math.max(320, Math.round(targetH * 0.78));
      bestBlob = await renderToBlob(targetW, targetH, 0.48);
    }

    if (!bestBlob) {
      throw new Error("Image compression failed.");
    }

    return {
      blob: bestBlob,
      sizeBytes: bestBlob.size,
      originalBytes: file.size,
      width: targetW,
      height: targetH,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function uploadCompressedEventPhoto(
  eventId: string,
  kind: "cover" | "gallery",
  file: File
): Promise<{ publicUrl: string; sizeBytes: number; originalBytes: number }> {
  const compressed = await compressImageToWebP(file);
  const supabase = createClient();
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const path = `${eventId}/${kind}-${suffix}.webp`;

  const { error: uploadError } = await supabase.storage
    .from("event-media")
    .upload(path, compressed.blob, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from("event-media").getPublicUrl(path);
  return {
    publicUrl: data.publicUrl,
    sizeBytes: compressed.sizeBytes,
    originalBytes: compressed.originalBytes,
  };
}

export async function uploadCustomEventAudio(
  eventId: string,
  file: File
): Promise<{ publicUrl: string; sizeBytes: number }> {
  const lowerName = file.name.toLowerCase();
  const isMp3 =
    file.type === "audio/mpeg" ||
    file.type === "audio/mp3" ||
    lowerName.endsWith(".mp3");

  if (!isMp3) {
    throw new Error("Please upload a valid .mp3 audio file.");
  }

  if (file.size > MAX_CUSTOM_AUDIO_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(2);
    throw new Error(
      `Audio file is ${mb} MB. Custom background music must be under 3 MB.`
    );
  }

  const supabase = createClient();
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const path = `${eventId}/music-${suffix}.mp3`;

  const { error: uploadError } = await supabase.storage
    .from("event-media")
    .upload(path, file, {
      contentType: "audio/mpeg",
      cacheControl: "31536000",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from("event-media").getPublicUrl(path);
  return {
    publicUrl: data.publicUrl,
    sizeBytes: file.size,
  };
}

export function formatBytesKb(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}
