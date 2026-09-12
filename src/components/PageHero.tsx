export default function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="relative border-b border-[var(--gold)]/25 bg-gradient-to-b from-[var(--oxblood-deep)]/30 to-transparent">
      <div className="mx-auto max-w-4xl px-5 py-16 sm:py-20 text-center">
        {eyebrow && (
          <p className="font-heading text-[var(--gold)] text-xs tracking-[0.25em] mb-3">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-4xl sm:text-5xl text-[var(--gold-bright)] leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 text-[var(--pearl-dim)] text-base sm:text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
        <div className="deco-rule mt-8 max-w-xs mx-auto" />
      </div>
    </section>
  );
}
