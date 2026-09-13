import PageHero from "@/components/PageHero";
import SubmitConnectionForm from "@/components/SubmitConnectionForm";

export const metadata = {
  title: "Submit a Family Connection | Russell–Sharp Family",
  description: "Share your business, service, or project with the Russell–Sharp family.",
};

export default function SubmitConnectionPage() {
  return (
    <div>
      <PageHero eyebrow="Family Connections" title="Submit a Family Connection" />
      <section className="mx-auto max-w-2xl px-5 py-16">
        <SubmitConnectionForm />
      </section>
    </div>
  );
}
