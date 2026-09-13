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

    const recap = `Business/service: ${businessName}
Your name: ${ownerName}
Category: ${category || "—"}
Website: ${website || "—"}
Phone: ${phone || "—"}
Email: ${email || "—"}
Description: ${description || "—"}`;

    const cc = alertCcList();
    if (email) {
      await sendEmail({
        to: email,
        cc,
        subject: `Submitted for review: ${businessName}`,
        text: `Thanks for sharing "${businessName}" on Family Connections!

Here's what was submitted:

${recap}

It's been sent to the family for review and will appear on russellsharpfamily.com/family-connections once approved. If anything above needs correcting, just reply to this email.

— Russell–Sharp Family Reunion`,
      });
    } else if (cc.length) {
      await sendEmail({
        to: cc[0],
        cc: cc.slice(1),
        subject: `New connection awaiting review: ${businessName}`,
        text: `A new listing was submitted to Family Connections and is waiting for your review (Visible: FALSE).

${recap}`,
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
