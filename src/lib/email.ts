import { Resend } from "resend";
import { FROM_EMAIL, ALERT_CC_EMAILS } from "./config";

// IMPORTANT: always `await` calls to this function at each call site.
// In a serverless function, once the route returns its response, the
// platform can freeze or terminate that invocation — an un-awaited
// (fire-and-forget) call here can get cut off mid-flight before Resend
// ever finishes, causing emails to silently not send. This bit us in
// production: every route was calling sendEmail() without awaiting it.
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
    // Resend's SDK can return { error } on failure instead of throwing —
    // check it explicitly or failures go unnoticed in the logs.
    const { error } = await resend.emails.send({
      from: `Russell–Sharp Family Reunion <${FROM_EMAIL}>`,
      to: [opts.to],
      cc: opts.cc && opts.cc.length ? opts.cc : undefined,
      subject: opts.subject,
      text: opts.text,
    });
    if (error) {
      console.error("Resend API error:", error, "-> subject:", opts.subject, "to:", opts.to);
    }
  } catch (err) {
    console.error("Email send error:", err);
  }
}

export function alertCcList(): string[] {
  return ALERT_CC_EMAILS.filter(Boolean);
}
