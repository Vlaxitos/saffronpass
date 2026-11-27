import type {
  EtiquetteType,
  EventType,
  MusicTrackType,
  OpeningAnimationType,
  ParticleEffectType,
  PlanTier,
  SideTag,
  ThemeId,
  TraditionSymbolType,
} from "@/types/database";

export const FREE_PLAN_RSVP_LIMIT = 5;
export const MAX_COHOSTS_PER_EVENT = 3;
export const MAX_GALLERY_IMAGES = 4;
export const MAX_COMPRESSED_IMAGE_BYTES = 300 * 1024;
export const MAX_CUSTOM_AUDIO_BYTES = 3 * 1024 * 1024;

export const EVENT_TYPES: { value: EventType; label: string; subtitle: string }[] = [
  { value: "wedding", label: "Wedding", subtitle: "Multi-day royal celebrations" },
  { value: "engagement", label: "Engagement / Roka", subtitle: "Ring ceremony & sagai" },
  { value: "housewarming", label: "Housewarming", subtitle: "Griha Pravesh & puja" },
  { value: "anniversary", label: "Anniversary", subtitle: "Silver, golden & milestones" },
  { value: "birthday", label: "Milestone Birthday", subtitle: "50th, 60th & grand soirées" },
  { value: "baby_shower", label: "Baby Shower", subtitle: "Godh Bharai & blessings" },
  { value: "custom", label: "Custom Celebration", subtitle: "Bespoke private gathering" },
];

export const TRADITION_SYMBOLS: { value: TraditionSymbolType; label: string; subtitle: string }[] = [
  { value: "ganesh", label: "Shree Ganesh", subtitle: "Auspicious Hindu crest" },
  { value: "bismillah", label: "Bismillah", subtitle: "Graceful crescent & star" },
  { value: "ek_onkar", label: "Ek Onkar", subtitle: "Sacred Sikh emblem" },
  { value: "cross", label: "Sacred Cross", subtitle: "Botanical cathedral cross" },
  { value: "floral", label: "Floral Minimal", subtitle: "Heritage lotus motif" },
  { value: "none", label: "None", subtitle: "Clean typographic header" },
];

export const THEMES: {
  id: ThemeId;
  name: string;
  description: string;
  swatches: [string, string, string];
}[] = [
  {
    id: "royal_saffron",
    name: "Royal Saffron & Gold",
    description: "Deep heritage maroon, antique gold foil accents, and warm ivory parchment.",
    swatches: ["#5B1422", "#C88A2E", "#FCF8F1"],
  },
  {
    id: "minimal_ivory",
    name: "Minimal Ivory",
    description: "Luminous pearl cotton stationery with champagne bronze hairlines and serene elegance.",
    swatches: ["#FAF6EF", "#A68246", "#2B211E"],
  },
  {
    id: "pastel_udaipur",
    name: "Pastel Udaipur",
    description: "Warm peach-blush ivory canvas, rose sandstone tones, and antique gold palace borders.",
    swatches: ["#FBECE4", "#C99A5B", "#7A2E3A"],
  },
  {
    id: "south_indian_silk",
    name: "South Indian Silk & Jasmine",
    description: "Kanjeevaram emerald silk, temple-gold zari highlights, and fragrant warm jasmine cream.",
    swatches: ["#0F4C3A", "#D4A024", "#FDF9F0"],
  },
  {
    id: "dark_sangeet_glam",
    name: "Dark Sangeet Glam",
    description: "Midnight obsidian & royal plum backdrop with shimmering champagne gold typography.",
    swatches: ["#160B18", "#E8C67A", "#33173B"],
  },
];

export const OPENING_ANIMATIONS: {
  id: OpeningAnimationType;
  name: string;
  description: string;
}[] = [
  {
    id: "wax_seal",
    name: "Wax-Seal Envelope",
    description: "Textured heirloom envelope with a glowing gold SaffronPass wax seal that unfolds on tap.",
  },
  {
    id: "palace_doors",
    name: "Royal Palace Doors",
    description: "Ornate symmetrical palace doors that sweep apart gracefully to reveal your invitation.",
  },
  {
    id: "cinematic_scroll",
    name: "Cinematic Scroll Reveal",
    description: "Full-screen couple hero showcase with dramatic gold typography gliding into animated cards.",
  },
];

