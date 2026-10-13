export default function PaymentPolicy() {
  return (
    <div className="border border-[var(--gold-dark)] p-4 space-y-3 text-sm text-[var(--pearl-dim)] max-h-64 overflow-y-auto">
      <p className="font-heading text-[var(--gold-bright)]">Payment, Cancellation &amp; Transfer Policy</p>
      <p>
        Each family&rsquo;s total is based on the age-based registration fee for each person. Payments go toward the
        family&rsquo;s overall balance and are not assigned to individual attendees.
      </p>
      <p>
        Payments are nonrefundable if someone cancels, decides not to attend, or cannot attend. Removing someone from
        the registration does not reduce the amount owed or make any payment refundable. A registration may be
        transferred by notifying the reunion committee by August 1, 2027.
      </p>
      <p>
        T-shirt selections for late registrations or transfers are subject to availability. If the shirt order has
        already been placed, the requested size or style may not be available. If the reunion is canceled, payments will
        be refunded.
      </p>
    </div>
  );
}
