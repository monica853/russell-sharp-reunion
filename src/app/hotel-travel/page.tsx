import PageHero from "@/components/PageHero";
import { HOTEL } from "@/lib/config";

export const metadata = {
  title: "Hotel & Travel | Russell–Sharp Reunion 2027",
  description: "Where to stay and how to get there for the Russell–Sharp Family Reunion in Atlanta, Georgia.",
};

const STILL_TO_COME = ["Distance from reunion activities", "Cancellation policy"];

const ROOM_TYPES = [
  {
    name: "One King Bed",
    details: ["Maximum occupancy: 2", "1 King bed", "Rollaway beds not permitted", "Cribs permitted: 1", "Duvet"],
  },
  {
    name: "Two Queen Beds",
    details: ["Maximum occupancy: 4", "2 Queen beds", "Rollaway beds not permitted", "Cribs permitted: 1", "Duvet"],
  },
];

const AMENITIES = ["Wireless internet, complimentary", "Mini fridge"];

export default function HotelTravelPage() {
  return (
    <div>
      <PageHero eyebrow="Where to Stay" title="Hotel & Travel" subtitle="Our family reunion group rate is open for booking." />

      <section className="mx-auto max-w-3xl px-5 py-16 space-y-10">
        <div className="card-plaque p-6 sm:p-8">
          <p className="tag-label mb-3">Group Rate</p>
          <p className="font-heading text-[var(--gold-bright)] text-xl mb-1">{HOTEL.name}</p>
          <p className="text-[var(--pearl-dim)] text-sm mb-5">
            {HOTEL.address}
            <br />
            {HOTEL.cityStateZip}
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs tracking-wide text-[var(--gold)] font-semibold">GROUP RATE</p>
              <p className="text-[var(--pearl)] font-semibold">{HOTEL.groupRate}</p>
            </div>
            <div>
              <p className="text-xs tracking-wide text-[var(--gold)] font-semibold">BOOK BY</p>
              <p className="text-[var(--pearl)] font-semibold">{HOTEL.bookByDate}</p>
            </div>
          </div>

          <a href={HOTEL.bookingUrl} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex">
            Book Your Group Rate
          </a>
        </div>

        <div className="card-plaque p-6 sm:p-8">
          <p className="text-[var(--pearl-dim)] leading-relaxed">
            Book directly through the link above to get the Russell&#8211;Sharp Family Reunion group rate. Reservations
            made after {HOTEL.bookByDate} are not guaranteed the group rate or room availability, so we recommend
            booking early.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="card-plaque p-6">
            <p className="text-xs tracking-wide text-[var(--gold)] font-semibold mb-2">CHECK-IN</p>
            <p className="text-[var(--pearl)] font-semibold text-lg">3:00 PM</p>
          </div>
          <div className="card-plaque p-6">
            <p className="text-xs tracking-wide text-[var(--gold)] font-semibold mb-2">CHECK-OUT</p>
            <p className="text-[var(--pearl)] font-semibold text-lg">12:00 PM</p>
          </div>
          <div className="card-plaque p-6 sm:col-span-2">
            <p className="text-xs tracking-wide text-[var(--gold)] font-semibold mb-2">PARKING</p>
            <p className="text-[var(--pearl)] font-semibold">On-site parking &mdash; $9.00 per day</p>
          </div>
        </div>

        <div>
          <p className="font-heading text-[var(--gold-bright)] tracking-wide mb-3">Room Types</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {ROOM_TYPES.map((room) => (
              <div key={room.name} className="card-plaque p-6">
                <p className="text-[var(--pearl)] font-semibold mb-3">{room.name}</p>
                <ul className="space-y-1.5 text-sm text-[var(--pearl-dim)]">
                  {room.details.map((d) => (
                    <li key={d}>&bull; {d}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="font-heading text-[var(--gold-bright)] tracking-wide mb-3">Amenities</p>
          <ul className="grid sm:grid-cols-2 gap-3 text-sm text-[var(--pearl-dim)]">
            {AMENITIES.map((a) => (
              <li key={a} className="card-plaque p-4">
                {a}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-heading text-[var(--gold-bright)] tracking-wide mb-3">Still to come on this page</p>
          <ul className="grid sm:grid-cols-2 gap-3 text-sm text-[var(--pearl-dim)]">
            {STILL_TO_COME.map((d) => (
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
