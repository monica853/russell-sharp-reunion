import { NextRequest, NextResponse } from "next/server";
import { SHIRT_SIZES, INV_TYPE_ATTENDEE } from "@/lib/sheetsSchema";
import { requireHousehold, loadInvoice, setTshirt } from "@/lib/households";
import { sendEmail, alertCcList } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const h = await requireHousehold(req);
    if (h instanceof NextResponse) return h;

    const { rowNum, tshirtSize } = await req.json();
    const size = String(tshirtSize ?? "");
    if (!SHIRT_SIZES.includes(size)) {
      return NextResponse.json({ error: "Invalid T-shirt size." }, { status: 400 });
    }

    // Only allow editing an attendee line that belongs to THIS household's tab.
    const lines = await loadInvoice(h.sheetName);
    const line = lines.find((l) => l.rowNum === Number(rowNum) && l.type === INV_TYPE_ATTENDEE);
    if (!line) return NextResponse.json({ error: "Attendee not found." }, { status: 404 });

    await setTshirt(h, line.rowNum, size);

    await sendEmail({
      to: h.email,
      cc: alertCcList(),
      subject: "T-shirt size updated — Russell–Sharp Family Reunion",
      text: `Hi ${h.name},

${line.name}'s T-shirt size was changed from ${line.tshirtSize || "(none)"} to ${size}.

If this wasn't you, reply to this email and let us know.

— Russell–Sharp Family Reunion`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("T-shirt change error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
