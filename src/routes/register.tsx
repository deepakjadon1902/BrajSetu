import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AuthLayout, Field, inputClass, primaryButtonClass } from "@/components/auth/AuthLayout";
import { useStore } from "@/lib/mock-store";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your PropVista account" },
      {
        name: "description",
        content:
          "Register with PropVista to shortlist homes, save searches and get matched with verified listings.",
      },
      { property: "og:title", content: "Create your PropVista account" },
      {
        property: "og:description",
        content: "Register to shortlist homes and track enquiries on PropVista.",
      },
    ],
  }),
  component: RegisterPage,
});

interface Errors {
  name?: string | undefined;
  email?: string | undefined;
  phone?: string | undefined;
  password?: string | undefined;
  confirm?: string | undefined;
  terms?: string | undefined;
}

function RegisterPage() {
  const { register } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next: Errors = {};
    if (form.name.trim().length < 2) next.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = "Enter a valid email address.";
    if (form.phone.replace(/\D/g, "").length < 10) next.phone = "Enter a valid phone number.";
    if (form.password.length < 8) next.password = "Use at least 8 characters.";
    else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password))
      next.password = "Include at least one letter and one number.";
    if (form.confirm !== form.password) next.confirm = "Passwords do not match.";
    if (!agreed) next.terms = "Please accept the Terms and Privacy Policy.";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const result = register({
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
    });
    if (!result.ok) {
      setErrors({ email: result.error });
      return;
    }
    toast.success("Account created. You're signed in.");
    navigate({ to: "/" });
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="One account for shortlists, saved searches and enquiry history."
      footer={
        <>
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-navy hover:text-gold-deep">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Full name" error={errors.name}>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            autoComplete="name"
            placeholder="Riya Menon"
            className={inputClass}
          />
        </Field>
        <Field label="Email address" error={errors.email}>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClass}
          />
        </Field>
        <Field label="Phone number" error={errors.phone}>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            autoComplete="tel"
            placeholder="+91 98765 43210"
            className={inputClass}
          />
        </Field>
        <Field label="Password" error={errors.password}>
          <input
            type="password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className={inputClass}
          />
        </Field>
        <Field label="Confirm password" error={errors.confirm}>
          <input
            type="password"
            value={form.confirm}
            onChange={(e) => set("confirm", e.target.value)}
            autoComplete="new-password"
            placeholder="Re-enter password"
            className={inputClass}
          />
        </Field>

        <label className="flex items-start gap-3 text-xs leading-relaxed text-muted-foreground">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border accent-[var(--navy)]"
          />
          <span>
            I agree to the{" "}
            <Link to="/terms" className="font-semibold text-navy hover:text-gold-deep">
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="font-semibold text-navy hover:text-gold-deep">
              Privacy Policy
            </Link>
            .
            {errors.terms ? (
              <span className="mt-1 block text-destructive">{errors.terms}</span>
            ) : null}
          </span>
        </label>

        <button type="submit" className={primaryButtonClass}>
          Create account
        </button>
      </form>
    </AuthLayout>
  );
}
