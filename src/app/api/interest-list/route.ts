import { NextRequest, NextResponse } from "next/server";
import { appendRows } from "@/lib/googleSheets";
import { INTEREST_TAB } from "@/lib/sheetsSchema";
import { sendEmail, alertCcList } from "@/lib/email";

type HouseholdMember = {
  name?: string;
  relationship?: string;
  ageGroup?: string;
  tshirtSize?: string;
};

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
      lodgingNeeded,
      numRooms,
      accessibilityDietary,
      activitiesInterest,
    } = body;

    if (!primaryName || !phone || !email) {
      return NextResponse.json({ error: "Name, phone, and email are required." }, { status: 400 });
    }

    const members: HouseholdMember[] =
      Array.isArray(householdMembers) && householdMembers.length > 0
        ? householdMembers
        : [{ name: primaryName, relationship: "Self", ageGroup: "", tshirtSize: "" }];

    // One row per person — household-level fields repeated on each row so
    // every row is self-contained and easy to filter/sort in the sheet.
    // All rows go up in a single batched API call.
    const timestamp = new Date().toISOString();
    const rows = members.map((member) => [
      timestamp,
      email,
      primaryName,
      phone,
      familyBranch || "",
      city || "",
      state || "",
      lodgingNeeded || "",
      numRooms ?? "",
      accessibilityDietary || "",
      activitiesInterest || "",
      member.name || "",
      member.relationship || "",
      member.ageGroup || "",
      member.tshirtSize || "",
    ]);
    await appendRows(INTEREST_TAB, rows);

    const memberLines = members
      .map((m) => {
        const parts = [m.name || "(name not given)"];
        if (m.relationship) parts.push(m.relationship);
        if (m.ageGroup) parts.push(m.ageGroup);
        if (m.tshirtSize) parts.push(`shirt: ${m.tshirtSize}`);
        return "  • " + parts.join(" — ");
      })
      .join("\n");

    sendEmail({
      to: email,
      cc: alertCcList(),
      subject: "You're on the list! — Russell–Sharp Family Reunion",
      text: `Hi ${primaryName},

Thanks for joining the interest list for the Russell–Sharp Family Reunion — September 3–5, 2027, in Atlanta, Georgia.

Here's what we have on file for your household:

  Primary contact: ${primaryName}
  Phone: ${phone}
  Email: ${email}
  Family branch: ${familyBranch || "—"}
  City/State: ${[city, state].filter(Boolean).join(", ") || "—"}
  Lodging needed: ${lodgingNeeded || "—"}${numRooms ? ` (${numRooms} room(s))` : ""}
  Accessibility/dietary needs: ${accessibilityDietary || "—"}
  Activities interested in: ${activitiesInterest || "—"}

Household members:
${memberLines}

This doesn't complete your official registration, but it helps us plan lodging, activities, transportation, meals, and reunion apparel. We'll be in touch as registration opens.

If anything above looks wrong, just reply to this email and let us know.

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
