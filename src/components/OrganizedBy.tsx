import Image from "next/image";
import { User } from "lucide-react";

type Organizer = {
  name: string;
  role: string;
  photo?: string;
  link?: string;
};

const ORGANIZERS: Organizer[] = [
  {
    name: "Glenda Shaw",
    role: "Lead Organizer",
    photo: "/images/organizers/glenda-shaw.jpg",
    link: "https://www.facebook.com/glenda.1.shaw",
  },
  { name: "Organizer", role: "Open Spot" },
  { name: "Organizer", role: "Open Spot" },
  { name: "Organizer", role: "Open Spot" },
  { name: "Organizer", role: "Open Spot" },
];

function OrganizerCard({ organizer }: { organizer: Organizer }) {
  const content = (
    <div className="flex flex-col items-center gap-3 text-center w-32">
      {organizer.photo ? (
        <div className="w-24 h-24 rounded-full overflow-hidden border-[3px] border-[var(--gold)]">
          <Image src={organizer.photo} alt={organizer.name} width={96} height={96} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-24 h-24 rounded-full border-[3px] border-dashed border-[var(--gold-dark)] flex items-center justify-center">
          <User className="w-8 h-8 text-[var(--muted)]" strokeWidth={1.5} />
        </div>
      )}
      <div>
        <p className="text-base font-semibold text-[var(--pearl)] leading-tight">{organizer.name}</p>
        <p className="text-sm text-[var(--muted)] leading-tight">{organizer.role}</p>
      </div>
    </div>
  );

  if (organizer.link) {
    return (
      <a href={organizer.link} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
        {content}
      </a>
    );
  }
  return content;
}

export default function OrganizedBy() {
  return (
    <section className="border-y border-[var(--gold-dark)]/40 bg-[var(--ink-soft)]">
      <div className="mx-auto max-w-4xl px-5 py-10">
        <p className="text-center text-xs tracking-[0.2em] text-[var(--gold)] font-semibold mb-8">
          ORGANIZED BY
        </p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-8">
          {ORGANIZERS.map((o, i) => (
            <OrganizerCard key={i} organizer={o} />
          ))}
        </div>
      </div>
    </section>
  );
}
