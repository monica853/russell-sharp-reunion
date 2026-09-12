import PageHero from "@/components/PageHero";

const UPDATES = [
  {
    date: "Coming soon",
    title: "Welcome to the Russell–Sharp Reunion site",
    body: "We're kicking off planning for September 3–5, 2027 in Atlanta. Join the interest list to help us plan ahead — updates will be posted here as they happen.",
  },
];

export default function UpdatesPage() {
  return (
    <div>
      <PageHero eyebrow="Stay in the Loop" title="Family Updates" />

      <section className="mx-auto max-w-2xl px-5 py-16 space-y-6">
        {UPDATES.map((u, i) => (
          <div key={i} className="card-plaque p-6">
            <p className="text-xs tracking-wide text-[var(--gold)] font-heading">{u.date}</p>
            <p className="font-heading text-[var(--gold-bright)] text-lg mt-1">{u.title}</p>
            <p className="text-sm text-[var(--pearl-dim)] mt-2">{u.body}</p>
          </div>
        ))}
        <p className="text-center text-xs text-[var(--pearl-dim)]/70 pt-4">
          Registered families will also receive updates by email and text.
        </p>
      </section>
    </div>
  );
}
