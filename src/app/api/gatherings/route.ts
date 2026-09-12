import { NextRequest, NextResponse } from "next/server";
import { appendRow } from "@/lib/googleSheets";
import { GATHERINGS_TAB } from "@/lib/sheetsSchema";

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

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Gathering submission error:", err);
    return NextResponse.json(
      { error: "Something went wrong submitting your event. Please try again." },
      { status: 500 }
    );
  }
}
