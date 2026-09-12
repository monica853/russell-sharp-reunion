import Image from "next/image";
import Link from "next/link";
import Countdown from "@/components/Countdown";
import { TIMELINE } from "@/lib/timeline";

const SECTIONS = [
  { href: "/reunion-details", title: "Reunion Details", body: "September 3–5, 2027 · Atlanta, Georgia" },
  { href: "/interest-list", title: "Join the Interest List", body: "Early headcount and contact information" },
  { href: "/register", title: "Register Your Household", body: "Primary person, spouse, adults, and children" },
  { href: "/family-directory", title: "Family Directory", body: "Russell and Sharp family branches" },
  { href: "/family-gatherings", title: "Family Gatherings", body: "Hikes, cookouts, and celebrations year-round" },
  { href: "/family-connections", title: "Family Connections", body: "Businesses and services shared by family" },
  { href: "/schedule", title: "Schedule", body: "Activities added as plans are confirmed" },
  { href: "/hotel-travel", title: "Hotel & Travel", body: "Where to stay and how to get there" },
  { href: "/payments", title: "Payments", body: "Deposit, balances, and due dates" },
  { href: "/updates", title: "Family Updates", body: "News as planning moves forward" },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-3xl px-5 pt-10 sm:pt-14">
          <div className="deco-frame">
            <Image
              src="/images/save-the-date.png"
              alt="Save the Date — Russell–Sharp Family Reunion, Atlanta, Georgia, September 3–5, 2027"
              width={1080}
              height={1080}
              priority
              className="w-full h-auto"
            />
          </div>
        </div>

        <div className="text-center px-5 mt-10">
          <p className="font-heading text-[var(--gold)] text-xs sm:text-sm tracking-[0.3em]">
            SAME ROOTS &middot; NEW VIBES
          </p>
          <h1 className="font-display text-3xl sm:text-5xl text-[var(--gold-bright)] mt-4 leading-tight max-w-3xl mx-auto">
            One Unforgettable Family Reunion
          </h1>
          <p className="mt-4 text-[var(--pearl-dim)] max-w-xl mx-auto">
            Russell&#8211;Sharp Family Reunion &middot; September 3&#8211;5, 2027 &middot; Atlanta, Georgia
          </p>

          <div className="mt-8">
            <Countdown />
          </div>

          <div className="mt-10">
            <Link href="/interest-list" className="btn-deco">
              Join the Interest List
            </Link>
          </div>
          <p className="mt-4 text-xs text-[var(--pearl-dim)]/70 max-w-md mx-auto">
            No payment required at this stage &mdash; joining the list simply helps us plan lodging, activities, and reunion apparel.
          </p>
        </div>
      </section>

      <div className="chevron-divider mt-16" />

      {/* Section overview */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-heading text-center text-[var(--gold-bright)] text-2xl tracking-wide mb-2">
          Find Your Way Around
        </h2>
        <p className="text-center text-[var(--pearl-dim)] mb-10 max-w-xl mx-auto">
          The site will grow with the reunion. Here&apos;s what&apos;s here now, and what&apos;s coming as each phase opens.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SECTIONS.map((s) => (
            <Link key={s.href} href={s.href} className="card-plaque p-5 block hover:border-[var(--gold)] transition-colors">
              <p className="font-heading text-[var(--gold-bright)] mb-1">{s.title}</p>
              <p className="text-sm text-[var(--pearl-dim)]">{s.body}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="chevron-divider" />

      {/* Timeline preview */}
      <section className="mx-auto max-w-3xl px-5 py-16">
        <h2 className="font-heading text-center text-[var(--gold-bright)] text-2xl tracking-wide mb-10">
          Planning Timeline
        </h2>
        <ol className="space-y-6">
          {TIMELINE.map((t, i) => (
            <li key={i} className="flex gap-4">
              <div className="flex flex-col items-center pt-1">
                <span className="deco-diamond" />
                {i < TIMELINE.length - 1 && <span className="w-px flex-1 bg-[var(--gold)]/30 mt-2" />}
              </div>
              <div className="pb-2">
                <p className="text-xs tracking-wide text-[var(--gold)] font-heading">{t.when}</p>
                <p className="font-heading text-[var(--pearl)] mt-1">{t.title}</p>
                <p className="text-sm text-[var(--pearl-dim)] mt-1">{t.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="text-center mt-10">
          <Link href="/payments" className="btn-deco-outline text-sm">
            View Full Timeline & Payment Schedule
          </Link>
        </div>
      </section>
    </div>
  );
}
