import Image from "next/image";
import Link from "next/link";
import {
  CalendarHeart,
  ClipboardList,
  UserPlus,
  Wallet,
  BedDouble,
  CalendarClock,
  Users,
  PartyPopper,
  Handshake,
  Megaphone,
  type LucideIcon,
} from "lucide-react";
import Countdown from "@/components/Countdown";
import { TIMELINE } from "@/lib/timeline";

type SectionLink = { href: string; title: string; body: string; icon: LucideIcon };

const REUNION_SECTIONS: SectionLink[] = [
  { href: "/reunion-details", title: "Reunion Details", body: "September 3–5, 2027 · Atlanta", icon: CalendarHeart },
  { href: "/interest-list", title: "Interest List", body: "Tell us you're planning to come", icon: ClipboardList },
  { href: "/register", title: "Register", body: "Reserve your household's place", icon: UserPlus },
  { href: "/payments", title: "Registration Timeline", body: "Deposit, balances, and due dates", icon: Wallet },
  { href: "/hotel-travel", title: "Lodging", body: "Where to stay and how to get there", icon: BedDouble },
  { href: "/schedule", title: "Schedule", body: "Activities as plans are confirmed", icon: CalendarClock },
];

const FAMILY_SECTIONS: SectionLink[] = [
  { href: "/family-directory", title: "Family Directory", body: "Russell and Sharp family branches", icon: Users },
  { href: "/family-gatherings", title: "Family Gatherings", body: "Hikes, cookouts, celebrations year-round", icon: PartyPopper },
  { href: "/family-connections", title: "Family Connections", body: "Businesses and services shared by family", icon: Handshake },
  { href: "/updates", title: "Family Updates", body: "News as planning moves forward", icon: Megaphone },
];

