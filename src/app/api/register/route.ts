import { NextRequest, NextResponse } from "next/server";
import { getSheetValues, appendRows } from "@/lib/googleSheets";
import { signSession, SESSION_COOKIE } from "@/lib/auth";
import { REG_TAB, REG_COLS, RATE_MAP } from "@/lib/sheetsSchema";
import { sendEmail, alertCcList } from "@/lib/email";

type Attendee = { name?: string; ageGroup?: string; tshirtSize?: string };

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
      emergencyName,
      emergencyPhone,
      lodgingSelection,
      accommodations,
      attendees, // [{ name, ageGroup, tshirtSize }]
    } = body;

    if (!primaryName || !email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    // Prevent duplicate households on the same email.
    const existingRows = await getSheetValues(REG_TAB).catch(() => [] as string[][]);
    const target = String(email).trim().toLowerCase();
    const alreadyExists = existingRows
      .slice(1)
      .some((r) => String(r[REG_COLS.householdEmail] ?? "").trim().toLowerCase() === target);
    if (alreadyExists) {
      return NextResponse.json(
        { error: "A registration already exists for that email. Please log in instead." },
        { status: 409 }
      );
    }

    const list: Attendee[] = Array.isArray(attendees) && attendees.length > 0 ? attendees : [{}];
    const total = list.reduce((sum, a) => sum + (RATE_MAP[a.ageGroup || ""] ?? 0), 0);
    const password = generatePassword();
    const timestamp = new Date().toISOString();

    // First row (the "primary" row) carries every household-level field —
    // this is the one row staff edits when a payment comes in. Every
    // attendee row is written in a single batched call.
    const rows: (string | number)[][] = [
      [
        timestamp,
        email,
        primaryName,
        "TRUE", // IsPrimary
        password,
        lodgingSelection || "",
        accommodations || "",
        emergencyName || "",
        emergencyPhone || "",
        total, // TotalOwed
        25, // AmountPaid — the $25 deposit; staff updates this as further payments come in
        "", // Notes
        list[0].name || "",
        list[0].ageGroup || "",
        list[0].tshirtSize || "",
      ],
      ...list.slice(1).map((a) => [
        timestamp,
        email,
        primaryName,
        "FALSE",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        a.name || "",
        a.ageGroup || "",
        a.tshirtSize || "",
      ]),
    ];
    await appendRows(REG_TAB, rows);

    sendEmail({
      to: email,
      cc: alertCcList(),
      subject: "You're registered! — Russell–Sharp Family Reunion",
      text: `Hi ${primaryName},

Your household is registered for the Russell–Sharp Family Reunion — September 3–5, 2027, in Atlanta, Georgia. The $25 deposit has been recorded toward your total of $${total.toFixed(2)}.

Your invoice login (save this for your records):
  Email: ${email}
  Password: ${password}

Use these anytime at russellsharpfamily.com/my-invoice to check your balance.

Same Roots. New Vibes.
— Russell–Sharp Family Reunion`,
    });

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
