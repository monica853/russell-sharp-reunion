import { NextRequest, NextResponse } from "next/server";
import { appendRow } from "@/lib/googleSheets";
import { CONNECTIONS_TAB } from "@/lib/sheetsSchema";
import { sendEmail, alertCcList } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessName, ownerName, category, description, website, phone, email } = body;

    if (!businessName || !ownerName) {
      return NextResponse.json(
        { error: "Business/service name and your name are required." },
        { status: 400 }
      );
    }

    await appendRow(CONNECTIONS_TAB, [
      new Date().toISOString(),
      businessName,
      ownerName,
      category || "",
      description || "",
      website || "",
      phone || "",
      email || "",
      "FALSE", // Visible — flip to TRUE in the sheet to publish it
    ]);

    if (email) {
      sendEmail({
        to: email,
        cc: alertCcList(),
        subject: `Submitted for review: ${businessName}`,
        text: `Thanks for sharing "${businessName}" on Family Connections!

It's been sent to the family for review and will appear on russellsharpfamily.com/family-connections once approved.

— Russell–Sharp Family Reunion`,
      });
    } else if (alertCcList().length) {
      sendEmail({
        to: alertCcList()[0],
        cc: alertCcList().slice(1),
        subject: `New connection awaiting review: ${businessName}`,
        text: `"${businessName}" was just submitted to Family Connections and is waiting for your review in the Google Sheet (Visible: FALSE).`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Connection submission error:", err);
    return NextResponse.json(
      { error: "Something went wrong submitting your info. Please try again." },
      { status: 500 }
    );
  }
}
