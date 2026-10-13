import { NextRequest, NextResponse } from "next/server";
import { getSheetValues, writeRange, updateCell, createInvoiceTab, listTabTitles } from "@/lib/googleSheets";
import { sendEmail, alertCcList } from "@/lib/email";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";
import {
  DIRECTORY_TAB,
  DIR_COLS,
  DIR_FIRST_ROW,
  INV_COLS,
  INV_FIRST_ROW,
  INV_HEADER_ROW,
  INV_TYPE_ATTENDEE,
  INV_TYPE_PAYMENT,
} from "@/lib/sheetsSchema";

export type InvoiceLine = {
  rowNum: number; // actual sheet row (1-indexed)
  date: string;
  type: string;
  name: string;
  relationship: string;
  ageGroup: string;
  tshirtSize: string;
  charges: number;
  credits: number;
  lineTotal: number;
  reference: string;
};

export type Household = {
  dirRowNum: number;
  row: string[];
  sheetName: string;
  email: string;
  name: string;
};

export function today(): string {
  return new Date().toLocaleDateString("en-US", { timeZone: "America/New_York" });
}

export async function findHousehold(email: string): Promise<Household | null> {
  const rows = await getSheetValues(DIRECTORY_TAB).catch(() => [] as string[][]);
  const target = email.trim().toLowerCase();
  for (let i = DIR_FIRST_ROW - 1; i < rows.length; i++) {
    if (String(rows[i][DIR_COLS.householdEmail] ?? "").trim().toLowerCase() === target) {
      return {
        dirRowNum: i + 1,
        row: rows[i],
        sheetName: String(rows[i][DIR_COLS.sheetName] ?? ""),
        email: target,
        name: String(rows[i][DIR_COLS.primaryName] ?? ""),
      };
    }
  }
  return null;
}

// Used by routes that require a logged-in household.
export async function requireHousehold(req: NextRequest): Promise<Household | NextResponse> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? verifySession(token) : null;
  if (!session) return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  const h = await findHousehold(session.householdId);
  if (!h || !h.sheetName) return NextResponse.json({ error: "We couldn't find your registration." }, { status: 404 });
  return h;
}

// Adds a household to the Directory at the first free row (never above row 3).
export async function appendDirectoryRow(values: (string | number)[]): Promise<void> {
  const rows = await getSheetValues(DIRECTORY_TAB).catch(() => [] as string[][]);
  const next = Math.max(rows.length + 1, DIR_FIRST_ROW);
  await writeRange(DIRECTORY_TAB, `A${next}`, [values]);
}

// Records one payment (idempotent by Square payment ID): adds a "Payment" line
// to the household's invoice tab, refreshes Directory totals, emails a receipt.
// Returns true if newly recorded, false if it was already recorded.
export async function recordPayment(h: Household, paymentId: string, amount: number): Promise<boolean> {
  const before = await loadInvoice(h.sheetName);
  if (before.some((l) => l.reference === paymentId)) return false;
  const lines = await appendInvoiceLines(h, [
    { type: INV_TYPE_PAYMENT, name: "Square payment", credits: amount, reference: paymentId },
  ]);
  const { totalOwed, amountPaid, balance } = totals(lines);
  await sendEmail({
    to: h.email,
    cc: alertCcList(),
    subject: "Payment received — Russell–Sharp Family Reunion",
    text: `Hi ${h.name},

We received your payment of $${amount.toFixed(2)}. Thank you!

Household total: $${totalOwed.toFixed(2)}
Paid to date: $${amountPaid.toFixed(2)}
Remaining balance: $${balance.toFixed(2)}

You can check your balance or make another payment anytime at russellsharpfamily.com/my-invoice.

Same Roots. New Vibes.
— Russell–Sharp Family Reunion`,
  });
  return true;
}

export async function loadInvoice(sheetName: string): Promise<InvoiceLine[]> {
  const rows = await getSheetValues(sheetName);
  const lines: InvoiceLine[] = [];
  for (let i = INV_FIRST_ROW - 1; i < rows.length; i++) {
    const r = rows[i] ?? [];
    const type = String(r[INV_COLS.type] ?? "").trim();
    if (!type) continue;
    lines.push({
      rowNum: i + 1,
      date: String(r[INV_COLS.date] ?? ""),
      type,
      name: String(r[INV_COLS.name] ?? ""),
      relationship: String(r[INV_COLS.relationship] ?? ""),
      ageGroup: String(r[INV_COLS.ageGroup] ?? ""),
      tshirtSize: String(r[INV_COLS.tshirtSize] ?? ""),
      charges: Number(r[INV_COLS.charges] ?? 0) || 0,
      credits: Number(r[INV_COLS.credits] ?? 0) || 0,
      lineTotal: Number(r[INV_COLS.lineTotal] ?? 0) || 0,
      reference: String(r[INV_COLS.reference] ?? ""),
    });
  }
  return lines;
}

