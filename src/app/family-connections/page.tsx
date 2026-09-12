import PageHero from "@/components/PageHero";
import { getSheetValues } from "@/lib/googleSheets";
import { CONNECTIONS_TAB } from "@/lib/sheetsSchema";

export const dynamic = "force-dynamic";

type Connection = {
  businessName: string;
  ownerName: string;
  category: string;
  description: string;
  website: string;
  phone: string;
  email: string;
};

async function getVisibleConnections(): Promise<Connection[]> {
  try {
    const rows = await getSheetValues(CONNECTIONS_TAB);
    return rows
      .slice(1)
      .filter((r) => String(r[8] ?? "").trim().toUpperCase() === "TRUE")
      .map((r) => ({
        businessName: String(r[1] ?? ""),
        ownerName: String(r[2] ?? ""),
        category: String(r[3] ?? ""),
        description: String(r[4] ?? ""),
        website: String(r[5] ?? ""),
        phone: String(r[6] ?? ""),
        email: String(r[7] ?? ""),
      }));
  } catch (err) {
    console.error("Could not load Family Connections:", err);
    return [];
  }
}

export default async function FamilyConnectionsPage() {
  const connections = await getVisibleConnections();

  return (
    <div>
      <PageHero
        eyebrow="Support One Another"
        title="Family Connections"
        subtitle="Discover businesses, services, and projects offered by members of the Russell–Sharp family. This page gives us an opportunity to connect, share resources, and support one another."
      />

      <section className="mx-auto max-w-3xl px-5 py-16">
        {connections.length === 0 ? (
          <div className="card-plaque p-8 text-center space-y-3">
            <p className="text-[var(--pearl-dim)]">
              Nothing listed here yet. If you&apos;d like your business, service, or project featured, reach out
              through the Contact page.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {connections.map((c, i) => (
              <div key={i} className="card-plaque p-6">
                <p className="font-heading text-[var(--gold-bright)] text-lg">{c.businessName}</p>
                {c.ownerName && <p className="text-sm text-[var(--pearl-dim)] mt-1">{c.ownerName}</p>}
                {c.category && (
                  <p className="text-xs tracking-wide text-[var(--gold)] font-heading mt-2">{c.category}</p>
                )}
                {c.description && (
                  <p className="text-sm text-[var(--pearl-dim)] mt-3 leading-relaxed">{c.description}</p>
                )}
                <div className="deco-rule my-3" />
                <div className="text-sm space-y-1 text-[var(--pearl-dim)]">
                  {c.website && (
                    <p>
                      <a
                        href={c.website.startsWith("http") ? c.website : `https://${c.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--gold-bright)] hover:underline"
                      >
                        {c.website}
                      </a>
                    </p>
                  )}
                  {c.phone && <p>{c.phone}</p>}
                  {c.email && <p>{c.email}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
