import Link from "next/link";
import PageHero from "@/components/PageHero";

export default function ReunionDetailsPage() {
  return (
    <div>
      <PageHero
        eyebrow="Save the Date"
        title="Reunion Details"
        subtitle="September 3–5, 2027 · Atlanta, Georgia"
      />

      <section className="mx-auto max-w-3xl px-5 py-16 space-y-10">
        <div className="card-plaque p-6 sm:p-8">
          <p className="font-heading text-[var(--gold-bright)] tracking-wide mb-3">Why Atlanta</p>
          <p className="text-[var(--pearl-dim)] leading-relaxed">
            Same roots, new vibes &mdash; a family that roars together stays together. We&apos;re bringing the
            Russell&#8211;Sharp family to Atlanta, Georgia for a weekend of reconnection, celebration, and new
            memories, honoring family, culture, and legacy.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-5 text-center">
          <div className="card-plaque p-5">
            <p className="font-heading text-[var(--gold-bright)] text-lg">Dates</p>
            <p className="text-[var(--pearl-dim)] text-sm mt-2">September 3&#8211;5, 2027</p>
          </div>
          <div className="card-plaque p-5">
            <p className="font-heading text-[var(--gold-bright)] text-lg">Location</p>
            <p className="text-[var(--pearl-dim)] text-sm mt-2">Atlanta, Georgia</p>
          </div>
          <div className="card-plaque p-5">
            <p className="font-heading text-[var(--gold-bright)] text-lg">Theme</p>
            <p className="text-[var(--pearl-dim)] text-sm mt-2">Good Family &middot; Great Memories &middot; Lasting Legacy</p>
          </div>
        </div>

        <div>
          <p className="font-heading text-[var(--gold-bright)] tracking-wide mb-3">What to Expect</p>
          <ul className="grid sm:grid-cols-2 gap-3 text-sm text-[var(--pearl-dim)]">
            <li className="card-plaque p-4">Reconnect with family across the Russell and Sharp branches</li>
            <li className="card-plaque p-4">Celebrate together with Atlanta-inspired activities</li>
            <li className="card-plaque p-4">Make new memories across a full weekend</li>
            <li className="card-plaque p-4">More activities and locations announced as plans are confirmed</li>
          </ul>
        </div>

        <p className="text-center text-xs text-[var(--pearl-dim)]/70">
          Dates and planning details are subject to change. Registered families will receive updates by email and text.
        </p>

        <div className="text-center">
          <Link href="/interest-list" className="btn-deco">
            Join the Interest List
          </Link>
        </div>
      </section>
    </div>
  );
}
