import { NextRequest, NextResponse } from "next/server";
import { findHousehold, recordPayment } from "@/lib/households";
import { squareFetch, verifySquareSignature } from "@/lib/square";

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

    const added = await recordPayment(h, payment.id, amount);
    if (!added) return NextResponse.json({ received: true, duplicate: true });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Square webhook handling error:", err);
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
  }
}
