import PageHero from "@/components/PageHero";

export const metadata = {
  title: "Schedule | Russell–Sharp Reunion 2027",
  description: "The weekend schedule for the Russell–Sharp Family Reunion, September 3–5, 2027.",
};

const DAYS = [
  { label: "Friday, September 3", note: "Arrivals & welcome" },
  { label: "Saturday, September 4", note: "Main reunion day" },
  { label: "Sunday, September 5", note: "Farewell & departures" },
];

export default function SchedulePage() {
  return (
    <div>
      <PageHero
        eyebrow="Weekend of September 3–5, 2027"
        title="Schedule"
        subtitle="Activities will be added here as plans are confirmed."
      />

      <section className="mx-auto max-w-3xl px-5 py-16 space-y-6">
        {DAYS.map((d) => (
          <div key={d.label} className="card-plaque p-6 flex items-center justify-between">
            <div>
              <p className="font-heading text-[var(--gold-bright)]">{d.label}</p>
              <p className="text-sm text-[var(--pearl-dim)] mt-1">{d.note}</p>
            </div>
            <span className="text-xs tracking-wide text-[var(--pearl-dim)]/60 font-heading">TBA</span>
          </div>
        ))}

        <p className="text-center text-sm text-[var(--pearl-dim)] pt-4">
          The full weekend itinerary, event locations, and what to wear for each event will be released
          July&#8211;August 2027, closer to the reunion.
        </p>
      </section>
    </div>
  );
}
