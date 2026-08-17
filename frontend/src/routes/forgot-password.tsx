import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AuthLayout, Field, inputClass, primaryButtonClass } from "@/components/auth/AuthLayout";
import { useStore } from "@/lib/mock-store";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your PropVista password" },
      {
        name: "description",
        content: "Request a reset code and set a new password for your PropVista account.",
      },
      { property: "og:title", content: "Reset your PropVista password" },
      {
        property: "og:description",
        content: "Request a reset code for your PropVista account.",
      },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { requestPasswordReset } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [token, setToken] = useState<string | undefined>();

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const result = await requestPasswordReset(email);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(undefined);
    setToken(result.token);
    toast.success(result.token ? "Reset code generated." : "Reset code sent by email.");
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter the email on your account and we'll issue a one-time reset code."
      footer={
        <>
          Remembered it?{" "}
          <Link to="/login" className="font-semibold text-navy hover:text-gold-deep">
            Back to sign in
          </Link>
        </>
      }
    >
      {token ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-ice p-5">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-navy-soft">
              <KeyRound className="h-4 w-4 text-gold-deep" /> Your reset code
            </p>
            <p className="mt-3 text-2xl font-extrabold tracking-[0.3em] text-navy">{token}</p>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              In a live deployment this code is emailed to you. For this demo it is shown here.
            </p>
          </div>
          <button
            type="button"
            className={primaryButtonClass}
            onClick={() => navigate({ to: "/reset-password", search: { token } })}
          >
            Continue to reset password
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Email address" error={error}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              className={inputClass}
            />
          </Field>
          <button type="submit" className={primaryButtonClass}>
            Send reset code
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
