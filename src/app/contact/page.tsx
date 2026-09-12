import PageHero from "@/components/PageHero";
import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <div>
      <PageHero eyebrow="Get In Touch" title="Contact" />
      <section className="mx-auto max-w-lg px-5 py-16">
        <ContactForm />
      </section>
    </div>
  );
}
