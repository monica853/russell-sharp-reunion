import { NextRequest, NextResponse } from "next/server";
import { appendRow } from "@/lib/googleSheets";
import { INTEREST_TAB } from "@/lib/sheetsSchema";
import { sendEmail, alertCcList } from "@/lib/email";

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

    sendEmail({
      to: email,
      cc: alertCcList(),
      subject: "You're on the list! — Russell–Sharp Family Reunion",
      text: `Hi ${primaryName},

Thanks for joining the interest list for the Russell–Sharp Family Reunion — September 3–5, 2027, in Atlanta, Georgia.

This doesn't complete your official registration, but it helps us plan lodging, activities, transportation, meals, and reunion apparel. We'll be in touch as registration opens.

Same Roots. New Vibes.
— Russell–Sharp Family Reunion`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Interest list error:", err);
    return NextResponse.json(
      { error: "Something went wrong saving your info. Please try again." },
      { status: 500 }
    );
  }
}
