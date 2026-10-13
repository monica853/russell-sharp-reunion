import { NextRequest, NextResponse } from "next/server";
import { DIR_COLS } from "@/lib/sheetsSchema";
import { requireHousehold, loadInvoice, totals } from "@/lib/households";

export async function GET(req: NextRequest) {
  try {
    const h = await requireHousehold(req);
    if (h instanceof NextResponse) return h;

    const lines = await loadInvoice(h.sheetName);
    return NextResponse.json({
      name: h.name,
      email: h.email,
      lodging: String(h.row[DIR_COLS.lodgingSelection] ?? ""),
      policyAccepted: Boolean(String(h.row[DIR_COLS.policyAcceptedAt] ?? "").trim()),
      notes: String(h.row[DIR_COLS.notes] ?? ""),
      lines,
      ...totals(lines),
    });
  } catch (err) {
    console.error("Invoice fetch error:", err);
    return NextResponse.json({ error: "Something went wrong loading your invoice." }, { status: 500 });
  }
}
