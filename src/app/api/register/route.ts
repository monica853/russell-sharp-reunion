import { NextRequest, NextResponse } from "next/server";
import { getSheetValues, appendRow, findRowNumber } from "@/lib/googleSheets";
import { signSession, SESSION_COOKIE } from "@/lib/auth";
import { REG_TAB, RATE_MAP } from "@/lib/sheetsSchema";

function generatePassword(): string {
  // Short, easy to read over the phone: e.g. "PEACH482"
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // no O/I to avoid confusion
  let out = "";
  for (let i = 0; i < 5; i++) out += letters[Math.floor(Math.random() * letters.length)];
  out += Math.floor(100 + Math.random() * 900);
  return out;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      primaryName,
      email,
      phone,
      familyBranch,
      city,
      state,
      emergencyName,
      emergencyPhone,
      lodgingSelection,
      accommodations,
      attendees, // [{ name, ageGroup, tshirtSize }]
    } = body;

    if (!primaryName || !email || !phone) {
      return NextResponse.json({ error: "Name, email, and phone are required." }, { status: 400 });
    }

    // Prevent duplicate households on the same email.
    const existingRows = await getSheetValues(REG_TAB).catch(() => [] as string[][]);
    if (existingRows.length && findRowNumber(existingRows, 2, email)) {
      return NextResponse.json(
        { error: "A registration already exists for that email. Please log in instead." },
        { status: 409 }
      );
    }

    const total = Array.isArray(attendees)
      ? attendees.reduce((sum: number, a: { ageGroup?: string }) => sum + (RATE_MAP[a.ageGroup || ""] ?? 0), 0)
      : 0;
    const password = generatePassword();

    await appendRow(REG_TAB, [
      new Date().toISOString(),
      primaryName,
      email,
      phone,
      familyBranch || "",
      city || "",
      state || "",
      password,
      JSON.stringify(attendees || []),
      lodgingSelection || "",
      accommodations || "",
      emergencyName || "",
      emergencyPhone || "",
      total, // TotalOwed
      25, // AmountPaid — the $25 deposit; staff updates this as further payments come in
      "",
    ]);

    const token = signSession({ householdId: email, name: primaryName });
    const res = NextResponse.json({ success: true, password, total });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "Something went wrong saving your registration. Please try again." },
      { status: 500 }
    );
  }
}
