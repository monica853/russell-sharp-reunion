import { NextRequest, NextResponse } from "next/server";
import { getSheetValues } from "@/lib/googleSheets";
import { signSession, SESSION_COOKIE } from "@/lib/auth";
import { REG_TAB } from "@/lib/sheetsSchema";

// Column indices in the Registrations tab (0-indexed, matches /api/register)
const COL_NAME = 1;
const COL_EMAIL = 2;
const COL_PASSWORD = 7;

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const rows = await getSheetValues(REG_TAB);
    const target = String(email).trim().toLowerCase();

    for (let i = 1; i < rows.length; i++) {
      const rowEmail = String(rows[i][COL_EMAIL] ?? "").trim().toLowerCase();
      if (rowEmail !== target) continue;
      const rowPassword = String(rows[i][COL_PASSWORD] ?? "").trim();
      if (rowPassword !== String(password).trim()) {
        return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
      }
      const name = String(rows[i][COL_NAME] ?? "");
      const token = signSession({ householdId: rowEmail, name });
      const res = NextResponse.json({ success: true, name });
      res.cookies.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
      return res;
    }

    return NextResponse.json(
      { error: "We couldn't find a registration with that email. Have you registered yet?" },
      { status: 404 }
    );
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
