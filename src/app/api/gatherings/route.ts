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

    if (submitterEmail) {
      sendEmail({
        to: submitterEmail,
        cc: alertCcList(),
        subject: `Event submitted for review: ${eventName}`,
        text: `Thanks for submitting "${eventName}" to Family Gatherings!

It's been sent to the family for review and will appear on russellsharpfamily.com/family-gatherings once approved.

— Russell–Sharp Family Reunion`,
      });
    } else if (alertCcList().length) {
      sendEmail({
        to: alertCcList()[0],
        cc: alertCcList().slice(1),
        subject: `New event awaiting review: ${eventName}`,
        text: `"${eventName}" was just submitted to Family Gatherings and is waiting for your review in the Google Sheet (Status: Pending).`,
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
