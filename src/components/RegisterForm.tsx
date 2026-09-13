"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Attendee = { name: string; ageGroup: string; tshirtSize: string };

const RATES: Record<string, number> = {
  "75+": 95,
  "18–74": 195,
  "12–17": 30,
  "5–11": 20,
  "Under 5": 5,
};
const AGE_GROUPS = Object.keys(RATES);
const SHIRT_SIZES = ["Youth S", "Youth M", "Youth L", "Adult S", "Adult M", "Adult L", "Adult XL", "Adult 2XL", "Adult 3XL"];

const inputClass =
  "w-full bg-transparent border border-[var(--gold-dark)] focus:border-[var(--gold)] focus:outline-none px-3 py-2 text-[var(--pearl)] placeholder:text-[var(--muted)]";
const labelClass = "block text-xs tracking-wide text-[var(--pearl-dim)] mb-1 font-heading";

function emptyAttendee(): Attendee {
  return { name: "", ageGroup: "", tshirtSize: "" };
}

export default function RegisterForm() {
  const [attendees, setAttendees] = useState<Attendee[]>([emptyAttendee()]);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");

  const [primaryName, setPrimaryName] = useState("");
  const [email, setEmail] = useState("");
  const [lookupEmail, setLookupEmail] = useState("");
  const [lookupStatus, setLookupStatus] = useState<"idle" | "loading" | "error">("idle");
  const [lookupError, setLookupError] = useState("");

  async function handleAutofill() {
    if (!lookupEmail) return;
    setLookupStatus("loading");
    setLookupError("");
    try {
      const res = await fetch(`/api/interest-list/lookup?email=${encodeURIComponent(lookupEmail)}`);
      const json = await res.json();
      if (res.ok) {
        setPrimaryName(json.primaryName || "");
        setEmail(lookupEmail);
        if (Array.isArray(json.members) && json.members.length > 0) {
          setAttendees(
            json.members.map((m: Attendee) => ({
              name: m.name || "",
              ageGroup: m.ageGroup || "",
              tshirtSize: m.tshirtSize || "",
            }))
          );
        }
        setLookupStatus("idle");
      } else {
        setLookupError(json.error || "Couldn't find that submission.");
        setLookupStatus("error");
      }
    } catch {
      setLookupError("Something went wrong. Please try again.");
      setLookupStatus("error");
    }
  }

  const total = useMemo(
    () => attendees.reduce((sum, a) => sum + (RATES[a.ageGroup] ?? 0), 0),
    [attendees]
  );
  const deposit = 25;
  const balanceAfterDeposit = Math.max(0, total - deposit);

  function update(i: number, field: keyof Attendee, value: string) {
    setAttendees((prev) => prev.map((a, idx) => (idx === i ? { ...a, [field]: value } : a)));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      primaryName: data.get("primary_name"),
      email: data.get("email"),
      emergencyName: data.get("emergency_name"),
      emergencyPhone: data.get("emergency_phone"),
      lodgingSelection: data.get("lodging_selection"),
      accommodations: data.get("accommodations"),
      attendees,
    };

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok) {
        setGeneratedPassword(json.password || "");
        setStatus("success");
        form.reset();
        setAttendees([emptyAttendee()]);
        setPrimaryName("");
        setEmail("");
      } else {
        setErrorMsg(json.error || "Something went wrong. Please try again.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="card-plaque p-8 text-center space-y-4">
        <p className="font-heading text-[var(--gold-bright)] text-xl mb-2">You&apos;re registered!</p>
        <p className="text-[var(--pearl-dim)]">
          We&apos;ve recorded your household and the $25 deposit toward your total.
        </p>
        <div className="bg-[var(--ink)] border border-[var(--gold)] p-4 inline-block">
          <p className="text-xs tracking-wide text-[var(--pearl-dim)] mb-1 font-heading">YOUR INVOICE PASSWORD</p>
          <p className="font-heading text-2xl text-[var(--gold-bright)] tracking-widest">{generatedPassword}</p>
        </div>
        <p className="text-xs text-[var(--pearl-dim)]/70 max-w-sm mx-auto">
          Save this password &mdash; use it with your email to check your balance anytime on the Payments page.
        </p>
        <Link href="/my-invoice" className="btn-deco inline-block">
          View My Invoice
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="card-plaque p-5 space-y-3">
        <p className="font-heading text-[var(--pearl)] text-sm">Already on the Interest List?</p>
        <p className="text-xs text-[var(--pearl-dim)]">
          Enter the email you used to join the interest list, and we&apos;ll fill in your household&apos;s info below.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            placeholder="you@example.com"
            className={inputClass}
            value={lookupEmail}
            onChange={(e) => setLookupEmail(e.target.value)}
          />
          <button
            type="button"
            onClick={handleAutofill}
            disabled={lookupStatus === "loading" || !lookupEmail}
            className="btn-outline-clean text-sm whitespace-nowrap disabled:opacity-60"
          >
            {lookupStatus === "loading" ? "Looking up…" : "Autofill My Info"}
          </button>
        </div>
        {lookupStatus === "error" && <p className="text-[var(--oxblood)] text-sm">{lookupError}</p>}
      </div>

      <fieldset className="space-y-4">
        <legend className="font-heading text-[var(--gold-bright)] tracking-wide mb-2">Household Contact</legend>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Full name</label>
            <input
              required
              name="primary_name"
              className={inputClass}
              value={primaryName}
              onChange={(e) => setPrimaryName(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              required
              name="email"
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Emergency contact name</label>
            <input required name="emergency_name" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Emergency contact phone</label>
            <input required name="emergency_phone" type="tel" className={inputClass} />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-heading text-[var(--gold-bright)] tracking-wide mb-2">Attendees</legend>
        <div className="space-y-4">
          {attendees.map((a, i) => (
            <div key={i} className="card-plaque p-4 grid sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className={labelClass}>Name</label>
                <input className={inputClass} value={a.name} onChange={(e) => update(i, "name", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Age group</label>
                <select className={inputClass} value={a.ageGroup} onChange={(e) => update(i, "ageGroup", e.target.value)}>
                  <option value="">Select</option>
                  {AGE_GROUPS.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>T-shirt size</label>
                <select className={inputClass} value={a.tshirtSize} onChange={(e) => update(i, "tshirtSize", e.target.value)}>
                  <option value="">Select</option>
                  {SHIRT_SIZES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--gold-bright)] font-heading text-sm">
                  {a.ageGroup ? `$${RATES[a.ageGroup]}` : "—"}
                </span>
                {attendees.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setAttendees((prev) => prev.filter((_, idx) => idx !== i))}
                    className="text-[var(--oxblood)] hover:text-red-400 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setAttendees((prev) => [...prev, emptyAttendee()])}
          className="btn-deco-outline text-sm"
        >
          + Add another attendee
        </button>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-heading text-[var(--gold-bright)] tracking-wide mb-2">Lodging</legend>
        <div>
          <label className={labelClass}>Lodging selection</label>
          <select required name="lodging_selection" className={inputClass}>
            <option value="">Select one</option>
            <option>Staying at host hotel (Aloft Lawrenceville Sugarloaf)</option>
            <option>Arranging my own lodging</option>
            <option>Not staying overnight</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Special accommodations</label>
          <textarea name="accommodations" rows={3} className={inputClass} />
        </div>
      </fieldset>

      <div className="card-plaque p-6 space-y-2">
        <div className="flex justify-between text-sm text-[var(--pearl-dim)]">
          <span>Household registration total</span>
          <span className="text-[var(--gold-bright)] font-heading">${total}</span>
        </div>
        <div className="flex justify-between text-sm text-[var(--pearl-dim)]">
          <span>Deposit due now (applied to total)</span>
          <span className="text-[var(--gold-bright)] font-heading">${deposit}</span>
        </div>
        <div className="deco-rule my-2" />
        <div className="flex justify-between text-sm text-[var(--pearl-dim)]">
          <span>Remaining balance after deposit</span>
          <span className="text-[var(--gold-bright)] font-heading">${balanceAfterDeposit}</span>
        </div>
        <p className="text-xs text-[var(--pearl-dim)]/70 pt-2">
          At least 50% of the total is due by March 31, 2027. The remaining balance is due in full by June 30, 2027.
        </p>
      </div>

      <div className="text-center pt-2">
        <button type="submit" disabled={status === "submitting"} className="btn-deco disabled:opacity-60">
          {status === "submitting" ? "Submitting…" : "Submit Registration & Pay $25 Deposit"}
        </button>
        {status === "error" && <p className="text-[var(--oxblood)] mt-3 text-sm">{errorMsg}</p>}
      </div>
    </form>
  );
}
