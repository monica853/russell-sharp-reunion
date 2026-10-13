import { NextRequest, NextResponse } from "next/server";
import { signSession, SESSION_COOKIE } from "@/lib/auth";
import { RATE_MAP, INV_TYPE_ATTENDEE } from "@/lib/sheetsSchema";
import { findHousehold, uniqueTabName, createHouseholdTab, writeInvoiceLines, appendDirectoryRow } from "@/lib/households";
import { sendEmail, alertCcList } from "@/lib/email";

type Attendee = { name?: string; relationship?: string; ageGroup?: string; tshirtSize?: string };

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
      acceptedPolicy,
      phone,
      city,
      state,
      emergencyName,
      emergencyPhone,
      lodgingSelection,
      accommodations,
      attendees, // [{ name, ageGroup, tshirtSize }]
    } = body;

    if (!primaryName || !email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    if (acceptedPolicy !== true) {
      return NextResponse.json(
        { error: "Please accept the Payment, Cancellation & Transfer Policy to register." },
        { status: 400 }
      );
    }

    // Prevent duplicate households on the same email.
    if (await findHousehold(String(email))) {
      return NextResponse.json(
        { error: "A registration already exists for that email. Please log in instead." },
        { status: 409 }
      );
    }

    const list: Attendee[] = Array.isArray(attendees) && attendees.length > 0 ? attendees : [{}];
    const total = list.reduce((sum, a) => sum + (RATE_MAP[a.ageGroup || ""] ?? 0), 0);
    const password = generatePassword();
    const cleanEmail = String(email).trim().toLowerCase();

    // 1) Give the household its own invoice tab and write one charge line per attendee.
    const sheetName = await uniqueTabName(String(primaryName));
    await createHouseholdTab(sheetName, String(primaryName), cleanEmail);
    await writeInvoiceLines(
      sheetName,
      list.map((a, i) => ({
        type: INV_TYPE_ATTENDEE,
        name: a.name || "",
        relationship: i === 0 ? a.relationship || "Self" : a.relationship || "",
        ageGroup: a.ageGroup || "",
        tshirtSize: a.tshirtSize || "",
        charges: RATE_MAP[a.ageGroup || ""] ?? 0,
      }))
    );

    // 2) Add the household to the Household Directory (one row per household).
    await appendDirectoryRow([
      sheetName,
      primaryName,
      phone || "",
      cleanEmail,
      password,
      lodgingSelection || "",
      accommodations || "",
      emergencyName || "",
      emergencyPhone || "",
      total, // Total Owed
      0, // Amount Paid — updated automatically when Square confirms a payment
      city || "",
      state || "",
      "", // Notes
      new Date().toISOString(), // Policy accepted at
    ]);

    const attendeeLines = list
      .map((a) => {
        const parts = [a.name || "(name not given)"];
        if (a.ageGroup) parts.push(a.ageGroup);
        if (a.tshirtSize) parts.push(`shirt: ${a.tshirtSize}`);
        const fee = RATE_MAP[a.ageGroup || ""] ?? 0;
        parts.push(`$${fee.toFixed(2)}`);
        return "  • " + parts.join(" — ");
      })
      .join("\n");

    await sendEmail({
      to: email,
      cc: alertCcList(),
      subject: "You're registered! — Russell–Sharp Family Reunion",
      text: `Hi ${primaryName},

Your household is registered for the Russell–Sharp Family Reunion — September 3–5, 2027, in Atlanta, Georgia.

Attendees:
${attendeeLines}

Household total: $${total.toFixed(2)}
Registration deposit: $25.00 (pay securely online at russellsharpfamily.com/my-invoice if you haven't already)

Lodging selection: ${lodgingSelection || "—"}
Special accommodations: ${accommodations || "—"}
Emergency contact: ${emergencyName || "—"}${emergencyPhone ? ` (${emergencyPhone})` : ""}

Your invoice login (save this for your records):
  Email: ${email}
  Password: ${password}

Use these anytime at russellsharpfamily.com/my-invoice to see your invoice, make payments, add attendees, update T-shirt sizes, and change your password. At least 50% of the total is due by March 31, 2027, with the remaining balance due by June 30, 2027.

If anything above looks wrong, just reply to this email and let us know.

Same Roots. New Vibes.
— Russell–Sharp Family Reunion`,
    });

    const token = signSession({ householdId: cleanEmail, name: primaryName });
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
