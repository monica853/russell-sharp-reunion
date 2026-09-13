"use client";

import { useEffect, useState } from "react";

type Attendee = { name?: string; ageGroup?: string; tshirtSize?: string };
type Invoice = {
  name: string;
  lodging: string;
  attendees: Attendee[];
  totalOwed: number;
  amountPaid: number;
  balance: number;
  notes: string;
};

const inputClass =
  "w-full bg-transparent border border-[var(--gold-dark)] focus:border-[var(--gold)] focus:outline-none px-3 py-2 text-[var(--pearl)]";
const labelClass = "block text-xs tracking-wide text-[var(--pearl-dim)] mb-1 font-heading";

export default function MyInvoiceClient() {
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  async function loadInvoice() {
    setLoading(true);
    try {
      const res = await fetch("/api/invoice");
      if (res.ok) {
        setInvoice(await res.json());
      } else {
        setInvoice(null);
      }
    } catch {
      setInvoice(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
    loadInvoice();
  }, []);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    const data = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.get("email"), password: data.get("password") }),
      });
      const json = await res.json();
      if (res.ok) {
        await loadInvoice();
      } else {
        setLoginError(json.error || "Could not log in.");
      }
    } catch {
      setLoginError("Something went wrong. Please try again.");
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    setInvoice(null);
  }

  return (
    <section className="mx-auto max-w-lg px-5 py-16">
      {loading && <p className="text-center text-[var(--pearl-dim)]">Loading…</p>}

        {!loading && !invoice && (
          <form onSubmit={handleLogin} className="space-y-5 card-plaque p-6 sm:p-8">
            <div>
              <label className={labelClass}>Email</label>
              <input required name="email" type="email" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Invoice password</label>
              <input required name="password" type="text" className={inputClass} />
            </div>
            <p className="text-xs text-[var(--pearl-dim)]/70">
              Your password was shown once when you registered. Contact the family if you need it looked up.
            </p>
            {loginError && <p className="text-[var(--oxblood)] text-sm">{loginError}</p>}
            <button type="submit" disabled={loggingIn} className="btn-deco w-full disabled:opacity-60">
              {loggingIn ? "Checking…" : "View My Invoice"}
            </button>
          </form>
        )}

        {!loading && invoice && (
          <div className="card-plaque p-6 sm:p-8 space-y-6">
            <div>
              <p className="font-heading text-[var(--gold-bright)] text-xl">{invoice.name}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-[var(--pearl-dim)]">
                <span>Total registration cost</span>
                <span className="text-[var(--gold-bright)] font-heading">${invoice.totalOwed.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-[var(--pearl-dim)]">
                <span>Paid so far</span>
                <span className="text-[var(--gold-bright)] font-heading">${invoice.amountPaid.toFixed(2)}</span>
              </div>
              <div className="deco-rule my-2" />
              <div className="flex justify-between text-base">
                <span className="text-[var(--pearl)] font-heading">Balance due</span>
                <span className="text-[var(--gold-bright)] font-heading text-lg">${invoice.balance.toFixed(2)}</span>
              </div>
            </div>

            {invoice.attendees?.length > 0 && (
              <div>
                <p className="font-heading text-[var(--gold-bright)] text-sm mb-2">Attendees</p>
                <ul className="text-sm text-[var(--pearl-dim)] space-y-1">
                  {invoice.attendees.map((a, i) => (
                    <li key={i}>
                      {a.name || "—"} {a.ageGroup ? `(${a.ageGroup})` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {invoice.notes && (
              <p className="text-xs text-[var(--pearl-dim)]/70 border-t border-[var(--gold)]/20 pt-3">
                {invoice.notes}
              </p>
            )}

            <button onClick={handleLogout} className="btn-deco-outline w-full text-sm">
              Log Out
            </button>
          </div>
        )}
    </section>
  );
}
