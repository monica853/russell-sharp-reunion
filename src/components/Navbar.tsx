"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type NavLink = { href: string; label: string };

// Shown directly in the header on desktop — the handful of pages people need
// most often during the run-up to the reunion.
const PRIMARY_LINKS: NavLink[] = [
  { href: "/reunion-details", label: "Reunion Details" },
  { href: "/payments", label: "Registration Timeline" },
  { href: "/hotel-travel", label: "Lodging" },
  { href: "/schedule", label: "Schedule" },
  { href: "/my-invoice", label: "My Account" },
];

// Everything else lives in the side drawer, grouped for scanability.
const DRAWER_GROUPS: { label: string; links: NavLink[] }[] = [
  {
    label: "Reunion 2027",
    links: [
      { href: "/reunion-details", label: "Reunion Details" },
      { href: "/interest-list", label: "Interest List" },
      { href: "/register", label: "Register" },
      { href: "/payments", label: "Registration Timeline" },
      { href: "/hotel-travel", label: "Lodging" },
      { href: "/schedule", label: "Schedule" },
      { href: "/my-invoice", label: "My Account" },
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
      <header className="sticky top-0 z-40 bg-[var(--ink)]/90 backdrop-blur border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center shrink-0" onClick={() => setOpen(false)}>
            <Image
              src="/images/logo-light.png"
              alt="Russell–Sharp Family"
              width={220}
              height={147}
              priority
              className="h-9 w-auto"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-7">
            {PRIMARY_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-base font-semibold text-[var(--pearl)] hover:text-white transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:block">
              <Link href="/interest-list" className="btn-primary text-sm !py-2 !px-4">
                Join the Interest List
              </Link>
            </div>

            <button
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="relative z-50 w-9 h-9 flex flex-col items-center justify-center gap-[5px]"
            >
              <span
                className={`block h-[1.5px] w-6 bg-[var(--pearl)] transition-transform duration-300 ease-out ${
                  open ? "translate-y-[6.5px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-[1.5px] w-6 bg-[var(--pearl)] transition-opacity duration-200 ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`block h-[1.5px] w-6 bg-[var(--pearl)] transition-transform duration-300 ease-out ${
                  open ? "-translate-y-[6.5px] -rotate-45" : ""
                }`}
              />
            </button>
          </div>
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
        className={`fixed top-0 right-0 z-40 h-full w-[85vw] max-w-sm bg-[var(--ink-soft)] border-l border-white/10 shadow-2xl transition-transform duration-300 ease-out overflow-y-auto ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="pt-24 pb-10 px-8 flex flex-col gap-8">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="font-semibold text-lg text-[var(--pearl)] hover:text-white transition-colors"
          >
            Home
          </Link>

          {DRAWER_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-xs tracking-[0.15em] text-[var(--accent-bright)] font-semibold mb-3">
                {group.label.toUpperCase()}
              </p>
              <div className="flex flex-col gap-3 pl-1">
                {group.links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="text-[var(--pearl)] hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div className="h-px bg-white/10" />

          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="font-semibold text-[var(--pearl)] hover:text-white transition-colors"
          >
            Contact
          </Link>
        </div>
      </nav>
    </>
  );
}
