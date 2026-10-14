import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { updateCell } from "@/lib/googleSheets";
import { DIRECTORY_TAB, DIR_COLS } from "@/lib/sheetsSchema";
import { requireHousehold, loadInvoice, totals } from "@/lib/households";
import { squareFetch, SITE_URL, DEPOSIT_AMOUNT } from "@/lib/square";

export async function POST(req: NextRequest) {
  try {
    const h = await requireHousehold(req);
    if (h instanceof NextResponse) return h;

    const lines = await loadInvoice(h.sheetName);
    const { totalOwed, amountPaid, balance } = totals(lines);
    if (balance <= 0) {
      return NextResponse.json({ error: "Your balance is already paid in full." }, { status: 400 });
    }
    const target = h.email;

    // The policy must be accepted before any payment (it's normally accepted at registration).
    const body = await req.json().catch(() => ({}));
    if (!String(h.row[DIR_COLS.policyAcceptedAt] ?? "").trim()) {
      if (body?.acceptedPolicy !== true) {
        return NextResponse.json(
          { error: "Please accept the Payment, Cancellation & Transfer Policy before paying." },
          { status: 400 }
        );
      }
      await updateCell(DIRECTORY_TAB, `O${h.dirRowNum}`, new Date().toISOString());
    }

    // Amount: whatever the household chose, between $1 and the balance.
    // Default is the $25 deposit (or the balance if it's smaller).
    const requested = Number(body?.amount);
    let amount = Number.isFinite(requested) && requested > 0 ? requested : Math.min(DEPOSIT_AMOUNT, balance);
    amount = Math.round(Math.min(Math.max(amount, 1), balance) * 100) / 100;

    const locationId = process.env.SQUARE_LOCATION_ID;
    if (!locationId) throw new Error("Missing SQUARE_LOCATION_ID env var.");

    const isDeposit = amountPaid === 0 && totalOwed > 0;
    const data = await squareFetch("/v2/online-checkout/payment-links", {
      method: "POST",
      body: JSON.stringify({
        idempotency_key: crypto.randomUUID(),
        order: {
          location_id: locationId,
          // The webhook reads this back to know which household paid.
          metadata: { householdEmail: target },
          line_items: [
            {
              name: isDeposit
                ? "Russell–Sharp Family Reunion — Registration Deposit"
                : "Russell–Sharp Family Reunion — Registration Payment",
              note: `Household: ${h.name}`,
              quantity: "1",
              base_price_money: { amount: Math.round(amount * 100), currency: "USD" },
            },
          ],
        },
        checkout_options: { redirect_url: `${SITE_URL}/my-invoice?paid=1` },
        pre_populated_data: { buyer_email: target },
      }),
    });

    return NextResponse.json({ url: data.payment_link?.url });
  } catch (err) {
    console.error("Checkout error:", err);
    const msg = err instanceof Error ? err.message : "";
    const hint = (err as { hint?: string })?.hint;
    // Show the family/organizer a clue about WHAT is wrong without exposing secrets.
    const clue = msg.startsWith("Missing SQUARE_")
      ? ` (setup problem: ${msg.replace(" env var.", "").replace("Missing ", "")} is not set on the site)`
      : hint
        ? ` (Square said: ${hint})`
        : "";
    return NextResponse.json({ error: "Could not start payment." + clue + " Please try again." }, { status: 500 });
  }
}
