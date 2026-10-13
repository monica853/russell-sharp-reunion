"use client";

import { useEffect, useState } from "react";
import PaymentPolicy from "@/components/PaymentPolicy";
import { RATE_MAP, AGE_GROUPS, SHIRT_SIZES, INV_TYPE_ATTENDEE } from "@/lib/sheetsSchema";

type Line = {
  rowNum: number;
  date: string;
  type: string;
  name: string;
  relationship: string;
  ageGroup: string;
  tshirtSize: string;
  charges: number;
  credits: number;
  lineTotal: number;
};
type Invoice = {
  name: string;
  email: string;
  lodging: string;
  lines: Line[];
  totalOwed: number;
  amountPaid: number;
  balance: number;
  notes: string;
  policyAccepted: boolean;
};

const inputClass =
  "w-full bg-transparent border border-[var(--gold-dark)] focus:border-[var(--gold)] focus:outline-none px-3 py-2 text-[var(--pearl)] placeholder:text-[var(--muted)]";
const labelClass = "block text-xs tracking-wide text-[var(--pearl-dim)] mb-1 font-heading";
const money = (n: number) => `$${n.toFixed(2)}`;

async function post(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, json };
}

export default function MyInvoiceClient() {
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [policyChecked, setPolicyChecked] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [justPaid, setJustPaid] = useState(false);

  const [msg, setMsg] = useState("");
  const [savingShirt, setSavingShirt] = useState<number | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [newAtt, setNewAtt] = useState({ name: "", relationship: "", ageGroup: "", tshirtSize: "" });

  const [showPw, setShowPw] = useState(false);
  const [pwBusy, setPwBusy] = useState(false);
  const [pwError, setPwError] = useState("");

  async function loadInvoice() {
    try {
      const res = await fetch("/api/invoice");
      setInvoice(res.ok ? await res.json() : null);
    } catch {
      setInvoice(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
    loadInvoice();
    const qs = new URLSearchParams(window.location.search);
    if (qs.get("paid") === "1") {
      setJustPaid(true);
      // Square adds the order ID to the return link; confirm it directly so the
      // payment is recorded even if the webhook is slow or misconfigured.
      const orderId = qs.get("orderId") || qs.get("transactionId");
      if (orderId) {
        post("/api/checkout/confirm", { orderId })
          .then(() => loadInvoice())
          .catch(() => {});
      }
      // The payment is recorded by Square's webhook a moment after checkout; refresh a couple of times.
      setTimeout(loadInvoice, 4000);
      setTimeout(loadInvoice, 10000);
    }
  }, []);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    const data = new FormData(e.currentTarget);
    const { ok, json } = await post("/api/login", { email: data.get("email"), password: data.get("password") }).catch(
      () => ({ ok: false, json: { error: "Something went wrong. Please try again." } })
    );
    if (ok) await loadInvoice();
    else setLoginError(json.error || "Could not log in.");
    setLoggingIn(false);
  }

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    setInvoice(null);
  }

  async function handlePay() {
    setPaying(true);
    setPayError("");
    const amt = Number(payAmount);
    const { ok, json } = await post("/api/checkout", { ...(amt > 0 ? { amount: amt } : {}), acceptedPolicy: policyChecked || invoice?.policyAccepted === true }).catch(() => ({
      ok: false,
      json: { error: "Could not start payment." },
    }));
    if (ok && json.url) {
      window.location.href = json.url;
      return;
    }
    setPayError(json.error || "Could not start payment.");
    setPaying(false);
  }

  async function changeShirt(rowNum: number, size: string) {
    setSavingShirt(rowNum);
    setMsg("");
    const { ok, json } = await post("/api/account/tshirt", { rowNum, tshirtSize: size });
    if (ok) {
      setMsg("T-shirt size updated.");
      await loadInvoice();
    } else {
      setMsg(json.error || "Could not update T-shirt size.");
    }
    setSavingShirt(null);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setAddError("");
    const { ok, json } = await post("/api/account/attendees", newAtt);
    if (ok) {
      setNewAtt({ name: "", relationship: "", ageGroup: "", tshirtSize: "" });
      setShowAdd(false);
      setMsg("Attendee added. Your invoice has been updated.");
      await loadInvoice();
    } else {
      setAddError(json.error || "Could not add attendee.");
    }
    setAdding(false);
  }

  async function handlePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (data.get("newPassword") !== data.get("confirmPassword")) {
      setPwError("The new passwords don't match.");
      return;
    }
    setPwBusy(true);
    setPwError("");
    const { ok, json } = await post("/api/account/password", {
      currentPassword: data.get("currentPassword"),
      newPassword: data.get("newPassword"),
    });
    if (ok) {
      form.reset();
      setShowPw(false);
      setMsg("Password changed. Use your new password next time you log in.");
    } else {
      setPwError(json.error || "Could not change password.");
    }
    setPwBusy(false);
  }

  return (
    <section className="mx-auto max-w-4xl px-5 py-16">
      {loading && <p className="text-center text-[var(--pearl-dim)]">Loading…</p>}

      {!loading && !invoice && (
        <form onSubmit={handleLogin} className="space-y-5 card-plaque p-6 sm:p-8 max-w-lg mx-auto">
          <div>
            <label className={labelClass}>Email</label>
            <input required name="email" type="email" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Password</label>
            <input required name="password" type="password" className={inputClass} />
          </div>
          <p className="text-xs text-[var(--pearl-dim)]/70">
            Your password was shown when you registered and emailed to you. You can change it after you log in.
          </p>
          {loginError && <p className="text-[var(--oxblood)] text-sm">{loginError}</p>}
          <button type="submit" disabled={loggingIn} className="btn-primary w-full disabled:opacity-60">
            {loggingIn ? "Checking…" : "View My Invoice"}
          </button>
        </form>
      )}

      {!loading && invoice && (
        <div className="space-y-6">
          <div className="card-plaque p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <p className="font-heading text-[var(--gold-bright)] text-xl">{invoice.name}</p>
                <p className="text-xs text-[var(--pearl-dim)]">{invoice.email}</p>
              </div>
              <button onClick={handleLogout} className="btn-outline-clean text-sm self-start">
                Log Out
              </button>
            </div>

            {justPaid && (
              <p className="text-sm text-[var(--pearl)] border border-[var(--gold)] p-3">
                Thank you! Your payment is being recorded — your balance will update in a few seconds.
              </p>
            )}
            {msg && <p className="text-sm text-[var(--pearl)] border border-[var(--gold)] p-3">{msg}</p>}

            {/* Ledger */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead>
                  <tr className="text-left font-heading text-[var(--pearl)]" style={{ background: "#a3201a" }}>
                    {["Date", "Type", "Description", "Relationship", "Age", "T-Shirt", "Charges", "Credits", "Total"].map((h) => (
                      <th key={h} className="px-2 py-2 font-heading text-xs tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-[var(--pearl-dim)]">
                  {invoice.lines.map((l) => (
                    <tr key={l.rowNum} className="border-b border-[var(--gold)]/15">
                      <td className="px-2 py-2 whitespace-nowrap">{l.date}</td>
                      <td className="px-2 py-2 whitespace-nowrap">{l.type}</td>
                      <td className="px-2 py-2 text-[var(--pearl)]">{l.name}</td>
                      <td className="px-2 py-2">{l.relationship}</td>
                      <td className="px-2 py-2 whitespace-nowrap">{l.ageGroup}</td>
                      <td className="px-2 py-2">
                        {l.type === INV_TYPE_ATTENDEE ? (
                          <select
                            aria-label={`T-shirt size for ${l.name}`}
                            className="bg-transparent border border-[var(--gold-dark)] px-1 py-1 text-[var(--pearl)]"
                            value={l.tshirtSize}
                            disabled={savingShirt === l.rowNum}
                            onChange={(e) => changeShirt(l.rowNum, e.target.value)}
                          >
                            <option value="" disabled>
                              Select
                            </option>
                            {SHIRT_SIZES.map((s) => (
                              <option key={s} className="text-black">
                                {s}
                              </option>
                            ))}
                          </select>
                        ) : null}
                      </td>
                      <td className="px-2 py-2 text-right">{l.charges ? money(l.charges) : ""}</td>
                      <td className="px-2 py-2 text-right">{l.credits ? money(l.credits) : ""}</td>
                      <td className="px-2 py-2 text-right text-[var(--gold-bright)]">{money(l.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-2 max-w-sm ml-auto">
              <div className="flex justify-between text-sm text-[var(--pearl-dim)]">
                <span>Total registration cost</span>
                <span className="text-[var(--gold-bright)] font-heading">{money(invoice.totalOwed)}</span>
              </div>
              <div className="flex justify-between text-sm text-[var(--pearl-dim)]">
                <span>Paid so far</span>
                <span className="text-[var(--gold-bright)] font-heading">{money(invoice.amountPaid)}</span>
              </div>
              <div className="deco-rule my-2" />
              <div className="flex justify-between text-base">
                <span className="text-[var(--pearl)] font-heading">Balance due</span>
                <span className="text-[var(--gold-bright)] font-heading text-lg">{money(invoice.balance)}</span>
              </div>
            </div>

            {invoice.notes && (
              <p className="text-xs text-[var(--pearl-dim)]/70 border-t border-[var(--gold)]/20 pt-3">{invoice.notes}</p>
            )}
          </div>

          {/* Pay */}
          {invoice.balance > 0 && (
            <div className="card-plaque p-6 space-y-3">
              <p className="font-heading text-[var(--gold-bright)]">Make a Payment</p>
              <label className={labelClass}>
                Amount (leave blank for {invoice.amountPaid === 0 ? "the $25 deposit" : "the full balance"})
              </label>
              <input
                type="number"
                min="1"
                max={invoice.balance}
                step="0.01"
                inputMode="decimal"
                placeholder={invoice.amountPaid === 0 ? "25.00" : invoice.balance.toFixed(2)}
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className={inputClass}
              />
              {!invoice.policyAccepted && (
                <div className="space-y-3">
                  <PaymentPolicy />
                  <label className="flex items-start gap-3 text-sm text-[var(--pearl)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={policyChecked}
                      onChange={(e) => setPolicyChecked(e.target.checked)}
                      className="mt-1 h-4 w-4"
                    />
                    <span>I have read and accept the Payment, Cancellation &amp; Transfer Policy.</span>
                  </label>
                </div>
              )}
              <button onClick={handlePay} disabled={paying || (!invoice.policyAccepted && !policyChecked)} className="btn-primary w-full disabled:opacity-60">
                {paying ? "Opening secure checkout…" : "Pay Now"}
              </button>
              {payError && <p className="text-[var(--oxblood)] text-sm">{payError}</p>}
            </div>
          )}

          {/* Add attendee */}
          <div className="card-plaque p-6 space-y-4">
            <div className="flex justify-between items-center">
              <p className="font-heading text-[var(--gold-bright)]">Add an Attendee</p>
              <button onClick={() => setShowAdd((v) => !v)} className="btn-outline-clean text-sm">
                {showAdd ? "Cancel" : "+ Add"}
              </button>
            </div>
            {showAdd && (
              <form onSubmit={handleAdd} className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Name</label>
                  <input required className={inputClass} value={newAtt.name} onChange={(e) => setNewAtt({ ...newAtt, name: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass}>Relationship to you</label>
                  <input className={inputClass} value={newAtt.relationship} onChange={(e) => setNewAtt({ ...newAtt, relationship: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass}>Age group</label>
                  <select required className={inputClass} value={newAtt.ageGroup} onChange={(e) => setNewAtt({ ...newAtt, ageGroup: e.target.value })}>
                    <option value="">Select</option>
                    {AGE_GROUPS.map((g) => (
                      <option key={g} value={g} className="text-black">
                        {g} — ${RATE_MAP[g]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>T-shirt size</label>
                  <select className={inputClass} value={newAtt.tshirtSize} onChange={(e) => setNewAtt({ ...newAtt, tshirtSize: e.target.value })}>
                    <option value="">Select</option>
                    {SHIRT_SIZES.map((s) => (
                      <option key={s} className="text-black">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" disabled={adding} className="btn-primary w-full disabled:opacity-60">
                    {adding ? "Adding…" : "Add to My Invoice"}
                  </button>
                  {addError && <p className="text-[var(--oxblood)] text-sm mt-2">{addError}</p>}
                </div>
              </form>
            )}
          </div>

          {/* Password */}
          <div className="card-plaque p-6 space-y-4">
            <div className="flex justify-between items-center">
              <p className="font-heading text-[var(--gold-bright)]">Change Password</p>
              <button onClick={() => setShowPw((v) => !v)} className="btn-outline-clean text-sm">
                {showPw ? "Cancel" : "Change"}
              </button>
            </div>
            {showPw && (
              <form onSubmit={handlePassword} className="space-y-3 max-w-sm">
                <div>
                  <label className={labelClass}>Current password</label>
                  <input required name="currentPassword" type="password" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>New password (6+ characters)</label>
                  <input required minLength={6} name="newPassword" type="password" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Confirm new password</label>
                  <input required minLength={6} name="confirmPassword" type="password" className={inputClass} />
                </div>
                <button type="submit" disabled={pwBusy} className="btn-primary w-full disabled:opacity-60">
                  {pwBusy ? "Saving…" : "Save New Password"}
                </button>
                {pwError && <p className="text-[var(--oxblood)] text-sm">{pwError}</p>}
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
