import PageHero from "@/components/PageHero";
import InterestForm from "@/components/InterestForm";

export default function InterestListPage() {
  return (
    <div>
      <PageHero
        eyebrow="Phase 1 · September – December 2026"
        title="Join the Interest List"
        subtitle="Help us plan lodging, activities, transportation, meals, and reunion apparel."
      />

      <section className="mx-auto max-w-2xl px-5 py-16">
        <p className="card-plaque p-5 text-sm text-[var(--pearl-dim)] mb-10">
          Joining the interest list helps us plan lodging, activities, transportation, meals, and reunion apparel.
          It does not complete your official registration &mdash; registration opens in a later phase, and we&apos;ll
          let you know as soon as it does.
        </p>
        <InterestForm />
      </section>
    </div>
  );
}
