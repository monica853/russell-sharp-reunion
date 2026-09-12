"use client";

import { useState } from "react";

const inputClass =
  "w-full bg-transparent border border-[var(--gold)]/40 focus:border-[var(--gold)] focus:outline-none px-3 py-2 text-[var(--pearl)] placeholder:text-[var(--pearl-dim)]/50";
const labelClass = "block text-xs tracking-wide text-[var(--pearl-dim)] mb-1 font-heading";

export default function SubmitGatheringForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      eventName: data.get("event_name"),
      hostName: data.get("host_name"),
      dateTime: data.get("date_time"),
      location: data.get("location"),
      description: data.get("description"),
      invited: data.get("invited"),
      cost: data.get("cost"),
      rsvpDeadline: data.get("rsvp_deadline"),
      rsvpContact: data.get("rsvp_contact"),
      submitterEmail: data.get("submitter_email"),
      submitterPhone: data.get("submitter_phone"),
    };

    try {
      const res = await fetch("/api/gatherings", {
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
        <p className="font-heading text-[var(--gold-bright)] text-xl mb-2">Thanks for sharing!</p>
        <p className="text-[var(--pearl-dim)]">
          Your event has been submitted for review. Once approved, it&apos;ll appear on the Family Gatherings page.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Event name</label>
          <input required name="event_name" className={inputClass} placeholder="Sharp Family Cookout" />
        </div>
        <div>
          <label className={labelClass}>Host&apos;s name</label>
          <input required name="host_name" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Date &amp; time</label>
          <input required name="date_time" className={inputClass} placeholder="Saturday, June 14, 2027 · 2:00 PM" />
        </div>
        <div>
          <label className={labelClass}>Location</label>
          <input required name="location" className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Short description</label>
          <textarea name="description" rows={3} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Who&apos;s invited</label>
          <input name="invited" className={inputClass} placeholder="All Sharp family, or open to everyone" />
        </div>
        <div>
          <label className={labelClass}>Cost, if any</label>
          <input name="cost" className={inputClass} placeholder="Free, or $10/person" />
        </div>
        <div>
          <label className={labelClass}>RSVP deadline</label>
          <input name="rsvp_deadline" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>RSVP / contact info to show publicly</label>
          <input required name="rsvp_contact" className={inputClass} placeholder="Text Aunt Pam at (404) 555-0100" />
        </div>
      </div>

      <div className="deco-rule" />

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Your email (not shown publicly)</label>
          <input required name="submitter_email" type="email" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Your phone (not shown publicly)</label>
          <input name="submitter_phone" type="tel" className={inputClass} />
        </div>
      </div>

      <p className="text-xs text-[var(--pearl-dim)]/70">
        Submissions are reviewed before they appear on the site.
      </p>

      <div className="text-center pt-2">
        <button type="submit" disabled={status === "submitting"} className="btn-deco disabled:opacity-60">
          {status === "submitting" ? "Submitting…" : "Submit Event for Review"}
        </button>
        {status === "error" && <p className="text-[var(--oxblood)] mt-3 text-sm">{errorMsg}</p>}
      </div>
    </form>
  );
}
