import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center bg-ice py-14">
      <div className="pv-container">
        <div className="mx-auto w-full max-w-md rounded-3xl bg-card p-7 shadow-[var(--shadow-lift)] sm:p-10">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy text-sm font-extrabold text-background">
              PV
            </span>
            <span className="text-lg font-extrabold tracking-tight text-navy">PropVista</span>
          </Link>

          <h1 className="mt-8 text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>

          <div className="mt-8">{children}</div>

          {footer ? (
            <div className="mt-8 border-t border-border pt-6 text-sm text-muted-foreground">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-navy-soft">{label}</span>
      <div className="mt-2">{children}</div>
      {error ? <span className="mt-1 block text-xs text-destructive">{error}</span> : null}
    </label>
  );
}

export const inputClass =
  "w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-navy outline-none transition-colors placeholder:text-muted-foreground focus:border-navy";

export const primaryButtonClass =
  "flex w-full items-center justify-center gap-2 rounded-full bg-navy px-6 py-3.5 text-sm font-semibold text-background transition-transform duration-200 hover:scale-[1.01] disabled:opacity-60";
