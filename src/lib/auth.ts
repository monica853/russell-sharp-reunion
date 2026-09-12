import jwt from "jsonwebtoken";

export const SESSION_COOKIE = "rs_session";

type SessionPayload = {
  householdId: string; // the row's Household ID / primary contact email
  name: string;
};

function secret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("Missing JWT_SECRET env var. See README.md for setup steps.");
  return s;
}

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, secret(), { expiresIn: "30d" });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, secret()) as SessionPayload;
  } catch {
    return null;
  }
}
