import Link from "next/link";
import PageHero from "@/components/PageHero";

export default function FamilyDirectoryPage() {
  return (
    <div>
      <PageHero
        eyebrow="Two Branches, One Family"
        title="Family Directory"
        subtitle="A growing directory of the Russell and Sharp family branches."
      />

      <section className="mx-auto max-w-3xl px-5 py-16 space-y-8">
        <div className="card-plaque p-8 text-center">
          <p className="font-heading text-[var(--gold-bright)] text-lg mb-3">Coming as families join the list</p>
          <p className="text-[var(--pearl-dim)] leading-relaxed max-w-xl mx-auto">
            As families join the interest list and register, we&apos;ll build out a directory here organized by
            branch &mdash; Russell and Sharp &mdash; so cousins old and new can find each other before September 2027.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div className="card-plaque p-6 text-center">
            <p className="font-heading text-[var(--gold-bright)] text-xl">Russell Branch</p>
            <p className="text-sm text-[var(--pearl-dim)] mt-2">Family list forthcoming</p>
          </div>
          <div className="card-plaque p-6 text-center">
            <p className="font-heading text-[var(--gold-bright)] text-xl">Sharp Branch</p>
            <p className="text-sm text-[var(--pearl-dim)] mt-2">Family list forthcoming</p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/interest-list" className="btn-deco-outline">
            Add Your Household to the List
          </Link>
        </div>
      </section>
    </div>
  );
}
