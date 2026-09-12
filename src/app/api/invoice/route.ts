import { NextRequest, NextResponse } from "next/server";
import { getSheetValues } from "@/lib/googleSheets";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";
import { REG_TAB } from "@/lib/sheetsSchema";

// Column indices in the Registrations tab (0-indexed, matches /api/register)
const COL_NAME = 1;
const COL_EMAIL = 2;
const COL_FAMILY_BRANCH = 4;
const COL_ATTENDEES_JSON = 8;
const COL_LODGING = 9;
const COL_TOTAL_OWED = 13;
const COL_AMOUNT_PAID = 14;
const COL_NOTES = 15;

type Attendee = { name?: string; ageGroup?: string; tshirtSize?: string };

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    const session = token ? verifySession(token) : null;
    if (!session) {
      return NextResponse.json({ error: "Please log in to view your invoice." }, { status: 401 });
    }

    const rows = await getSheetValues(REG_TAB);
    const target = session.householdId.trim().toLowerCase();
    const row = rows.find((r, i) => i > 0 && String(r[COL_EMAIL] ?? "").trim().toLowerCase() === target);
    if (!row) {
      return NextResponse.json({ error: "We couldn't find your registration." }, { status: 404 });
    }

    let attendees: Attendee[] = [];
    try {
      attendees = JSON.parse(String(row[COL_ATTENDEES_JSON] ?? "[]"));
    } catch {
      attendees = [];
    }

    const totalOwed = Number(row[COL_TOTAL_OWED] ?? 0);
    const amountPaid = Number(row[COL_AMOUNT_PAID] ?? 0);

    return NextResponse.json({
      name: String(row[COL_NAME] ?? ""),
      familyBranch: String(row[COL_FAMILY_BRANCH] ?? ""),
      lodging: String(row[COL_LODGING] ?? ""),
      attendees,
      totalOwed,
      amountPaid,
      balance: Math.max(0, totalOwed - amountPaid),
      notes: String(row[COL_NOTES] ?? ""),
    });
  } catch (err) {
    console.error("Invoice fetch error:", err);
    return NextResponse.json({ error: "Something went wrong loading your invoice." }, { status: 500 });
  }
}
