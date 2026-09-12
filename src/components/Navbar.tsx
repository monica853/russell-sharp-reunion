"use client";

import Link from "next/link";
import { useState } from "react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/reunion-details", label: "Reunion Details" },
  { href: "/interest-list", label: "Interest List" },
  { href: "/register", label: "Register" },
  { href: "/family-directory", label: "Family Directory" },
  { href: "/family-gatherings", label: "Family Gatherings" },
  { href: "/family-connections", label: "Family Connections" },
  { href: "/schedule", label: "Schedule" },
  { href: "/hotel-travel", label: "Hotel & Travel" },
  { href: "/payments", label: "Payments" },
  { href: "/my-invoice", label: "My Invoice" },
  { href: "/updates", label: "Family Updates" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[var(--ink)]/95 backdrop-blur border-b border-[var(--gold)]/30">
      <div className="mx-auto max-w-6xl px-5 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="deco-diamond" />
          <span className="font-heading tracking-[0.12em] text-[var(--gold-bright)] text-sm sm:text-base">
            RUSSELL&nbsp;&#8211;&nbsp;SHARP
          </span>
        </Link>

        <nav className="hidden lg:flex flex-wrap justify-end items-center gap-x-5 gap-y-1 max-w-3xl">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-heading text-xs tracking-wide text-[var(--pearl-dim)] hover:text-[var(--gold-bright)] transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden text-[var(--gold-bright)] font-heading text-sm border border-[var(--gold)]/50 px-3 py-1.5"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav className="lg:hidden border-t border-[var(--gold)]/20 px-5 py-3 flex flex-col gap-3">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="font-heading text-sm tracking-wide text-[var(--pearl-dim)] hover:text-[var(--gold-bright)]"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
