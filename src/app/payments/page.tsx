import Link from "next/link";
import PageHero from "@/components/PageHero";
import { TIMELINE, REGISTRATION_RATES } from "@/lib/timeline";

export const metadata = {
  title: "Registration Timeline | Russell–Sharp Reunion 2027",
  description: "The full planning timeline, registration fees, and payment deadlines for the Russell–Sharp Family Reunion.",
};

export default function PaymentsPage() {
  return (
    <div>
      <PageHero
        eyebrow="Plan Ahead"
        title="Payments & Timeline"
        subtitle="Planning ahead makes it easier for everyone to prepare for the Russell–Sharp Family Reunion."
      />

      <section className="mx-auto max-w-3xl px-5 py-16 space-y-14">
        <div>
          <p className="font-heading text-[var(--gold-bright)] tracking-wide mb-6 text-center">
            Registration Timeline
          </p>
          <ol className="space-y-6">
            {TIMELINE.map((t, i) => (
              <li key={i} className="flex gap-4">
                <div className="flex flex-col items-center pt-1">
                  <span className="deco-diamond" />
                  {i < TIMELINE.length - 1 && <span className="w-px flex-1 bg-[var(--gold)]/30 mt-2" />}
                </div>
                <div className="pb-2">
                  <p className="text-xs tracking-wide text-[var(--gold)] font-heading">{t.when}</p>
                  <p className="font-heading text-[var(--pearl)] mt-1">{t.title}</p>
                  <p className="text-sm text-[var(--pearl-dim)] mt-1">{t.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <p className="font-heading text-[var(--gold-bright)] tracking-wide mb-4 text-center">
            Registration Fees by Age
          </p>
          <div className="card-plaque overflow-hidden max-w-md mx-auto">
            <table className="w-full text-sm">
              <tbody>
                {REGISTRATION_RATES.map((r, i) => (
                  <tr key={r.group} className={i !== 0 ? "border-t border-[var(--gold)]/20" : ""}>
                    <td className="px-4 py-3 text-[var(--pearl-dim)]">{r.group}</td>
                    <td className="px-4 py-3 text-right text-[var(--gold-bright)] font-heading">{r.fee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center text-xs text-[var(--pearl-dim)]/70 mt-4 max-w-md mx-auto">
            The $25 household deposit is applied to your total registration cost. Your household balance
            automatically reflects the deposit and any payments already made.
          </p>
        </div>

        <div className="text-center">
          <Link href="/register" className="btn-deco">
            Register Your Household
          </Link>
        </div>
      </section>
    </div>
  );
}
