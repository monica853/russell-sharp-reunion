// ── Russell–Sharp Reunion site config ─────────────────────────────
// Edit the values below as the reunion moves through its phases.
// No other file needs to change when you flip these.

// Which phase is currently active. This controls which buttons/forms
// are "live" across the site vs. shown as "coming soon."
//   1 = Interest & Planning   (Sep–Dec 2026)
//   2 = Registration & Deposit (opens after Phase 1)
//   3 = Lodging & Final Selections (early 2027)
//   4 = Final Reunion Information (Jul–Aug 2027)
export const CURRENT_PHASE: 1 | 2 | 3 | 4 = 1;

export const REUNION_DATE = "2027-09-03T09:00:00-04:00";

// ── Email ──────────────────────────────────────────────────────────
// The address confirmation emails are sent from. Must match the domain
// you verified in Resend (see README).
export const FROM_EMAIL = "updates@russellsharpfamily.com";

// Every family member who submits the Interest List, Registers, or submits
// a Family Gathering gets their own confirmation email automatically. In
// ADDITION to that, everyone in this list gets a CC'd copy of every one of
// those emails, so more than one person can keep an eye on new activity
// without needing to check the Google Sheet themselves. Add or remove
// emails here any time.
export const ALERT_CC_EMAILS: string[] = [
  "shaw0033@gmail.com",
  "monicalrussell@gmail.com",
];

export const HOTEL = {
  name: "Aloft Lawrenceville Sugarloaf",
  address: "2110 North Brown Road NW",
  cityStateZip: "Lawrenceville, GA 30043",
};
