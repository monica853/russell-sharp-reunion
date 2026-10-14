import { NextRequest, NextResponse } from "next/server";
import { requireHousehold, recordPayment } from "@/lib/households";
import { squareFetch } from "@/lib/square";

type Order = {
  metadata?: Record<string, string>;
  tenders?: { id?: string; payment_id?: string; amount_money?: { amount?: number }; card_details?: { status?: string } }[];
};

// Backup to the webhook: when a family returns from Square checkout, verify the
// order directly with Square and record the payment if it isn't already recorded.
export async function POST(req: NextRequest) {
  try {
    const h = await requireHousehold(req);
    if (h instanceof NextResponse) return h;

    const { orderId } = await req.json().catch(() => ({}));

    // With an order ID: check that one order. Without one ("Refresh payments"):
    // look through the last 60 days of paid orders for this household's.
    let orders: Order[] = [];
    if (orderId && typeof orderId === "string") {
      const { order } = await squareFetch(`/v2/orders/${encodeURIComponent(orderId)}`);
      if (order) orders = [order];
    } else {
      const locationId = process.env.SQUARE_LOCATION_ID;
      if (!locationId) throw new Error("Missing SQUARE_LOCATION_ID env var.");
      const since = new Date(Date.now() - 60 * 86400000).toISOString();
      const res = await squareFetch("/v2/orders/search", {
        method: "POST",
        body: JSON.stringify({
          location_ids: [locationId],
          limit: 200,
          query: { filter: { date_time_filter: { created_at: { start_at: since } } } },
        }),
      });
      orders = res.orders ?? [];
    }

    let recorded = 0;
    for (const order of orders) {
      if (String(order.metadata?.householdEmail ?? "").toLowerCase() !== h.email) continue;
      // Only count tenders that were actually captured.
      const tenders = (order.tenders ?? []).filter((t) => !t.card_details || t.card_details.status === "CAPTURED");
      for (const t of tenders) {
        const amount = Number(t.amount_money?.amount ?? 0) / 100;
        const paymentId = String(t.payment_id ?? t.id ?? "");
        if (amount > 0 && paymentId && (await recordPayment(h, paymentId, amount))) recorded++;
      }
    }
    return NextResponse.json({ success: true, recorded });
  } catch (err) {
    console.error("Checkout confirm error:", err);
    return NextResponse.json({ error: "Could not confirm payment." }, { status: 500 });
  }
}
