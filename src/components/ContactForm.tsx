"use client";

import { useState } from "react";

const inputClass =
  "w-full bg-transparent border border-[var(--gold-dark)] focus:border-[var(--gold)] focus:outline-none px-3 py-2 text-[var(--pearl)]";
const labelClass = "block text-xs tracking-wide text-[var(--pearl-dim)] mb-1 font-heading";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.get("name"), email: data.get("email"), message: data.get("message") }),
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
        <p className="font-heading text-[var(--gold-bright)] text-xl mb-2">Message sent!</p>
        <p className="text-[var(--pearl-dim)]">We&apos;ll get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 card-plaque p-6 sm:p-8">
      <div>
        <label className={labelClass}>Name</label>
        <input required name="name" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Email</label>
        <input required name="email" type="email" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Message</label>
        <textarea required name="message" rows={5} className={inputClass} />
      </div>
      {status === "error" && <p className="text-[var(--oxblood)] text-sm">{errorMsg}</p>}
      <button type="submit" disabled={status === "submitting"} className="btn-deco w-full disabled:opacity-60">
        {status === "submitting" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
