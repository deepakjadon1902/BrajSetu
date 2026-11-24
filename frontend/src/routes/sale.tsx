import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Camera, ClipboardCheck, FileText } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SmartImage } from "@/components/SmartImage";
import sellHome from "@/assets/sell-home.jpg";

export const Route = createFileRoute("/sale")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? search["q"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sell or Rent Out Your Property | Braj Setu Properties" },
      {
        name: "description",
        content:
          "Share your property details with Braj Setu Properties. Learn how to submit a listing for review and reach interested buyers or tenants in Braj.",
      },
    ],
  }),
  component: SalePage,
});
function SalePage() {
  return (
    <div>
      <PageHeader
        eyebrow="For property owners"
        title="Make your next move simple."
        description="Sell or rent out a flat, house, plot, shop or farm house in Braj. Start with the details; our team will help you with the next step."
      >
        <div className="flex flex-wrap gap-3">
          <Link to="/list-property" className="pv-button-primary gap-2">
            List your property <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/contact" className="pv-button-secondary">
            Speak to our team
          </Link>
        </div>
      </PageHeader>
      <section className="pv-container pv-section">
        <h2 className="text-2xl font-semibold text-navy sm:text-3xl">Three steps to get started</h2>
        <div className="mt-7 grid gap-5 md:grid-cols-3">
          {[
            {
              icon: FileText,
              title: "1. Share the details",
              text: "Add the property type, location, area, asking price and your contact details.",
            },
            {
              icon: Camera,
              title: "2. Add clear photos",
              text: "Use recent photos you have permission to share. Include a helpful description of the space.",
            },
            {
              icon: ClipboardCheck,
              title: "3. Submit for review",
              text: "Our team reviews the information and may contact you for corrections before publishing.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-xl border border-border bg-card p-6">
              <Icon className="h-6 w-6 text-gold-deep" />
              <h3 className="mt-5 text-lg font-semibold text-navy">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="border-y border-border bg-smoke">
        <div className="pv-container pv-section grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-14">
          <SmartImage
            src={sellHome}
            alt="Bright kitchen and dining space"
            aspect="aspect-[4/3]"
            wrapperClassName="rounded-2xl"
          />
          <div>
            <h2 className="text-2xl font-semibold text-navy sm:text-3xl">
              A clear listing starts with clear information.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Confirm that you are the owner or have permission to list the property. Share the
              current price, availability and any known restrictions or disputes.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              A listing does not guarantee a sale or rental. Fees and service terms, where
              applicable, should be agreed separately before work begins.
            </p>
            <Link to="/list-property" className="pv-button-primary mt-7">
              Start your listing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
