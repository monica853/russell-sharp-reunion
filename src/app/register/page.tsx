import Link from "next/link";
import PageHero from "@/components/PageHero";
import RegisterForm from "@/components/RegisterForm";
import { CURRENT_PHASE } from "@/lib/config";
import { REGISTRATION_RATES } from "@/lib/timeline";

export const metadata = {
  title: "Register Your Household | Russell–Sharp Reunion 2027",
  description: "Registration fees, deposit information, and deadlines for the Russell–Sharp Family Reunion.",
};

export default function RegisterPage() {
  const isOpen = CURRENT_PHASE >= 2;

  return (
    <div>
      <PageHero
        eyebrow="Phase 2 · Registration & Deposit"
        title="Register Your Household"
        subtitle={
          isOpen
            ? "A $25 nonrefundable deposit reserves your household's place."
            : "Registration opens December 2026 – January 2027."
        }
      />

      <section className="mx-auto max-w-2xl px-5 py-16">
        <div className="mb-10">
          <p className="font-heading text-[var(--gold-bright)] tracking-wide mb-3">Registration Fees</p>
          <div className="card-plaque overflow-hidden">
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
        </div>

        {isOpen ? (
          <RegisterForm />
        ) : (
          <div className="card-plaque p-8 text-center space-y-4">
            <p className="font-heading text-[var(--gold-bright)] text-xl">Registration isn&apos;t open yet</p>
            <p className="text-[var(--pearl-dim)]">
              Registration opens December 2026&#8211;January 2027 with a $25 household deposit, applied to your
              total registration cost. In the meantime, join the interest list so we can plan ahead for your
              household.
            </p>
            <Link href="/interest-list" className="btn-deco inline-block">
              Join the Interest List
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
