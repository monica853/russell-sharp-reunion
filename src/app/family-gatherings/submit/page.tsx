import PageHero from "@/components/PageHero";
import SubmitGatheringForm from "@/components/SubmitGatheringForm";

export const metadata = {
  title: "Submit a Family Event | Russell–Sharp Family",
  description: "Share a family-hosted event, celebration, or outing for the Family Gatherings page.",
};

export default function SubmitGatheringPage() {
  return (
    <div>
      <PageHero eyebrow="Family Gatherings" title="Submit a Family Event" />
      <section className="mx-auto max-w-2xl px-5 py-16">
        <SubmitGatheringForm />
      </section>
    </div>
  );
}
