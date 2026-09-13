"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type NavLink = { href: string; label: string };
type NavGroup = { label: string; links: NavLink[] };

const GROUPS: NavGroup[] = [
  {
    label: "Reunion 2027",
    links: [
      { href: "/reunion-details", label: "Reunion Details" },
      { href: "/interest-list", label: "Interest List" },
      { href: "/register", label: "Register" },
      { href: "/payments", label: "Registration Timeline" },
      { href: "/hotel-travel", label: "Lodging" },
      { href: "/schedule", label: "Schedule" },
      { href: "/my-invoice", label: "My Invoice" },
    ],
  },
  {
    label: "Family",
    links: [
      { href: "/family-directory", label: "Family Directory" },
      { href: "/family-gatherings", label: "Family Gatherings" },
      { href: "/family-connections", label: "Family Connections" },
      { href: "/updates", label: "Family Updates" },
    ],
  },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[var(--ink)]/95 backdrop-blur border-b border-[var(--gold)]/30">
        <div className="mx-auto max-w-6xl px-5 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
            <Image
              src="/images/logo-light.png"
              alt="Russell–Sharp Family"
              width={220}
              height={147}
              priority
              className="h-9 sm:h-10 w-auto"
            />
          </Link>

          <button
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="relative z-50 w-9 h-9 flex flex-col items-center justify-center gap-[5px] group"
          >
            <span
              className={`block h-[1.5px] w-6 bg-[var(--gold-bright)] transition-transform duration-300 ease-out ${
                open ? "translate-y-[6.5px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-[1.5px] w-6 bg-[var(--gold-bright)] transition-opacity duration-200 ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`block h-[1.5px] w-6 bg-[var(--gold-bright)] transition-transform duration-300 ease-out ${
                open ? "-translate-y-[6.5px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </header>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/70 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Side drawer */}
      <nav
        aria-label="Main navigation"
        className={`fixed top-0 right-0 z-40 h-full w-[85vw] max-w-sm bg-[var(--ink-soft)] border-l border-[var(--gold)]/40 shadow-2xl transition-transform duration-300 ease-out overflow-y-auto ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="pt-24 pb-10 px-8 flex flex-col gap-8">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="font-heading text-lg text-[var(--gold-bright)] tracking-wide hover:text-[var(--gold)] transition-colors"
          >
            Home
          </Link>

          {GROUPS.map((group) => (
            <div key={group.label}>
              <p className="font-heading text-xs tracking-[0.2em] text-[var(--gold)] mb-3">
                {group.label}
              </p>
              <div className="flex flex-col gap-3 pl-1">
                {group.links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="text-[var(--pearl)] hover:text-[var(--gold-bright)] transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div className="deco-rule" />

          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="font-heading text-[var(--gold-bright)] hover:text-[var(--gold)] transition-colors"
          >
            Contact
          </Link>
        </div>
      </nav>
    </>
  );
}
