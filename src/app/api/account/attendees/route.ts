import { NextRequest, NextResponse } from "next/server";
import { RATE_MAP, SHIRT_SIZES, INV_TYPE_ATTENDEE } from "@/lib/sheetsSchema";
import { requireHousehold, appendInvoiceLines, totals } from "@/lib/households";
import { sendEmail, alertCcList } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const h = await requireHousehold(req);
    if (h instanceof NextResponse) return h;

    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const relationship = String(body.relationship ?? "").trim();
    const ageGroup = String(body.ageGroup ?? "");
    const tshirtSize = String(body.tshirtSize ?? "");

    if (!name) return NextResponse.json({ error: "Please enter the attendee's name." }, { status: 400 });
    if (!(ageGroup in RATE_MAP)) return NextResponse.json({ error: "Please choose an age group." }, { status: 400 });
    if (tshirtSize && !SHIRT_SIZES.includes(tshirtSize)) {
      return NextResponse.json({ error: "Invalid T-shirt size." }, { status: 400 });
    }

    const fee = RATE_MAP[ageGroup];
    const lines = await appendInvoiceLines(h, [
      { type: INV_TYPE_ATTENDEE, name, relationship, ageGroup, tshirtSize, charges: fee },
    ]);
    const t = totals(lines);

    await sendEmail({
      to: h.email,
      cc: alertCcList(),
      subject: "Attendee added — Russell–Sharp Family Reunion",
      text: `Hi ${h.name},

${name} was added to your household registration.

  • ${name} — ${[relationship, ageGroup, tshirtSize && `shirt: ${tshirtSize}`].filter(Boolean).join(" — ")} — $${fee.toFixed(2)}

Household total: $${t.totalOwed.toFixed(2)}
Paid to date: $${t.amountPaid.toFixed(2)}
Remaining balance: $${t.balance.toFixed(2)}

View or pay your invoice anytime at russellsharpfamily.com/my-invoice.

— Russell–Sharp Family Reunion`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Add attendee error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
