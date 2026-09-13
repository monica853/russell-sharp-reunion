// Names of the tabs (sheets) inside the single Google Sheet used as the
// site's database. Create these tabs in your sheet with header rows
// matching the column comments below.
export const REG_TAB = "Registrations";
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

// ── Registrations — one row PER ATTENDEE ─────────────────────────────
// Household-level fields (password, totals, emergency contact, etc.) only
// live on the row where IsPrimary = TRUE for that household — that's the
// one row staff edits Amount Paid on. Other attendee rows for the same
// household leave those columns blank.
export const REG_COLS = {
  timestamp: 0,
  householdEmail: 1,
  primaryName: 2,
  isPrimary: 3,
  password: 4,
  lodgingSelection: 5,
  accommodations: 6,
  emergencyName: 7,
  emergencyPhone: 8,
  totalOwed: 9,
  amountPaid: 10,
  notes: 11,
  attendeeName: 12,
  ageGroup: 13,
  tshirtSize: 14,
} as const;
