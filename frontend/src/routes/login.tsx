import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AuthLayout, Field, inputClass, primaryButtonClass } from "@/components/auth/AuthLayout";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useStore } from "@/lib/mock-store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in to Braj Setu Properties" },
      {
        name: "description",
        content:
          "Sign in to Braj Setu Properties to save searches, shortlist properties and track your enquiries.",
      },
      { property: "og:title", content: "Sign in to Braj Setu Properties" },
      {
        property: "og:description",
        content: "Save searches and shortlist properties with a Braj Setu Properties account.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    const result = await login(email, password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success("Welcome back to Braj Setu Properties.");
    navigate({ to: "/" });
  }

  return (
    <AuthLayout
      title="Sign in to continue"
      subtitle="Save searches, shortlist properties and pick up enquiries where you left them."
      footer={
        <>
          New to Braj Setu Properties?{" "}
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
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`${inputClass} pr-12`}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((value) => !value)}
              className="absolute inset-y-0 right-3 grid w-8 place-items-center text-muted-foreground transition-colors hover:text-navy"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
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

      <GoogleSignInButton onSuccess={() => navigate({ to: "/" })} />

      <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" />
        Demo account: riya@example.com / Riya@1234
      </p>
    </AuthLayout>
  );
}
