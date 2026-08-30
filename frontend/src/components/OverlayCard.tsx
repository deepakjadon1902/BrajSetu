import { Link } from "@tanstack/react-router";
import { SmartImage } from "@/components/SmartImage";
import { cn } from "@/lib/utils";

interface OverlayCardProps {
  image: string;
  title: string;
  subtitle: string;
  to: "/buy" | "/rent" | "/sale" | "/about" | "/contact";
  cta?: string;
  className?: string;
}

/** Style A — full-bleed photo with scrim, white title and a dark pill button. */
export function OverlayCard({
  image,
  title,
  subtitle,
  to,
  cta = "Details",
  className,
}: OverlayCardProps) {
  return (
    <Link
      to={to}
      className={cn(
        "pv-lift group relative block overflow-hidden rounded-2xl shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      <SmartImage src={image} alt={title} aspect="aspect-[4/3]" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-extrabold text-background">{title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-background/80">{subtitle}</p>
        </div>
        <span className="pv-smooth-state pv-tap inline-flex shrink-0 items-center rounded-full bg-navy px-4 text-xs font-semibold text-background group-hover:scale-[1.02]">
          {cta}
        </span>
      </div>
    </Link>
  );
}
