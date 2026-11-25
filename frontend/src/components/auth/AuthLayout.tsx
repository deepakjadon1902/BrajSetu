import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/BrandLogo";

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
    <div className="pv-page-intro py-9 sm:py-16">
      <div className="pv-container">
        <div className="pv-panel mx-auto w-full max-w-[29rem] p-5 sm:p-8">
          <Link to="/" aria-label="Braj Setu Properties home" className="mb-7 inline-flex">
            <BrandLogo compact />
          </Link>
          <h1 className="pv-heading">{title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
          <div className="mt-7">{children}</div>
          {footer && (
            <div className="mt-7 border-t border-border pt-5 text-sm text-muted-foreground">
              {footer}
            </div>
          )}
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
      <span className="text-sm font-medium text-navy">{label}</span>
      <div className="mt-2">{children}</div>
      {error && (
        <span role="alert" className="mt-1.5 block text-xs text-destructive">
          {error}
        </span>
      )}
    </label>
  );
}
export const inputClass =
  "pv-smooth-state min-h-11 w-full rounded-xl border border-border bg-card px-3.5 py-3 text-sm text-navy placeholder:text-muted-foreground focus:border-navy/55";
export const primaryButtonClass = "pv-button-primary w-full gap-2";
