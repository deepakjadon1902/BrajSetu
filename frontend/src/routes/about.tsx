import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin, MessageCircle, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SmartImage } from "@/components/SmartImage";
import heroHouse from "@/assets/hero-house.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us | Braj Setu Properties" },
      {
        name: "description",
        content:
          "Braj Setu Properties connects buyers, tenants and owners across Vrindavan, Mathura, Govardhan, Barsana and nearby Braj Mandal towns.",
      },
    ],
  }),
  component: AboutPage,
});
function AboutPage() {
  return (
    <div>
      <PageHeader
        eyebrow="About Braj Setu"
        title="Local knowledge. Clear conversations."
        description="We connect buyers, tenants and property owners across Braj Mandal, with a simple way to browse listings and reach our team."
      />
      <section className="pv-container pv-section grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-14">
        <div>
          <h2 className="text-2xl font-semibold text-navy sm:text-3xl">
            Helping you find a place in Braj.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Braj Setu Properties is a property unit of Vrindavan Sarthi Enterprises. We serve
            Vrindavan, Mathura, Govardhan, Barsana and nearby towns and villages.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Whether you are searching for a home, a plot or a commercial space, you can compare
            listing details and contact us to discuss your requirements.
          </p>
          <Link to="/contact" className="pv-button-primary mt-6 gap-2">
            Meet our team <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <SmartImage
          src={heroHouse}
          alt="A contemporary home with a garden"
          aspect="aspect-[4/3]"
          wrapperClassName="rounded-2xl"
        />
      </section>
      <section className="border-y border-border bg-smoke">
        <div className="pv-container pv-section">
          <h2 className="text-2xl font-semibold text-navy sm:text-3xl">What you can expect</h2>
          <div className="mt-7 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: MapPin,
                title: "A local focus",
                text: "Listings and property support across Braj, with attention to your preferred location and budget.",
              },
              {
                icon: MessageCircle,
                title: "Simple communication",
                text: "Clear property details and a direct way to ask questions or arrange the next step.",
              },
              {
                icon: ShieldCheck,
                title: "Visible review status",
                text: "Verification badges describe the checks recorded for a listing. They do not replace independent document checks.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <article key={title} className="pv-panel p-5 sm:p-6">
                <Icon className="h-6 w-6 text-gold-deep" />
                <h3 className="mt-5 text-lg font-semibold text-navy">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="pv-container flex flex-col items-start justify-between gap-6 py-10 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold text-navy">Let us know what you are looking for.</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Buying, renting or listing a property starts with a conversation.
          </p>
        </div>
        <Link to="/contact" className="pv-button-primary">
          Contact us
        </Link>
      </section>
    </div>
  );
}
