import { NextRequest, NextResponse } from "next/server";
import { appendRow } from "@/lib/googleSheets";
import { CONTACT_TAB } from "@/lib/sheetsSchema";
import { sendEmail, alertCcList } from "@/lib/email";
import { FROM_EMAIL } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
    }
    await appendRow(CONTACT_TAB, [new Date().toISOString(), name, email, message]);

    const recipients = alertCcList();
    if (recipients.length) {
      sendEmail({
        to: recipients[0],
        cc: recipients.slice(1),
        subject: `New contact message from ${name}`,
        text: `From: ${name} <${email}>\n\n${message}`,
      });
    } else {
      // No CC list configured yet — send to the site's own address as a fallback so the message isn't only sitting in the sheet.
      sendEmail({ to: FROM_EMAIL, subject: `New contact message from ${name}`, text: `From: ${name} <${email}>\n\n${message}` });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json(
      { error: "Something went wrong sending your message. Please try again." },
      { status: 500 }
    );
  }
}
