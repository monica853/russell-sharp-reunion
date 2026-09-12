// Names of the tabs (sheets) inside the single Google Sheet used as the
// site's database. Create these tabs in your sheet with header rows
// matching the column comments in each API route that writes to them.
export const REG_TAB = "Registrations";
export const INTEREST_TAB = "Interest List";
export const GATHERINGS_TAB = "Family Gatherings";
export const CONNECTIONS_TAB = "Family Connections";
export const CONTACT_TAB = "Contact Messages";

export const RATE_MAP: Record<string, number> = {
  "75+": 0,
  "18-74": 195,
  "12-17": 30,
  "5-11": 20,
  "Under 5": 5,
};
