import PageHero from "@/components/PageHero";
import { HOTEL } from "@/lib/config";

export const metadata = {
  title: "Hotel & Travel | Russell–Sharp Reunion 2027",
  description: "Where to stay and how to get there for the Russell–Sharp Family Reunion in Atlanta, Georgia.",
};

const PLANNED_DETAILS = [
  "Family reunion group rate",
  "Reservation deadline",
  "Booking link or group code",
  "Check-in and checkout times",
  "Parking information",
  "Breakfast and amenities",
  "Distance from reunion activities",
  "Room types",
  "Cancellation policy",
];

export default function HotelTravelPage() {
  return (
    <div>
      <PageHero eyebrow="Where to Stay" title="Hotel & Travel" />

      <section className="mx-auto max-w-3xl px-5 py-16 space-y-10">
        <div className="card-plaque p-6 sm:p-8">
          <p className="font-heading text-[var(--gold-bright)] text-xl mb-1">{HOTEL.name}</p>
          <p className="text-[var(--pearl-dim)] text-sm">
            {HOTEL.address}
            <br />
            {HOTEL.cityStateZip}
          </p>
        </div>

        <div className="card-plaque p-6 sm:p-8">
          <p className="text-[var(--pearl-dim)] leading-relaxed">
            {HOTEL.name} is the planned host hotel for the Russell&#8211;Sharp Family Reunion. Group rates and
            reservation instructions will be announced once arrangements are finalized. Please indicate your
            lodging needs on the interest form.
          </p>
        </div>

        <div>
          <p className="font-heading text-[var(--gold-bright)] tracking-wide mb-3">Coming to this page</p>
          <ul className="grid sm:grid-cols-2 gap-3 text-sm text-[var(--pearl-dim)]">
            {PLANNED_DETAILS.map((d) => (
              <li key={d} className="card-plaque p-4">
                {d}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
