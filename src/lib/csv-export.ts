import { getSideTagLabel } from "@/lib/constants";
import type {
  InviteCategoryRecord,
  RsvpRecord,
  SubEventRecord,
} from "@/types/database";

function escapeCsvCell(value: string | number | null | undefined): string {
  const raw = String(value ?? "");
  // Prevent CSV formula injection when opened in Excel
  const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  if (/[",\r\n]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

export function isManualPlaceholderPhone(phone: string): boolean {
  return phone.startsWith("manual_");
}

/**
 * Generates an Excel-ready UTF-8 CSV (with \uFEFF BOM for clean Hindi/regional script display)
 * including one column per sub-event and a final TOTALS caterer summary row.
 */
export function buildCatererCsv(params: {
  rsvps: RsvpRecord[];
  subEvents: SubEventRecord[];
  categories: InviteCategoryRecord[];
}): string {
  const { rsvps, subEvents, categories } = params;
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const headers = [
    "Guest Name",
    "Phone",
    "Side",
    "Category",
    "Entry Type",
    "Status",
    "Meal Preference",
    "Note",
    "Total Max Guests",
    ...subEvents.map((se) => se.name),
  ];

  const subEventTotals = new Array<number>(subEvents.length).fill(0);
  let grandMaxGuestsTotal = 0;

  const rows: string[][] = rsvps.map((rsvp) => {
    const cat = rsvp.category_id ? categoryMap.get(rsvp.category_id) : null;
    const subMap = new Map(
      (rsvp.rsvp_sub_events ?? []).map((item) => [item.sub_event_id, item])
    );

    const perEventCounts = subEvents.map((se, idx) => {
      const entry = subMap.get(se.id);
      const count =
        rsvp.overall_attending && entry?.attending ? entry.guest_count : 0;
      subEventTotals[idx] += count;
      return count;
    });

    const rowMaxGuests = rsvp.overall_attending
      ? perEventCounts.length > 0
        ? Math.max(0, ...perEventCounts)
        : 1
      : 0;
    grandMaxGuestsTotal += rowMaxGuests;

    const cleanPhone = isManualPlaceholderPhone(rsvp.phone_number)
      ? ""
      : rsvp.phone_number;

    return [
      rsvp.guest_name,
      cleanPhone,
      getSideTagLabel(cat?.side_tag ?? "common"),
      cat ? cat.name : "Uncategorized",
      rsvp.is_manual ? "Manual" : "Online",
      rsvp.overall_attending ? "Attending" : "Declined",
      rsvp.meal_preference ?? "",
      rsvp.note ?? "",
      String(rowMaxGuests),
      ...perEventCounts.map(String),
    ];
  });

  const totalsRow = [
    "TOTALS",
    `${rsvps.length} RSVPs`,
    "",
    "",
    "",
    `${rsvps.filter((r) => r.overall_attending).length} Attending`,
    "",
    "",
    String(grandMaxGuestsTotal),
    ...subEventTotals.map(String),
  ];

  const allLines = [headers, ...rows, totalsRow].map((cols) =>
    cols.map(escapeCsvCell).join(",")
  );

  // Prefix UTF-8 BOM so Microsoft Excel renders Hindi & regional Unicode cleanly
  return `\uFEFF${allLines.join("\r\n")}`;
}