export function totals(lines: InvoiceLine[]) {
  const totalOwed = Math.round(lines.reduce((s, l) => s + l.charges, 0) * 100) / 100;
  const amountPaid = Math.round(lines.reduce((s, l) => s + l.credits, 0) * 100) / 100;
  return { totalOwed, amountPaid, balance: Math.max(0, Math.round((totalOwed - amountPaid) * 100) / 100) };
}

// Appends lines to the household's invoice tab (with running-total formulas),
// then refreshes Total Owed / Amount Paid on the Directory row.
type NewLine = {
    type: string;
    name: string;
    relationship?: string;
    ageGroup?: string;
    tshirtSize?: string;
    charges?: number;
    credits?: number;
    reference?: string;
};

// Writes lines to the bottom of an invoice tab (no Directory update).
export async function writeInvoiceLines(sheetName: string, newLines: NewLine[]): Promise<void> {
  const existing = await getSheetValues(sheetName);
  const startRow = Math.max(existing.length + 1, INV_FIRST_ROW);
  const date = today();
  const values = newLines.map((l, i) => {
    const n = startRow + i;
    return [
      date,
      l.type,
      l.name,
      l.relationship ?? "",
      l.ageGroup ?? "",
      l.tshirtSize ?? "",
      l.charges ?? "",
      l.credits ?? "",
      `=SUM($G$${INV_FIRST_ROW}:G${n})-SUM($H$${INV_FIRST_ROW}:H${n})`,
      l.reference ?? "",
    ];
  });
  await writeRange(sheetName, `A${startRow}`, values);
}

// Appends lines, then refreshes Total Owed / Amount Paid on the Directory row.
export async function appendInvoiceLines(
  h: Pick<Household, "dirRowNum" | "sheetName">,
  newLines: NewLine[]
): Promise<InvoiceLine[]> {
  await writeInvoiceLines(h.sheetName, newLines);
  return refreshDirectoryTotals(h);
}

export async function refreshDirectoryTotals(h: Pick<Household, "dirRowNum" | "sheetName">): Promise<InvoiceLine[]> {
  const lines = await loadInvoice(h.sheetName);
  const t = totals(lines);
  await writeRange(DIRECTORY_TAB, `J${h.dirRowNum}`, [[t.totalOwed, t.amountPaid]]);
  return lines;
}

export async function setTshirt(h: Pick<Household, "sheetName">, rowNum: number, size: string) {
  await updateCell(h.sheetName, `F${rowNum}`, size);
}

// Picks a valid, unused tab name from the household's name.
export async function uniqueTabName(primaryName: string): Promise<string> {
  const base = (primaryName.replace(/[\[\]:*?/\\]/g, "").trim() || "Household").slice(0, 80);
  const taken = new Set((await listTabTitles()).map((t) => t.toLowerCase()));
  let name = base;
  let n = 2;
  while (taken.has(name.toLowerCase())) name = `${base} ${n++}`;
  return name;
}

// Creates the household's invoice tab with its header block and column headers.
export async function createHouseholdTab(sheetName: string, primaryName: string, email: string) {
  await createInvoiceTab(sheetName);
  await writeRange(sheetName, "A1", [
    ["Russell–Sharp Family Reunion — Sept 3–5, 2027"],
    ["Household", primaryName],
    ["Email", email],
    ["Balance Due", `=SUM(G${INV_FIRST_ROW}:G)-SUM(H${INV_FIRST_ROW}:H)`],
  ]);
  await writeRange(sheetName, `A${INV_HEADER_ROW}`, [
    ["Date", "Type", "Description", "Relationship", "Age Group", "T-Shirt Size", "Charges", "Credits", "Line Total", "Reference"],
  ]);
}

export { INV_TYPE_ATTENDEE, INV_TYPE_PAYMENT };
