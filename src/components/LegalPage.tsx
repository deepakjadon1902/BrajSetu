interface LegalSection {
  heading: string;
  body: string[];
}

interface LegalPageProps {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

export function LegalPage({ title, updated, intro, sections }: LegalPageProps) {
  return (
    <div className="bg-background">
      <div className="border-b border-border bg-ice">
        <div className="pv-container py-14 sm:py-20">
          <p className="text-xs font-semibold tracking-widest text-gold-deep uppercase">Legal</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-navy sm:text-5xl">
            {title}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated {updated}</p>
        </div>
      </div>

      <article className="pv-container max-w-3xl py-12 sm:py-16">
        <p className="text-base leading-relaxed text-navy-soft">{intro}</p>
        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-bold text-navy">{section.heading}</h2>
              <div className="mt-3 space-y-4">
                {section.body.map((paragraph, i) => (
                  <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}
