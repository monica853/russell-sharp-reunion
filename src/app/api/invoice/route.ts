import { NextRequest, NextResponse } from "next/server";
import { getSheetValues } from "@/lib/googleSheets";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";
import { REG_TAB, REG_COLS } from "@/lib/sheetsSchema";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    const session = token ? verifySession(token) : null;
    if (!session) {
      return NextResponse.json({ error: "Please log in to view your invoice." }, { status: 401 });
    }

    const rows = await getSheetValues(REG_TAB);
    const target = session.householdId.trim().toLowerCase();

    const householdRows = rows
      .slice(1)
      .filter((r) => String(r[REG_COLS.householdEmail] ?? "").trim().toLowerCase() === target);

    if (householdRows.length === 0) {
      return NextResponse.json({ error: "We couldn't find your registration." }, { status: 404 });
    }

    const primaryRow =
      householdRows.find((r) => String(r[REG_COLS.isPrimary] ?? "").trim().toUpperCase() === "TRUE") ??
      householdRows[0];

    const attendees = householdRows
      .filter((r) => String(r[REG_COLS.attendeeName] ?? "").trim())
      .map((r) => ({
        name: String(r[REG_COLS.attendeeName] ?? ""),
        ageGroup: String(r[REG_COLS.ageGroup] ?? ""),
        tshirtSize: String(r[REG_COLS.tshirtSize] ?? ""),
      }));

    const totalOwed = Number(primaryRow[REG_COLS.totalOwed] ?? 0);
    const amountPaid = Number(primaryRow[REG_COLS.amountPaid] ?? 0);

    return NextResponse.json({
      name: String(primaryRow[REG_COLS.primaryName] ?? ""),
      lodging: String(primaryRow[REG_COLS.lodgingSelection] ?? ""),
      attendees,
      totalOwed,
      amountPaid,
      balance: Math.max(0, totalOwed - amountPaid),
      notes: String(primaryRow[REG_COLS.notes] ?? ""),
    });
  } catch (err) {
    console.error("Invoice fetch error:", err);
    return NextResponse.json({ error: "Something went wrong loading your invoice." }, { status: 500 });
  }
}
