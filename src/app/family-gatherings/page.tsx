import Link from "next/link";
import PageHero from "@/components/PageHero";
import { getSheetValues } from "@/lib/googleSheets";
import { GATHERINGS_TAB } from "@/lib/sheetsSchema";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Family Gatherings | Russell–Sharp Family",
  description: "Family-hosted celebrations, outings, and trips throughout the year — beyond the annual reunion.",
};

type Gathering = {
  eventName: string;
  hostName: string;
  dateTime: string;
  location: string;
  description: string;
  invited: string;
  cost: string;
  rsvpDeadline: string;
  rsvpContact: string;
};

async function getApprovedGatherings(): Promise<Gathering[]> {
  try {
    const rows = await getSheetValues(GATHERINGS_TAB);
    return rows
      .slice(1)
      .filter((r) => String(r[10] ?? "").trim().toLowerCase() === "approved")
      .map((r) => ({
        eventName: String(r[1] ?? ""),
        hostName: String(r[2] ?? ""),
        dateTime: String(r[3] ?? ""),
        location: String(r[4] ?? ""),
        description: String(r[5] ?? ""),
        invited: String(r[6] ?? ""),
        cost: String(r[7] ?? ""),
        rsvpDeadline: String(r[8] ?? ""),
        rsvpContact: String(r[9] ?? ""),
      }));
  } catch (err) {
    console.error("Could not load Family Gatherings:", err);
    return [];
  }
}

export default async function FamilyGatheringsPage() {
  const events = await getApprovedGatherings();

  return (
    <div>
      <PageHero
        eyebrow="Beyond the Reunion"
        title="Family Gatherings"
        subtitle="Staying connected goes beyond our annual reunion. Discover family-hosted celebrations, outings, trips, and other opportunities to spend time together throughout the year."
      />

      <section className="mx-auto max-w-3xl px-5 py-16">
        <div className="text-center mb-12">
          <Link href="/family-gatherings/submit" className="btn-deco">
            Submit a Family Event
          </Link>
          <p className="text-xs text-[var(--pearl-dim)]/70 mt-3">
            Submissions are reviewed before appearing here.
          </p>
        </div>

        {events.length === 0 ? (
          <p className="text-center text-[var(--pearl-dim)] card-plaque p-8">
            No gatherings posted yet &mdash; be the first to share one!
          </p>
        ) : (
          <div className="space-y-6">
            {events.map((ev, i) => (
              <div key={i} className="card-plaque p-6 sm:p-8">
                <p className="font-heading text-[var(--gold-bright)] text-xl">{ev.eventName}</p>
                <p className="text-sm text-[var(--pearl-dim)] mt-1">Hosted by {ev.hostName}</p>

                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mt-4 text-sm text-[var(--pearl-dim)]">
                  <p><span className="text-[var(--gold)]">When:</span> {ev.dateTime}</p>
                  <p><span className="text-[var(--gold)]">Where:</span> {ev.location}</p>
                  {ev.invited && <p><span className="text-[var(--gold)]">Who&apos;s invited:</span> {ev.invited}</p>}
                  {ev.cost && <p><span className="text-[var(--gold)]">Cost:</span> {ev.cost}</p>}
                  {ev.rsvpDeadline && <p><span className="text-[var(--gold)]">RSVP by:</span> {ev.rsvpDeadline}</p>}
                </div>

                {ev.description && (
                  <p className="text-sm text-[var(--pearl-dim)] mt-4 leading-relaxed">{ev.description}</p>
                )}

                <div className="deco-rule my-4" />
                <p className="text-sm">
                  <span className="text-[var(--gold-bright)] font-heading">RSVP / Contact: </span>
                  <span className="text-[var(--pearl-dim)]">{ev.rsvpContact}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
