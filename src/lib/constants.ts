import type {
  EtiquetteType,
  EventType,
  OpeningAnimationType,
  PlanTier,
  SideTag,
  ThemeId,
  TraditionSymbolType,
} from "@/types/database";

export const FREE_PLAN_RSVP_LIMIT = 5;

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
