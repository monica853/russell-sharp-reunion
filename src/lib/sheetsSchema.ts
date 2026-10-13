// Names of the tabs (sheets) inside the single Google Sheet used as the
// site's database. Create these tabs in your sheet with header rows
// matching the column comments below.
export const INTEREST_TAB = "Interest List";
export const GATHERINGS_TAB = "Family Gatherings";
export const CONNECTIONS_TAB = "Family Connections";
export const CONTACT_TAB = "Contact Messages";

export const RATE_MAP: Record<string, number> = {
  "75+": 95,
  "18–74": 195,
  "12–17": 30,
  "5–11": 20,
  "Under 5": 5,
};

// ── Interest List — one row PER PERSON, not per household ───────────
// This makes it trivial to filter/sort by age group or T-shirt size
// directly in the sheet, and to see every member of a household at a
// glance by filtering on Household Email. Household-level fields (email,
// primary contact info, lodging, etc.) are repeated on every row for that
// household so each row is self-contained.
export const INTEREST_COLS = {
  timestamp: 0,
  householdEmail: 1,
  primaryName: 2,
  phone: 3,
  familyBranch: 4,
  city: 5,
  state: 6,
  lodgingNeeded: 7,
  numRooms: 8,
  accessibilityDietary: 9,
  activitiesInterest: 10,
  personName: 11,
  relationship: 12,
  ageGroup: 13,
  tshirtSize: 14,
} as const;

// ── Household Directory — ONE row per registered household ─────────
// A: Sheet Name (the name of that household's own invoice tab)
// B: Primary Name   C: Phone   D: Household Email   E: Password
// F: Lodging Selection   G: Accommodations
// H: Emergency Name   I: Emergency Phone
// J: Total Owed   K: Amount Paid   (both kept up to date by the site)
// L: City   M: State   N: Notes
export const DIRECTORY_TAB = "Household Directory";
export const DIR_COLS = {
  sheetName: 0,
  primaryName: 1,
  phone: 2,
  householdEmail: 3,
  password: 4,
  lodgingSelection: 5,
  accommodations: 6,
  emergencyName: 7,
  emergencyPhone: 8,
  totalOwed: 9,
  amountPaid: 10,
  city: 11,
  state: 12,
  notes: 13,
  policyAcceptedAt: 14, // O: timestamp the household accepted the Payment, Cancellation & Transfer Policy
} as const;

// ── Household invoice tabs — one tab per household, named in Directory col A ──
// Rows 1–5: household summary (written by the site). Row 7: column headers.
// Row 8 onward: one line per attendee (a charge) or per payment (a credit).
// A: Date   B: Type ("Attendee Name" or "Payment")   C: Name / Description
// D: Relationship   E: Age Group   F: T-Shirt Size
// G: Charges   H: Credits   I: Line Total (running balance)   J: Reference
export const INV_HEADER_ROW = 7;
export const INV_FIRST_ROW = 8;
export const INV_TYPE_ATTENDEE = "Attendee Name";
export const INV_TYPE_PAYMENT = "Payment";
export const INV_COLS = {
  date: 0,
  type: 1,
  name: 2,
  relationship: 3,
  ageGroup: 4,
  tshirtSize: 5,
  charges: 6,
  credits: 7,
  lineTotal: 8,
  reference: 9,
} as const;

export const AGE_GROUPS = Object.keys(RATE_MAP);
export const SHIRT_SIZES = ["Youth S", "Youth M", "Youth L", "Adult S", "Adult M", "Adult L", "Adult XL", "Adult 2XL", "Adult 3XL"];
