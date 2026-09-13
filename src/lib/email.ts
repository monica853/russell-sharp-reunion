import { Resend } from "resend";
import { FROM_EMAIL, ALERT_CC_EMAILS } from "./config";

// Best-effort — a failed email should never block a form submission that
// already succeeded in writing to the sheet. Every call site should treat
// this as fire-and-forget (catch, log, move on).
export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  cc?: string[];
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log("Email skipped (RESEND_API_KEY not set):", opts.subject, "->", opts.to);
    return;
  }
  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: `Russell–Sharp Family Reunion <${FROM_EMAIL}>`,
      to: [opts.to],
      cc: opts.cc && opts.cc.length ? opts.cc : undefined,
      subject: opts.subject,
      text: opts.text,
    });
  } catch (err) {
    console.error("Email send error:", err);
  }
}

export function alertCcList(): string[] {
  return ALERT_CC_EMAILS.filter(Boolean);
}
