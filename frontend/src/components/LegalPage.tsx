import { Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/BrandLogo";

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
    <div className="bg-[linear-gradient(180deg,#fffaf0_0%,#f7f4ee_42%,#ffffff_100%)]">
      <div className="relative overflow-hidden border-b border-gold/20 bg-[linear-gradient(135deg,#0b1b34_0%,#182d52_52%,#3d2c66_100%)] text-background">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(201,161,53,0.24),transparent_28%),radial-gradient(circle_at_80%_78%,rgba(255,255,255,0.12),transparent_26%)]" />
        <div className="pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 opacity-[0.045] md:block">
          <BrandLogo className="[&_img]:h-72 [&_img]:max-w-none" />
        </div>
        <div className="pv-container relative py-14 sm:py-20">
          <Link
            to="/"
            className="inline-flex h-16 w-40 items-center justify-center rounded-full border border-gold/30 bg-background px-4 shadow-[0_22px_50px_-32px_rgba(255,250,240,0.8)]"
          >
            <BrandLogo compact />
          </Link>
          <p className="mt-8 text-xs font-black tracking-[0.22em] text-gold uppercase">
            Braj Setu Properties
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-extrabold tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-sm text-background/70">Last updated {updated}</p>
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-background/80">{intro}</p>
        </div>
      </div>

      <article className="pv-container max-w-4xl py-10 sm:py-14">
        <div className="overflow-hidden rounded-[1.5rem] border border-gold/20 bg-card shadow-[0_30px_90px_-46px_rgba(18,35,63,0.45)]">
          {sections.map((section) => (
            <section
              key={section.heading}
              className="border-b border-border p-6 last:border-b-0 sm:p-8"
            >
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
