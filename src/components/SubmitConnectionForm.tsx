"use client";

import { useState } from "react";

const inputClass =
  "w-full bg-transparent border border-[var(--gold-dark)] focus:border-[var(--gold)] focus:outline-none px-3 py-2 text-[var(--pearl)] placeholder:text-[var(--muted)]";
const labelClass = "block text-xs tracking-wide text-[var(--pearl-dim)] mb-1 font-heading";

export default function SubmitConnectionForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      businessName: data.get("business_name"),
      ownerName: data.get("owner_name"),
      category: data.get("category"),
      description: data.get("description"),
      website: data.get("website"),
      phone: data.get("phone"),
      email: data.get("email"),
    };

    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok) {
        setStatus("success");
        form.reset();
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
      <div className="card-plaque p-8 text-center">
        <p className="font-heading text-[var(--pearl)] text-xl mb-2">Thanks for sharing!</p>
        <p className="text-[var(--pearl-dim)]">
          Your listing has been submitted for review. Once approved, it&apos;ll appear on the Family Connections page.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Business, service, or project name</label>
          <input required name="business_name" className={inputClass} placeholder="Sharp Family Catering" />
        </div>
        <div>
          <label className={labelClass}>Your name</label>
          <input required name="owner_name" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <input name="category" className={inputClass} placeholder="Catering, Real Estate, Photography..." />
        </div>
        <div>
          <label className={labelClass}>Website (if any)</label>
          <input name="website" className={inputClass} placeholder="www.example.com" />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Short description</label>
          <textarea name="description" rows={3} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input name="phone" type="tel" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input name="email" type="email" className={inputClass} />
        </div>
      </div>

      <p className="text-xs text-[var(--pearl-dim)]/70">
        Submissions are reviewed before they appear on the site.
      </p>

      <div className="text-center pt-2">
        <button type="submit" disabled={status === "submitting"} className="btn-primary disabled:opacity-60">
          {status === "submitting" ? "Submitting…" : "Submit for Review"}
        </button>
        {status === "error" && <p className="text-[var(--oxblood)] mt-3 text-sm">{errorMsg}</p>}
      </div>
    </form>
  );
}
