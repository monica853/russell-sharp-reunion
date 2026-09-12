import { NextRequest, NextResponse } from "next/server";
import { appendRow } from "@/lib/googleSheets";
import { INTEREST_TAB } from "@/lib/sheetsSchema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      primaryName,
      phone,
      email,
      familyBranch,
      city,
      state,
      householdMembers, // [{ name, relationship, ageGroup, tshirtSize }]
      numAdults,
      numChildren,
      lodgingNeeded,
      numRooms,
      accessibilityDietary,
      activitiesInterest,
    } = body;

    if (!primaryName || !phone || !email) {
      return NextResponse.json({ error: "Name, phone, and email are required." }, { status: 400 });
    }

    await appendRow(INTEREST_TAB, [
      new Date().toISOString(),
      primaryName,
      phone,
      email,
      familyBranch || "",
      city || "",
      state || "",
      JSON.stringify(householdMembers || []),
      numAdults ?? "",
      numChildren ?? "",
      lodgingNeeded || "",
      numRooms ?? "",
      accessibilityDietary || "",
      activitiesInterest || "",
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Interest list error:", err);
    return NextResponse.json(
      { error: "Something went wrong saving your info. Please try again." },
      { status: 500 }
    );
  }
}
