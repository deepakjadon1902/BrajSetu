import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AuthLayout, Field, inputClass, primaryButtonClass } from "@/components/auth/AuthLayout";
import { useStore } from "@/lib/mock-store";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search["token"] === "string" ? search["token"] : "",
  }),
  head: () => ({
    meta: [
      { title: "Set a new PropVista password" },
      {
        name: "description",
        content: "Enter your reset code and choose a new password for PropVista.",
      },
      { property: "og:title", content: "Set a new PropVista password" },
      {
        property: "og:description",
        content: "Choose a new password for your PropVista account.",
      },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token: initialToken } = Route.useSearch();
  const { resetPassword } = useStore();
  const navigate = useNavigate();
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{
    token?: string | undefined;
    password?: string | undefined;
    confirm?: string | undefined;
  }>({});

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next: typeof errors = {};
    if (!token.trim()) next.token = "Enter the reset code you received.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    else if (!/[A-Za-z]/.test(password) || !/\d/.test(password))
      next.password = "Include at least one letter and one number.";
    if (confirm !== password) next.confirm = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const result = resetPassword(token, password);
    if (!result.ok) {
      setErrors({ token: result.error });
      return;
    }
    toast.success("Password updated. Please sign in.");
    navigate({ to: "/login" });
  }

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Enter your one-time reset code and choose a new password."
      footer={
        <>
          Need a new code?{" "}
          <Link to="/forgot-password" className="font-semibold text-navy hover:text-gold-deep">
            Request another
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Reset code" error={errors.token}>
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ABC123"
            className={`${inputClass} uppercase tracking-[0.2em]`}
          />
        </Field>
        <Field label="New password" error={errors.password}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className={inputClass}
          />
        </Field>
        <Field label="Confirm new password" error={errors.confirm}>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            placeholder="Re-enter password"
            className={inputClass}
          />
        </Field>
        <button type="submit" className={primaryButtonClass}>
          Update password
        </button>
      </form>
    </AuthLayout>
  );
}
