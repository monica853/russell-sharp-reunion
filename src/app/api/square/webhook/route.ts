import { NextRequest, NextResponse } from "next/server";
import { INV_TYPE_PAYMENT } from "@/lib/sheetsSchema";
import { findHousehold, loadInvoice, appendInvoiceLines, totals } from "@/lib/households";
import { squareFetch, verifySquareSignature } from "@/lib/square";
import { sendEmail, alertCcList } from "@/lib/email";

export async function POST(req: NextRequest) {
  const raw = await req.text(); // raw body is required for the signature check
  if (!verifySquareSignature(raw, req.headers.get("x-square-hmacsha256-signature"))) {
    console.error("Square webhook signature failed");
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    const event = JSON.parse(raw);
    if (event.type !== "payment.updated") {
      return NextResponse.json({ received: true });
    }
    const payment = event.data?.object?.payment;
    if (!payment || payment.status !== "COMPLETED" || !payment.order_id) {
      return NextResponse.json({ received: true });
    }

    const amount = Number(payment.amount_money?.amount ?? 0) / 100;
    if (amount <= 0) return NextResponse.json({ received: true });

    // Look up which household this payment belongs to (set on the order when the link was made).
    const orderRes = await squareFetch(`/v2/orders/${payment.order_id}`);
    const email = String(orderRes.order?.metadata?.householdEmail ?? "").trim().toLowerCase();
    if (!email) return NextResponse.json({ received: true }); // not one of our registration payments

    const h = await findHousehold(email);
    if (!h) {
      console.error("Square payment for unknown household:", email, payment.id);
      return NextResponse.json({ error: "Household not found." }, { status: 500 });
    }

    // Idempotency: Square can deliver the same event more than once, so skip
    // a payment ID we've already written to this household's invoice.
    const before = await loadInvoice(h.sheetName);
    if (before.some((l) => l.reference === payment.id)) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    const lines = await appendInvoiceLines(h, [
      { type: INV_TYPE_PAYMENT, name: "Square payment", credits: amount, reference: payment.id },
    ]);
    const { totalOwed, amountPaid: newPaid, balance } = totals(lines);

    await sendEmail({
      to: email,
      cc: alertCcList(),
      subject: "Payment received — Russell–Sharp Family Reunion",
      text: `Hi ${h.name},

We received your payment of $${amount.toFixed(2)}. Thank you!

Household total: $${totalOwed.toFixed(2)}
Paid to date: $${newPaid.toFixed(2)}
Remaining balance: $${balance.toFixed(2)}

You can check your balance or make another payment anytime at russellsharpfamily.com/my-invoice.

Same Roots. New Vibes.
— Russell–Sharp Family Reunion`,
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Square webhook handling error:", err);
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
  }
}
