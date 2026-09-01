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
    <div className="relative flex min-h-[calc(100vh-5rem)] items-center overflow-hidden bg-[linear-gradient(135deg,#fffaf0_0%,#efe8d8_48%,#fff7de_100%)] py-14">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(201,161,53,0.22),transparent_28%),radial-gradient(circle_at_82%_80%,rgba(18,35,63,0.16),transparent_30%)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/20 bg-background/35 blur-sm" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.045]">
        <BrandLogo className="[&_img]:h-80 [&_img]:max-w-none" />
      </div>

      <div className="pv-container relative">
        <div className="mx-auto w-full max-w-md overflow-hidden rounded-[1.75rem] border border-gold/25 bg-card/92 p-7 shadow-[0_34px_90px_-36px_rgba(18,35,63,0.55),inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-xl sm:p-10">
          <Link
            to="/"
            className="mx-auto flex h-20 w-44 items-center justify-center rounded-full border border-gold/25 bg-background px-5 shadow-[var(--shadow-soft)]"
          >
            <BrandLogo compact />
          </Link>

          <p className="mt-7 text-center text-xs font-black tracking-[0.18em] text-gold-deep uppercase">
            Braj Setu Properties
          </p>

          <h1 className="mt-3 text-center text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
            {title}
          </h1>
          <p className="mt-3 text-center text-sm leading-relaxed text-muted-foreground">
            {subtitle}
          </p>

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
  "w-full rounded-full border border-border bg-background px-4 py-3 text-sm text-navy outline-none transition-colors placeholder:text-muted-foreground focus:border-gold focus:ring-4 focus:ring-gold/10";

export const primaryButtonClass =
  "flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#12233f,#273d70)] px-6 py-3.5 text-sm font-bold text-background shadow-[0_18px_34px_-24px_rgba(18,35,63,0.8)] transition-transform duration-200 hover:scale-[1.01] disabled:opacity-60";
