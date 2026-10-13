import crypto from "crypto";

// Square REST API via plain fetch (no SDK needed).
const SQUARE_VERSION = "2025-01-23";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://russellsharpfamily.com").replace(/\/$/, "");
export const DEPOSIT_AMOUNT = 25;

function baseUrl() {
  return process.env.SQUARE_ENVIRONMENT === "sandbox"
    ? "https://connect.squareupsandbox.com"
    : "https://connect.squareup.com";
}

export async function squareFetch<T = any>(path: string, init?: RequestInit): Promise<T> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const token = process.env.SQUARE_ACCESS_TOKEN;
  if (!token) throw new Error("Missing SQUARE_ACCESS_TOKEN env var.");
  const res = await fetch(baseUrl() + path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Square-Version": SQUARE_VERSION,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error("Square API error: " + JSON.stringify(json.errors ?? json));
  return json as T;
}

// Square signs: base64(HMAC-SHA256(signatureKey, notificationUrl + rawBody))
export function verifySquareSignature(rawBody: string, signature: string | null): boolean {
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  const url = process.env.SQUARE_WEBHOOK_URL || `${SITE_URL}/api/square/webhook`;
  if (!key || !signature) return false;
  const expected = crypto.createHmac("sha256", key).update(url + rawBody).digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
