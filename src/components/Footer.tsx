import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-20">
      <div className="mx-auto max-w-6xl px-5 py-10 grid gap-8 sm:grid-cols-3 text-sm">
        <div>
          <Image
            src="/images/logo-light.png"
            alt="Russell–Sharp Family"
            width={180}
            height={120}
            className="h-12 w-auto mb-3"
          />
          <p className="text-[var(--pearl-dim)]">
            September 3&#8211;5, 2027<br />Atlanta, Georgia
          </p>
        </div>
        <div>
          <p className="font-semibold text-white mb-2">Get Involved</p>
          <ul className="space-y-1 text-[var(--pearl-dim)]">
            <li><Link className="hover:text-white transition-colors" href="/interest-list">Join the Interest List</Link></li>
            <li><Link className="hover:text-white transition-colors" href="/register">Register Your Household</Link></li>
            <li><Link className="hover:text-white transition-colors" href="/updates">Family Updates</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white mb-2">Note</p>
          <p className="text-[var(--pearl-dim)]">
            Dates and planning details are subject to change. Registered families will receive updates by email and text.
          </p>
        </div>
      </div>
      <div className="h-px bg-white/10" />
      <p className="text-center text-xs text-[var(--pearl-dim)]/70 py-4">
        Same Roots. New Vibes. &copy; {new Date().getFullYear()} Russell&#8211;Sharp Family Reunion.
      </p>
    </footer>
  );
}
