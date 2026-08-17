import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, HandshakeIcon, ShieldCheck, Users } from "lucide-react";
import { SmartImage } from "@/components/SmartImage";
import heroHouse from "@/assets/hero-house.jpg";
import sellHome from "@/assets/sell-home.jpg";
import agents from "@/assets/tile-agents.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About PropVista | Boutique Property Consultancy" },
      {
        name: "description",
        content:
          "PropVista is a boutique property consultancy pairing verified listings with advisors who visit every home before it is published.",
      },
      { property: "og:title", content: "About PropVista | Boutique Property Consultancy" },
      {
        property: "og:description",
        content: "Meet the advisory team behind PropVista and how we verify every listing.",
      },
    ],
  }),
  component: AboutPage,
});

const values = [
  {
    icon: ShieldCheck,
    title: "Verified before published",
    body: "Every listing is visited, photographed and title-checked by our own team — no syndicated feeds.",
  },
  {
    icon: HandshakeIcon,
    title: "Advice, not pressure",
    body: "Our advisors are paid on completed relationships, not on how quickly you sign something.",
  },
  {
    icon: Users,
    title: "One point of contact",
    body: "The advisor who shows you the first property stays with you through handover.",
  },
  {
    icon: Award,
    title: "Priced on evidence",
    body: "We value with recent comparables from the same micro-market, then show you the workings.",
  },
];

function AboutPage() {
  return (
    <div>
      <section className="bg-ice">
        <div className="pv-container grid gap-10 py-14 lg:grid-cols-2 lg:items-center lg:py-20">
          <div>
            <p className="text-xs font-semibold tracking-widest text-gold-deep uppercase">
              About PropVista
            </p>
            <h1 className="mt-4 text-3xl leading-[1.05] font-extrabold tracking-tight text-navy sm:text-5xl">
              A property consultancy
              <br />
              built on evidence.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
              PropVista started in 2016 with a simple frustration: listings that looked nothing like
              the property, and advisors who disappeared after the deposit. We rebuilt the process
              around verification, one advisor per client, and pricing you can audit.
            </p>
          </div>
          <SmartImage
            src={heroHouse}
            alt="Contemporary house represented by PropVista"
            aspect="aspect-[4/3]"
            wrapperClassName="rounded-3xl shadow-[var(--shadow-lift)]"
          />
        </div>
      </section>

      <section className="pv-container py-14 sm:py-20">
        <h2 className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
          What we hold ourselves to
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="pv-lift rounded-2xl bg-card p-6 shadow-[var(--shadow-soft)]"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-ice text-gold-deep">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-navy">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ice">
        <div className="pv-container grid gap-10 py-14 lg:grid-cols-2 lg:items-center lg:py-20">
          <SmartImage
            src={agents}
            alt="A PropVista advisor at the Pune office"
            aspect="aspect-[4/3]"
            wrapperClassName="rounded-3xl shadow-[var(--shadow-lift)] order-last lg:order-first"
          />
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
              Twenty-two advisors.{" "}
              <span className="text-muted-foreground">Six cities. One standard.</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Our team covers Pune, Mumbai, Bengaluru, Hyderabad, Goa and Chandigarh. Each advisor
              specialises in a handful of micro-markets rather than covering a whole city thinly —
              which is why they can tell you what the flat two floors down actually sold for.
            </p>
            <dl className="mt-8 grid grid-cols-3 gap-4">
              {[
                ["1,400+", "Transactions closed"],
                ["₹2,900 Cr", "Property advised on"],
                ["4.8/5", "Client rating"],
              ].map(([stat, label]) => (
                <div key={label}>
                  <dt className="text-xl font-extrabold text-gold-deep sm:text-2xl">{stat}</dt>
                  <dd className="mt-1 text-xs text-muted-foreground">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="pv-container py-14 sm:py-20">
        <div className="grid gap-8 overflow-hidden rounded-3xl bg-navy p-8 sm:p-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-background sm:text-3xl">
              Thinking of listing this season?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-background/75">
              Book a valuation visit and we'll bring the last six comparable transactions from your
              locality with us.
            </p>
            <Link
              to="/contact"
              className="pv-tap mt-6 inline-flex items-center rounded-full bg-gold px-7 text-sm font-semibold text-primary-foreground transition-transform duration-200 hover:scale-[1.02]"
            >
              Talk to an advisor
            </Link>
          </div>
          <SmartImage
            src={sellHome}
            alt="Bright kitchen in a PropVista listed home"
            aspect="aspect-[16/10]"
            wrapperClassName="rounded-2xl"
          />
        </div>
      </section>
    </div>
  );
}