export const PARTICLE_EFFECTS: {
  id: ParticleEffectType;
  name: string;
  description: string;
}[] = [
  { id: "none", name: "None", description: "Clean stillness without floating particles" },
  { id: "marigold", name: "Marigold Petals", description: "Warm festive genda petals gently drifting" },
  { id: "rose_petals", name: "Rose Petals", description: "Romantic crimson & blush petals floating" },
  { id: "gold_sparkles", name: "Gold Sparkles", description: "Subtle shimmering golden light motes" },
];

export const MUSIC_TRACKS: {
  id: MusicTrackType;
  name: string;
  description: string;
}[] = [
  { id: "none", name: "No Background Music", description: "Silent invitation experience" },
  { id: "royal_shehnai", name: "Royal Shehnai", description: "Festive Indian pentatonic melody & soft drone" },
  { id: "romantic_piano", name: "Romantic Piano", description: "Gentle romantic piano arpeggio loop" },
  { id: "sitar_bliss", name: "Sitar Bliss", description: "Soft plucked raga string ambiance" },
  { id: "celebration_chimes", name: "Celebration Chimes", description: "Golden wedding bells & warm ambient pad" },
  { id: "acoustic_warmth", name: "Acoustic Warmth", description: "Warm acoustic plucked chord progression" },
  { id: "custom", name: "Custom MP3 Upload", description: "Upload your own audio track (max 3MB)" },
];

export const SIDE_TAGS: { value: SideTag; label: string }[] = [
  { value: "bride", label: "Bride's Side" },
  { value: "groom", label: "Groom's Side" },
  { value: "common", label: "Common" },
];

export const ETIQUETTE_OPTIONS: {
  value: EtiquetteType;
  label: string;
  description: string;
  defaultSeats: number;
}[] = [
  {
    value: "solo",
    label: "Solo — 1 Seat Strictly",
    description: "Personal invite for 1 guest; guest count selector stays hidden.",
    defaultSeats: 1,
  },
  {
    value: "couple",
    label: "Couple — Max 2 Seats",
    description: "Guests can select 1 or 2 seats per attending function.",
    defaultSeats: 2,
  },
  {
    value: "family",
    label: "With Family — Custom Max",
    description: "Saparivar invite allowing 1 up to your chosen seat cap per event.",
    defaultSeats: 4,
  },
];

export const SUB_EVENT_PRESETS = [
  { name: "Haldi", start_time: "10:30 AM", dress_code: "Marigold & Sunshine Yellow" },
  { name: "Mehendi", start_time: "3:00 PM", dress_code: "Emerald & Pastel Festive" },
  { name: "Sangeet", start_time: "7:30 PM", dress_code: "Indo-Western Glamour" },
  { name: "Wedding", start_time: "6:00 PM", dress_code: "Traditional Royal Ethnic" },
  { name: "Reception", start_time: "8:00 PM", dress_code: "Black Tie / Formal Indian" },
  { name: "Griha Pravesh Puja", start_time: "9:30 AM", dress_code: "Traditional Ethnic" },
  { name: "Cocktail Dinner", start_time: "7:30 PM", dress_code: "Evening Cocktail" },
];

export const MEAL_PREFERENCES = ["Veg", "Non-Veg", "Jain"] as const;

export const PLAN_LABELS: Record<PlanTier, string> = {
  free: "Free Preview",
  celebration_pass: "Celebration Pass",
  celebration_pro: "Celebration Pro",
  wedding_standard: "Wedding Standard",
  wedding_pro: "Wedding Pro",
  vip: "Done-For-You VIP",
};

export function getEventTypeLabel(type: EventType): string {
  return EVENT_TYPES.find((item) => item.value === type)?.label ?? "Celebration";
}

export function getSideTagLabel(side: SideTag): string {
  return SIDE_TAGS.find((item) => item.value === side)?.label ?? "Common";
}

export function normalizeThemeId(raw: string | null | undefined): ThemeId {
  switch (raw) {
    case "minimal_ivory":
    case "pastel_udaipur":
    case "south_indian_silk":
    case "dark_sangeet_glam":
    case "royal_saffron":
      return raw;
    default:
      return "royal_saffron";
  }
}
