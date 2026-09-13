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
  { name: "Linda Brooks", role: "Co-Chair", photo: "/images/organizers/linda-brooks.jpg" },
  { name: "Brittney Sharp", role: "Decorations & Theme", photo: "/images/organizers/brittney-sharp.jpg" },
  { name: "Venita Davis", role: "Family Memorabilia Coordinator", photo: "/images/organizers/venita-davis.jpg" },
  { name: "Nia Parker", role: "Events & Activities", photo: "/images/organizers/nia-parker.jpg" },
  { name: "Tori Shaw", role: "Events & Activities", photo: "/images/organizers/tori-shaw.jpg" },
  { name: "Hollis Smith", role: "Events & Activities", photo: "/images/organizers/hollis-smith.jpg" },
  { name: "Madison Jefferson", role: "Youth & Family Fun", photo: "/images/organizers/madison-jefferson.jpg" },
  { name: "Janeka Mearon", role: "Hotel & Hospitality", photo: "/images/organizers/janeka-mearon.jpg" },
  { name: "David Brown", role: "Birmingham Team Coordinator", photo: "/images/organizers/david-brown.jpg" },
  { name: "Francona Ford", role: "Selma/Montgomery Coordinator", photo: "/images/organizers/francona-ford.jpg" },
  { name: "Beverly \"Blondi\" Craig", role: "Summerfield Team Coordinator", photo: "/images/organizers/beverly-blondi-craig.jpg" },
  { name: "Jonathan Dickerson", role: "Family History & Legacy / Mobile Coordinator", photo: "/images/organizers/jonathan-dickerson.jpg" },
  { name: "Monica Russell", role: "Treasurer & Registration", photo: "/images/organizers/monica-russell.jpg" },
];

function OrganizerCard({ organizer }: { organizer: Organizer }) {
  const content = (
    <div className="flex flex-col items-center gap-2 text-center w-20">
      {organizer.photo ? (
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--gold)]">
          <Image src={organizer.photo} alt={organizer.name} width={64} height={64} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-16 h-16 rounded-full border-2 border-dashed border-[var(--gold-dark)] flex items-center justify-center">
          <User className="w-6 h-6 text-[var(--muted)]" strokeWidth={1.5} />
        </div>
      )}
      <div>
        <p className="text-xs font-semibold text-[var(--pearl)] leading-tight">{organizer.name}</p>
        <p className="text-[10px] text-[var(--muted)] leading-tight">{organizer.role}</p>
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
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-6">
          {ORGANIZERS.map((o, i) => (
            <OrganizerCard key={i} organizer={o} />
          ))}
        </div>
      </div>
    </section>
  );
}
