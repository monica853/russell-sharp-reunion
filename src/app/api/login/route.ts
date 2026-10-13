import { NextRequest, NextResponse } from "next/server";
import { signSession, SESSION_COOKIE } from "@/lib/auth";
import { DIR_COLS } from "@/lib/sheetsSchema";
import { findHousehold } from "@/lib/households";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const h = await findHousehold(String(email));
    if (!h) {
      return NextResponse.json(
        { error: "We couldn't find a registration with that email. Have you registered yet?" },
        { status: 404 }
      );
    }
    if (String(h.row[DIR_COLS.password] ?? "").trim() !== String(password).trim()) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    const token = signSession({ householdId: h.email, name: h.name });
    const res = NextResponse.json({ success: true, name: h.name });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
