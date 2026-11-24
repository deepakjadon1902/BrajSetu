import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Clock,
  ExternalLink,
  Facebook,
  Instagram,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  Navigation,
  Phone,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/mock-store";
import { ContactActions } from "@/components/ContactActions";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import { OFFICE_DIRECTIONS_URL, OFFICE_MAP_EMBED_URL, OFFICE_MAP_URL } from "@/lib/location";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Braj Setu Properties | Talk to a Property Advisor" },
      {
        name: "description",
        content:
          "Reach the Braj Setu Properties team by form, WhatsApp or phone. Office hours, address and a direct line to a property advisor.",
      },
      {
        property: "og:title",
        content: "Contact Braj Setu Properties | Talk to a Property Advisor",
      },
      {
        property: "og:description",
        content: "Send an enquiry or reach a Braj Setu Properties advisor on WhatsApp or by phone.",
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
  if (!/^[0-9+\-\s()]{8,15}$/.test(values.phone)) errors.phone = "Enter a valid phone number.";
  if (values.message.trim().length < 10)
    errors.message = "Tell us a little more (at least 10 characters).";
  return errors;
}

const fieldClass =
  "min-h-11 w-full rounded-lg border bg-card px-3 py-3 text-sm text-navy transition-colors placeholder:text-muted-foreground focus:border-navy";

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
    <div className="mt-8 rounded-xl border border-border bg-background p-6">
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
  const { addEnquiry, settings } = useStore();
  const [values, setValues] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      document.getElementById(Object.keys(nextErrors)[0] ?? "")?.focus();
      return;
    }
    setSending(true);
    try {
      await addEnquiry({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        phone: values.phone.trim(),
        message: values.message.trim(),
      });
      setSubmitted(true);
      toast.success("Your enquiry has been sent.");
      setValues({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Your enquiry could not be sent. Please try again.",
      );
    } finally {
      setSending(false);
    }
  }

  function update(key: keyof FormState, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: validate({ ...values, [key]: value })[key] }));
  }

  function validateField(key: keyof FormState) {
    setErrors((e) => ({ ...e, [key]: validate(values)[key] }));
  }

  return (
    <div className="bg-smoke pb-16">
      <PageHeader
        eyebrow="Contact us"
        title="Tell us what you have in mind."
        description="Ask about a property, request a visit or get help with a listing. Our team will follow up on your enquiry."
      />

      <div className="pv-container grid gap-8 py-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-xl bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8"
        >
          <h2 className="text-xl font-bold text-navy">Send an enquiry</h2>

          {submitted && (
            <p
              role="status"
              className="mt-4 rounded-lg bg-ice px-4 py-3 text-sm font-medium text-navy"
            >
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
                autoComplete="name"
                aria-describedby={errors.name ? "contact-name-error" : undefined}
                value={values.name}
                onChange={(e) => update("name", e.target.value)}
                onBlur={() => validateField("name")}
                aria-invalid={Boolean(errors.name)}
                placeholder="Ananya Rao"
                className={cn(
                  fieldClass,
                  "mt-2",
                  errors.name ? "border-destructive" : "border-border",
                )}
              />
              {errors.name && (
                <p id="contact-name-error" role="alert" className="mt-1.5 text-xs text-destructive">
                  {errors.name}
                </p>
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
                  autoComplete="email"
                  aria-describedby={errors.email ? "contact-email-error" : undefined}
                  value={values.email}
                  onChange={(e) => update("email", e.target.value)}
                  onBlur={() => validateField("email")}
                  aria-invalid={Boolean(errors.email)}
                  placeholder="you@example.com"
                  className={cn(
                    fieldClass,
                    "mt-2",
                    errors.email ? "border-destructive" : "border-border",
                  )}
                />
                {errors.email && (
                  <p
                    id="contact-email-error"
                    role="alert"
                    className="mt-1.5 text-xs text-destructive"
                  >
                    {errors.email}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="phone" className="text-sm font-semibold text-navy">
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  aria-describedby={errors.phone ? "contact-phone-error" : undefined}
                  value={values.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  onBlur={() => validateField("phone")}
                  aria-invalid={Boolean(errors.phone)}
                  placeholder="+91 90000 00000"
                  className={cn(
                    fieldClass,
                    "mt-2",
                    errors.phone ? "border-destructive" : "border-border",
                  )}
                />
                {errors.phone && (
                  <p
                    id="contact-phone-error"
                    role="alert"
                    className="mt-1.5 text-xs text-destructive"
                  >
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="message" className="text-sm font-semibold text-navy">
                What are you looking for?
              </label>
              <textarea
                id="message"
                aria-describedby={errors.message ? "contact-message-error" : undefined}
                rows={5}
                value={values.message}
                onChange={(e) => update("message", e.target.value)}
                onBlur={() => validateField("message")}
                aria-invalid={Boolean(errors.message)}
                placeholder="For example, a 2 BHK flat in Vrindavan within ₹50 lakh."
                className={cn(
                  fieldClass,
                  "mt-2 resize-y",
                  errors.message ? "border-destructive" : "border-border",
                )}
              />
              {errors.message && (
                <p
                  id="contact-message-error"
                  role="alert"
                  className="mt-1.5 text-xs text-destructive"
                >
                  {errors.message}
                </p>
              )}
            </div>

            <button type="submit" disabled={sending} className="pv-button-primary w-full gap-2">
              {sending && <Loader2 className="h-4 w-4 animate-spin" />}
              {sending ? "Sending..." : "Send enquiry"}
            </button>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Our team will use these details to respond to your enquiry. Read our{" "}
              <Link to="/privacy" className="text-navy underline underline-offset-4">
                privacy policy
              </Link>
              .
            </p>
          </div>
        </form>

        <div className="space-y-6">
          <div className="rounded-xl bg-card p-6 shadow-[var(--shadow-soft)]">
            <h2 className="text-lg font-bold text-navy">Prefer to talk?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Our advisory desk is staffed through the working week.
            </p>
            <ContactActions
              layout="row"
              className="mt-5"
              message="Hi Braj Setu Properties, I'd like to speak to an advisor about a property."
            />
            <ul className="mt-6 space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" />
                <a
                  href={OFFICE_MAP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-gold-deep"
                >
                  {settings.address}
                </a>
              </li>
              {settings.contactPhone && (
                <li className="flex gap-3">
                  <Phone className="h-4 w-4 shrink-0 text-gold-deep" />
                  <a
                    href={`tel:${settings.contactPhone.replace(/\s/g, "")}`}
                    className="text-navy hover:text-gold-deep"
                  >
                    {settings.contactPhone}
                  </a>
                </li>
              )}
              <li className="flex gap-3">
                <Mail className="h-4 w-4 shrink-0 text-gold-deep" />
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="min-w-0 break-all text-navy hover:text-gold-deep"
                >
                  {settings.contactEmail}
                </a>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" />
                <span className="text-muted-foreground">
                  Please contact us before visiting the office.
                </span>
              </li>
            </ul>
          </div>

          <div className="overflow-hidden rounded-xl bg-card shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between gap-4 border-b border-border p-4">
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-navy">Office location</h2>
                <p className="mt-1 truncate text-xs text-muted-foreground">{settings.address}</p>
              </div>
              <a
                href={OFFICE_DIRECTIONS_URL}
                target="_blank"
                rel="noreferrer"
                className="pv-smooth-state inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-navy px-4 text-xs font-semibold text-background hover:scale-[1.02]"
              >
                <Navigation className="h-4 w-4" />
                Directions
              </a>
            </div>
            <iframe
              title="Braj Setu Properties office on Google Maps"
              src={OFFICE_MAP_EMBED_URL}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-72 w-full border-0"
            />
            <a
              href={OFFICE_MAP_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 border-t border-border px-4 py-3 text-sm font-semibold text-navy hover:text-gold-deep"
            >
              Open in Google Maps
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <SocialLinks />
        </div>
      </div>
    </div>
  );
}
