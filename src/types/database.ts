export type UserRole = "user" | "agency" | "admin";

export type EventType =
  | "wedding"
  | "engagement"
  | "housewarming"
  | "anniversary"
  | "birthday"
  | "baby_shower"
  | "custom";

export type TraditionSymbolType =
  | "ganesh"
  | "bismillah"
  | "ek_onkar"
  | "cross"
  | "floral"
  | "none";

export type OpeningAnimationType =
  | "wax_seal"
  | "palace_doors"
  | "cinematic_scroll";

export type ThemeId =
  | "royal_saffron"
  | "minimal_ivory"
  | "pastel_udaipur"
  | "south_indian_silk"
  | "dark_sangeet_glam";

export type ParticleEffectType =
  | "none"
  | "marigold"
  | "rose_petals"
  | "gold_sparkles";

export type MusicTrackType =
  | "none"
  | "royal_shehnai"
  | "romantic_piano"
  | "sitar_bliss"
  | "celebration_chimes"
  | "acoustic_warmth"
  | "custom";

export type PlanTier =
  | "free"
  | "celebration_pass"
  | "celebration_pro"
  | "wedding_standard"
  | "wedding_pro"
  | "vip";

export type SideTag = "bride" | "groom" | "common";

export type EtiquetteType = "solo" | "couple" | "family";

export type MealPreference = "Veg" | "Non-Veg" | "Jain" | "";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  agency_credits: number;
  agency_brand_name: string | null;
  ai_uses_count: number;
  created_at: string;
}

export interface EventRecord {
  id: string;
  host_id: string;
  slug: string;
  event_type: EventType;
  title: string;
  host_names: string;
  tradition_symbol: TraditionSymbolType;
  event_date: string | null;
  welcome_message: string | null;
  theme_id: ThemeId | string;
  opening_animation: OpeningAnimationType;
  design_config: Record<string, unknown>;
  rsvp_enabled: boolean;
  plan: PlanTier;
  expires_at: string | null;
  created_at: string;
  // Phase 2 fields
  cover_image_url?: string | null;
  gallery_images?: string[] | null;
  particle_effect?: ParticleEffectType | null;
  scratch_reveal_enabled?: boolean | null;
  music_track?: MusicTrackType | null;
  custom_music_url?: string | null;
}

export interface EventCohostRecord {
  id: string;
  event_id: string;
  email: string;
  side_tag: SideTag;
  invited_by: string | null;
  created_at: string;
}

export interface SubEventRecord {
  id: string;
  event_id: string;
  name: string;
  event_date: string | null;
  start_time: string | null;
  venue_name: string | null;
  maps_url: string | null;
  dress_code: string | null;
  sort_order: number;
}

export interface InviteCategoryRecord {
  id: string;
  event_id: string;
  name: string;
  code: string;
  side_tag: SideTag;
  etiquette_type: EtiquetteType;
  max_seats: number;
  allowed_sub_event_ids: string[];
  greeting_prefix: string | null;
  created_at: string;
}

export interface RsvpSubEventRecord {
  id: string;
  rsvp_id: string;
  sub_event_id: string;
  attending: boolean;
  guest_count: number;
}

export interface RsvpRecord {
  id: string;
  event_id: string;
  category_id: string | null;
  guest_name: string;
  phone_number: string;
  overall_attending: boolean;
  meal_preference: string | null;
  note: string | null;
  is_manual: boolean;
  created_at: string;
  updated_at: string;
  rsvp_sub_events?: RsvpSubEventRecord[];
}

/**
 * Strictly minimized DTO returned to public guest invite pages.
 * NEVER includes host_id, other categories, hidden sub-events, or other guests' data.
 */
export interface PublicSubEventDTO {
  id: string;
  name: string;
  event_date: string | null;
  start_time: string | null;
  venue_name: string | null;
  maps_url: string | null;
  dress_code: string | null;
  sort_order: number;
}

export interface PublicInviteDTO {
  event: {
    slug: string;
    event_type: EventType;
    title: string;
    host_names: string;
    tradition_symbol: TraditionSymbolType;
    event_date: string | null;
    welcome_message: string | null;
    theme_id: ThemeId | string;
    opening_animation: OpeningAnimationType;
    rsvp_enabled: boolean;
    plan: PlanTier;
    cover_image_url: string | null;
    gallery_images: string[];
    particle_effect: ParticleEffectType;
    scratch_reveal_enabled: boolean;
    music_track: MusicTrackType;
    custom_music_url: string | null;
  };
  category: {
    code: string;
    etiquette_type: EtiquetteType;
    max_seats: number;
    greeting_prefix: string | null;
  };
  sub_events: PublicSubEventDTO[];
}
