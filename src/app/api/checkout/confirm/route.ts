import { NextRequest, NextResponse } from "next/server";
import { requireHousehold, recordPayment } from "@/lib/households";
import { squareFetch } from "@/lib/square";

// Backup to the webhook: when a family returns from Square checkout, verify the
// order directly with Square and record the payment if it isn't already recorded.
export async function POST(req: NextRequest) {
  try {
    const h = await requireHousehold(req);
    if (h instanceof NextResponse) return h;

    const { orderId } = await req.json().catch(() => ({}));
    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ error: "Missing order." }, { status: 400 });
    }

    const { order } = await squareFetch(`/v2/orders/${encodeURIComponent(orderId)}`);
    if (!order || String(order.metadata?.householdEmail ?? "").toLowerCase() !== h.email) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // Only count tenders that were actually captured.
    const tenders = (order.tenders ?? []).filter(
      (t: { card_details?: { status?: string } }) => !t.card_details || t.card_details.status === "CAPTURED"
    );
    let recorded = 0;
    for (const t of tenders) {
      const amount = Number(t.amount_money?.amount ?? 0) / 100;
      const paymentId = String(t.payment_id ?? t.id ?? "");
      if (amount > 0 && paymentId && (await recordPayment(h, paymentId, amount))) recorded++;
    }
    return NextResponse.json({ success: true, recorded });
  } catch (err) {
    console.error("Checkout confirm error:", err);
    return NextResponse.json({ error: "Could not confirm payment." }, { status: 500 });
  }
}
