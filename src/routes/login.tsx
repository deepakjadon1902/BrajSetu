import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import {
  AuthLayout,
  Field,
  inputClass,
  primaryButtonClass,
} from "@/components/auth/AuthLayout";
import { useStore } from "@/lib/mock-store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in to PropVista" },
      {
        name: "description",
        content:
          "Sign in to PropVista to save searches, shortlist properties and track your enquiries.",
      },
      { property: "og:title", content: "Sign in to PropVista" },
      {
        property: "og:description",
        content: "Save searches and shortlist properties with a PropVista account.",
      },
    ],
  }),
  component: LoginPage,
});

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.45a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.65Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.92l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.95H1.26v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56V6.63H1.26a12 12 0 0 0 0 10.74l4.01-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.17 15.24 0 12 0A12 12 0 0 0 1.26 6.63l4.01 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

function LoginPage() {
  const { login } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    const result = login(email, password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success("Welcome back to PropVista.");
    navigate({ to: "/" });
  }

  return (
    <AuthLayout
      title="Sign in to continue"
      subtitle="Save searches, shortlist properties and pick up enquiries where you left them."
      footer={
        <>
          New to PropVista?{" "}
          <Link to="/register" className="font-semibold text-navy hover:text-gold-deep">
            Create an account
          </Link>
          <p className="mt-4 text-xs">
            By continuing you agree to our{" "}
            <Link to="/terms" className="font-semibold text-navy hover:text-gold-deep">
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="font-semibold text-navy hover:text-gold-deep">
              Privacy Policy
            </Link>
            .
          </p>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Email address">
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClass}
          />
        </Field>
        <Field label="Password" error={error}>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={inputClass}
          />
        </Field>

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-xs font-semibold text-navy hover:text-gold-deep"
          >
            Forgot password?
          </Link>
        </div>

        <button type="submit" className={primaryButtonClass}>
          Sign in
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        onClick={() => toast("Google sign-in is not wired up in this demo.")}
        className="pv-tap flex w-full items-center justify-center gap-3 rounded-full border border-border bg-background px-6 py-3.5 text-sm font-semibold text-navy shadow-[var(--shadow-soft)] transition-transform duration-200 hover:scale-[1.01]"
      >
        <GoogleMark />
        Continue with Google
      </button>

      <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" />
        Demo account: riya@example.com / Riya@1234
      </p>
    </AuthLayout>
  );
}
