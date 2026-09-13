import { NextRequest, NextResponse } from "next/server";
import { getSheetValues } from "@/lib/googleSheets";
import { INTEREST_TAB, INTEREST_COLS } from "@/lib/sheetsSchema";

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email");
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const rows = await getSheetValues(INTEREST_TAB);
    const target = email.trim().toLowerCase();

    const householdRows = rows
      .slice(1)
      .filter((r) => String(r[INTEREST_COLS.householdEmail] ?? "").trim().toLowerCase() === target);

    if (householdRows.length === 0) {
      return NextResponse.json({ error: "No interest list submission found for that email." }, { status: 404 });
    }

    const first = householdRows[0];
    const members = householdRows
      .filter((r) => String(r[INTEREST_COLS.personName] ?? "").trim())
      .map((r) => ({
        name: String(r[INTEREST_COLS.personName] ?? ""),
        ageGroup: String(r[INTEREST_COLS.ageGroup] ?? ""),
        tshirtSize: String(r[INTEREST_COLS.tshirtSize] ?? ""),
      }));

    return NextResponse.json({
      primaryName: String(first[INTEREST_COLS.primaryName] ?? ""),
      lodgingNeeded: String(first[INTEREST_COLS.lodgingNeeded] ?? ""),
      members,
    });
  } catch (err) {
    console.error("Interest list lookup error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