function SectionGrid({ items }: { items: SectionLink[] }) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {items.map((s) => {
        const Icon = s.icon;
        return (
          <Link key={s.href} href={s.href} className="group flex items-start gap-4 py-3">
            <Icon className="w-5 h-5 mt-1 text-[var(--accent-bright)] shrink-0" strokeWidth={1.5} />
            <div>
              <p className="font-semibold text-[var(--pearl)] group-hover:text-white transition-colors">
                {s.title}
              </p>
              <p className="text-sm text-[var(--pearl-dim)] mt-0.5">{s.body}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default function Home() {
  return (
    <div>
      {/* Hero — Atlanta skyline stays fixed behind the content as it scrolls */}
      <section className="relative min-h-[85vh] sm:min-h-screen bg-[url('/images/atlanta-skyline.png')] bg-cover bg-center bg-fixed flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--ink)] via-[var(--ink)]/85 to-[var(--ink)]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-transparent to-[var(--ink)]/30" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 py-20 grid lg:grid-cols-[1fr_auto] gap-14 items-end">
          <div className="min-w-0">
            <p className="tag-label mb-5">SAME ROOTS &middot; NEW VIBES</p>
            <h1 className="font-black text-4xl sm:text-6xl lg:text-7xl leading-[0.98] text-white">
              Russell&#8211;Sharp
              <br />
              Family Reunion
            </h1>
            <p className="mt-6 text-lg text-[var(--pearl-dim)] max-w-md">
              One unforgettable weekend bringing the whole family back together in Atlanta.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/interest-list" className="btn-primary">
                Join the Interest List
              </Link>
              <Link href="/reunion-details" className="btn-outline-clean">
                Reunion Details
              </Link>
            </div>
            <p className="mt-4 text-xs text-[var(--pearl-dim)]/70 max-w-sm">
              No payment required at this stage &mdash; joining the list simply helps us plan lodging, activities, and reunion apparel.
            </p>
          </div>

          <div className="min-w-0 flex flex-wrap lg:flex-nowrap lg:flex-col gap-x-8 gap-y-6 lg:gap-7 lg:items-end lg:text-right">
            <div>
              <span className="tag-label">WHEN</span>
              <p className="text-xl sm:text-2xl font-bold text-white mt-1.5">Sept 3&#8211;5</p>
              <p className="text-sm text-[var(--pearl-dim)]">2027</p>
            </div>
            <div>
              <span className="tag-label">WHERE</span>
              <p className="text-xl sm:text-2xl font-bold text-white mt-1.5">Atlanta, GA</p>
            </div>
            <Countdown variant="minimal" />
          </div>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-6 right-2 sm:right-6 lg:right-10 font-black text-white/[0.06] leading-none select-none text-[6rem] sm:text-[10rem] lg:text-[13rem]"
        >
          2027
        </div>
      </section>

      {/* Save the Date artwork */}
      <section className="mx-auto max-w-5xl px-5 py-20 grid md:grid-cols-2 gap-10 items-center">
        <div className="border border-white/10 rounded-lg overflow-hidden">
          <Image
            src="/images/save-the-date.png"
            alt="Save the Date — Russell–Sharp Family Reunion, Atlanta, Georgia, September 3–5, 2027"
            width={1080}
            height={1080}
            className="w-full h-auto"
          />
        </div>
        <div>
          <p className="tag-label mb-4">SAVE THE DATE</p>
          <h2 className="font-black text-3xl sm:text-4xl text-white leading-tight">
            Good Family. Great Memories. Lasting Legacy.
          </h2>
          <p className="mt-4 text-[var(--pearl-dim)]">
            The Russell and Sharp branches are coming together for a full weekend in Atlanta &mdash; reconnecting,
            celebrating, and making new memories that carry the family forward.
          </p>
          <Link href="/interest-list" className="btn-primary mt-6 inline-flex">
            Join the Interest List
          </Link>
        </div>
      </section>

      <div className="h-px bg-white/10 max-w-5xl mx-auto" />

      {/* Section overview */}
      <section className="mx-auto max-w-3xl px-5 py-20">
        <h2 className="font-black text-center text-white text-2xl sm:text-3xl mb-2">
          Find Your Way Around
        </h2>
        <p className="text-center text-[var(--pearl-dim)] mb-12 max-w-lg mx-auto">
          The site will grow with the reunion &mdash; here&apos;s what&apos;s here now.
        </p>

        <div className="space-y-10">
          <div>
            <p className="text-xs tracking-[0.15em] text-[var(--accent-bright)] font-semibold mb-4">REUNION 2027</p>
            <SectionGrid items={REUNION_SECTIONS} />
          </div>
          <div className="h-px bg-white/10" />
          <div>
            <p className="text-xs tracking-[0.15em] text-[var(--accent-bright)] font-semibold mb-4">FAMILY</p>
            <SectionGrid items={FAMILY_SECTIONS} />
          </div>
        </div>
      </section>

      <div className="h-px bg-white/10 max-w-3xl mx-auto" />

      {/* Timeline preview */}
      <section className="mx-auto max-w-3xl px-5 py-20">
        <h2 className="font-black text-center text-white text-2xl sm:text-3xl mb-10">
          Planning Timeline
        </h2>
        <ol className="space-y-6">
          {TIMELINE.map((t, i) => (
            <li key={i} className="flex gap-4">
              <div className="flex flex-col items-center pt-1">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                {i < TIMELINE.length - 1 && <span className="w-px flex-1 bg-white/15 mt-2" />}
              </div>
              <div className="pb-2">
                <p className="text-xs tracking-wide text-[var(--accent-bright)] font-semibold">{t.when}</p>
                <p className="font-semibold text-[var(--pearl)] mt-1">{t.title}</p>
                <p className="text-sm text-[var(--pearl-dim)] mt-1">{t.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="text-center mt-10">
          <Link href="/payments" className="btn-outline-clean text-sm">
            View Full Timeline & Payment Schedule
          </Link>
        </div>
      </section>
    </div>
  );
}
