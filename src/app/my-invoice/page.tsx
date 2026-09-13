import PageHero from "@/components/PageHero";
import MyInvoiceClient from "@/components/MyInvoiceClient";

export const metadata = {
  title: "My Invoice | Russell–Sharp Family",
  description: "Check your household's registration balance and payments on file.",
};

export default function MyInvoicePage() {
  return (
    <div>
      <PageHero eyebrow="Your Household" title="My Invoice" subtitle="Check your balance and payments on file." />
      <MyInvoiceClient />
    </div>
  );
}
