import { Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { useStore } from "@/lib/mock-store";

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
  const { settings } = useStore();
  return (
    <div>
      <PageHeader eyebrow="Legal information" title={title} description={intro}>
        <p className="text-xs text-muted-foreground">Last updated: {updated}</p>
      </PageHeader>
      <div className="pv-container grid items-start gap-8 py-8 sm:py-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
        <nav
          aria-label="On this page"
          className="rounded-xl border border-border bg-card p-5 lg:sticky lg:top-24"
        >
          <p className="text-sm font-semibold text-navy">On this page</p>
          <ol className="mt-3 space-y-1">
            {sections.map((section, index) => (
              <li key={section.heading}>
                <a
                  href={`#legal-section-${index + 1}`}
                  className="flex min-h-11 items-center text-sm text-muted-foreground hover:text-navy"
                >
                  {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <article className="min-w-0 max-w-3xl">
          {sections.map((section, index) => (
            <section
              id={`legal-section-${index + 1}`}
              key={section.heading}
              className="scroll-mt-24 border-b border-border py-6 first:pt-0"
            >
              <h2 className="text-xl font-semibold text-navy">{section.heading}</h2>
              <div className="mt-4 space-y-4">
                {section.body.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-sm leading-7 text-muted-foreground sm:text-base"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
          <div className="mt-8 rounded-xl border border-border bg-smoke p-5">
            <h2 className="text-base font-semibold text-navy">Questions or requests?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Email{" "}
              <a
                href={`mailto:${settings.contactEmail}`}
                className="break-all text-navy underline underline-offset-4"
              >
                {settings.contactEmail}
              </a>{" "}
              or{" "}
              <Link to="/contact" className="text-navy underline underline-offset-4">
                contact our team
              </Link>
              .
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
