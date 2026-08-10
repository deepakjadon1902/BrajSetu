import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Clock, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, X } from "lucide-react";
import { useStore } from "@/lib/mock-store";
import { ContactActions } from "@/components/ContactActions";
import { MapPlaceholder } from "@/components/MapPlaceholder";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact PropVista | Talk to a Property Advisor" },
      {
        name: "description",
        content:
          "Reach the PropVista team by form, WhatsApp or phone. Office hours, address and a direct line to a property advisor.",
      },
      { property: "og:title", content: "Contact PropVista | Talk to a Property Advisor" },
      {
        property: "og:description",
        content: "Send an enquiry or reach a PropVista advisor on WhatsApp or by phone.",
      },
    ],
  }),
  component: ContactPage,
});

interface FormState {
  name: string;
  email: string;
  phone: string;
  message: string;
}

type Errors = Partial<Record<keyof FormState, string>>;

function validate(values: FormState): Errors {
  const errors: Errors = {};
  if (values.name.trim().length < 2) errors.name = "Please enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email))
    errors.email = "Enter a valid email address.";
  if (!/^[0-9+\-\s()]{8,15}$/.test(values.phone))
    errors.phone = "Enter a valid phone number.";
  if (values.message.trim().length < 10)
    errors.message = "Tell us a little more (at least 10 characters).";
  return errors;
}

const fieldClass =
  "min-h-11 w-full rounded-2xl border bg-background px-4 py-3 text-sm text-navy outline-none transition-colors placeholder:text-muted-foreground focus:border-gold";

function SocialLinks() {
  const { settings } = useStore();
  const socials = [
    { href: settings.socialInstagram, Icon: Instagram, label: "Instagram" },
    { href: settings.socialFacebook, Icon: Facebook, label: "Facebook" },
    { href: settings.socialLinkedin, Icon: Linkedin, label: "LinkedIn" },
    { href: settings.socialX, Icon: X, label: "X" },
  ].filter((item) => item.href.trim().length > 0);

  if (socials.length === 0) return null;

  return (
    <div className="mt-8 rounded-3xl border border-border bg-background p-6">
      <h2 className="text-sm font-semibold tracking-wide text-navy uppercase">
        Follow {settings.siteName}
      </h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {socials.map(({ href, Icon, label }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={`${settings.siteName} on ${label}`}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-navy transition-colors hover:border-gold hover:text-gold"
          >
            <Icon className="h-4 w-4" /> {label}
          </a>
        ))}
      </div>
    </div>
  );
}

function ContactPage() {
  const [values, setValues] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    // Placeholder handler — a transactional email service is wired in later.
    onSubmit(values);
    setSubmitted(true);
    setValues({ name: "", email: "", phone: "", message: "" });
  }

  function onSubmit(payload: FormState) {
    console.info("Contact enquiry submitted", payload);
  }

  function update(key: keyof FormState, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  return (
    <div className="bg-smoke pb-16">
      <div className="bg-ice">
        <div className="pv-container py-14 sm:py-20">
          <p className="text-xs font-semibold tracking-widest text-gold-deep uppercase">
            Contact
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl leading-[1.05] font-extrabold tracking-tight text-navy sm:text-5xl">
            Tell us what you're looking for.
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground">
            One advisor picks up your enquiry and stays with it. Most messages get a
            reply the same working day.
          </p>
        </div>
      </div>

      <div className="pv-container grid gap-8 py-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-3xl bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8"
        >
          <h2 className="text-xl font-bold text-navy">Send an enquiry</h2>

          {submitted && (
            <p className="mt-4 rounded-2xl bg-ice px-4 py-3 text-sm font-medium text-navy">
              Thanks — your enquiry is with an advisor. We'll be in touch shortly.
            </p>
          )}

          <div className="mt-6 space-y-5">
            <div>
              <label htmlFor="name" className="text-sm font-semibold text-navy">
                Full name
              </label>
              <input
                id="name"
                value={values.name}
                onChange={(e) => update("name", e.target.value)}
                aria-invalid={Boolean(errors.name)}
                placeholder="Ananya Rao"
                className={cn(fieldClass, "mt-2", errors.name ? "border-destructive" : "border-border")}
              />
              {errors.name && (
                <p className="mt-1.5 text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="email" className="text-sm font-semibold text-navy">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={values.email}
                  onChange={(e) => update("email", e.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  placeholder="you@example.com"
                  className={cn(fieldClass, "mt-2", errors.email ? "border-destructive" : "border-border")}
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-destructive">{errors.email}</p>
                )}
              </div>
              <div>
                <label htmlFor="phone" className="text-sm font-semibold text-navy">
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={values.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  aria-invalid={Boolean(errors.phone)}
                  placeholder="+91 90000 00000"
                  className={cn(fieldClass, "mt-2", errors.phone ? "border-destructive" : "border-border")}
                />
                {errors.phone && (
                  <p className="mt-1.5 text-xs text-destructive">{errors.phone}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="message" className="text-sm font-semibold text-navy">
                What are you looking for?
              </label>
              <textarea
                id="message"
                rows={5}
                value={values.message}
                onChange={(e) => update("message", e.target.value)}
                aria-invalid={Boolean(errors.message)}
                placeholder="A 3 BHK in Baner under ₹1.4 Cr, ready to move…"
                className={cn(fieldClass, "mt-2 resize-y", errors.message ? "border-destructive" : "border-border")}
              />
              {errors.message && (
                <p className="mt-1.5 text-xs text-destructive">{errors.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="pv-tap w-full rounded-full bg-gold px-6 text-sm font-semibold text-primary-foreground transition-transform duration-200 hover:scale-[1.01]"
            >
              Send enquiry
            </button>
          </div>
        </form>

        <div className="space-y-6">
          <div className="rounded-3xl bg-card p-6 shadow-[var(--shadow-soft)]">
            <h2 className="text-lg font-bold text-navy">Prefer to talk?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Our advisory desk is staffed through the working week.
            </p>
            <ContactActions
              layout="row"
              className="mt-5"
              message="Hi PropVista, I'd like to speak to an advisor about a property."
            />
            <ul className="mt-6 space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" />
                <span className="text-muted-foreground">
                  4th Floor, Meridian House, Baner Road, Pune 411045
                </span>
              </li>
              <li className="flex gap-3">
                <Phone className="h-4 w-4 shrink-0 text-gold-deep" />
                <a href="tel:+919000000000" className="text-navy hover:text-gold-deep">
                  +91 90000 00000
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="h-4 w-4 shrink-0 text-gold-deep" />
                <a href="mailto:hello@propvista.in" className="text-navy hover:text-gold-deep">
                  hello@propvista.in
                </a>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" />
                <span className="text-muted-foreground">
                  Mon–Sat, 9:30am – 7:00pm · Sunday by appointment
                </span>
              </li>
            </ul>
          </div>

          <MapPlaceholder
            compact
            pins={[{ id: "office", label: "PropVista, Baner", x: 50, y: 55 }]}
          />
        </div>
      </div>
    </div>
  );
}
