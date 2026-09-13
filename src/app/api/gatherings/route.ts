import { NextRequest, NextResponse } from "next/server";
import { appendRow } from "@/lib/googleSheets";
import { GATHERINGS_TAB } from "@/lib/sheetsSchema";
import { sendEmail, alertCcList } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      eventName,
      hostName,
      dateTime,
      location,
      description,
      invited,
      cost,
      rsvpDeadline,
      rsvpContact,
      submitterEmail,
      submitterPhone,
    } = body;

    if (!eventName || !hostName || !dateTime || !location || !rsvpContact) {
      return NextResponse.json(
        { error: "Event name, host, date/time, location, and an RSVP/contact are required." },
        { status: 400 }
      );
    }

    await appendRow(GATHERINGS_TAB, [
      new Date().toISOString(),
      eventName,
      hostName,
      dateTime,
      location,
      description || "",
      invited || "",
      cost || "",
      rsvpDeadline || "",
      rsvpContact,
      "Pending", // Status — flip to "Approved" in the sheet to publish it
      submitterEmail || "",
      submitterPhone || "",
    ]);

    const recap = `Event: ${eventName}
Host: ${hostName}
Date/time: ${dateTime}
Location: ${location}
Who's invited: ${invited || "—"}
Cost: ${cost || "—"}
RSVP deadline: ${rsvpDeadline || "—"}
RSVP/contact: ${rsvpContact}
Description: ${description || "—"}`;

    const cc = alertCcList();
    if (submitterEmail) {
      await sendEmail({
        to: submitterEmail,
        cc,
        subject: `Event submitted for review: ${eventName}`,
        text: `Thanks for submitting "${eventName}" to Family Gatherings!

Here's what was submitted:

${recap}

It's been sent to the family for review and will appear on russellsharpfamily.com/family-gatherings once approved. If anything above needs correcting, just reply to this email.

— Russell–Sharp Family Reunion`,
      });
    } else if (cc.length) {
      // No submitter email on file — still make sure organizers see it.
      await sendEmail({
        to: cc[0],
        cc: cc.slice(1),
        subject: `New event awaiting review: ${eventName}`,
        text: `A new event was submitted to Family Gatherings and is waiting for your review (Status: Pending).

${recap}`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Gathering submission error:", err);
    return NextResponse.json(
      { error: "Something went wrong submitting your event. Please try again." },
      { status: 500 }
    );
  }
}
