import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="pv-page-intro border-b border-border">
      <div className="pv-container py-10 sm:py-14 lg:py-16">
        <p className="pv-eyebrow">{eyebrow}</p>
        <h1 className="pv-title mt-3 max-w-4xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
