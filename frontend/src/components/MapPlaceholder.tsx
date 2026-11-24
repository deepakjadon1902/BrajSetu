import { ExternalLink, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface MapPlaceholderProps {
  pins?: { id: string; label: string; x: number; y: number }[];
  className?: string;
  compact?: boolean;
}
export function MapPlaceholder({ pins = [], className }: MapPlaceholderProps) {
  const location = pins.map((pin) => pin.label).join(", ") || "Braj Mandal, Uttar Pradesh";
  const href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  return (
    <div
      className={cn(
        "flex flex-col items-start justify-center gap-4 rounded-xl border border-border bg-smoke p-6",
        className,
      )}
    >
      <span className="grid h-12 w-12 place-items-center rounded-lg bg-card">
        <MapPin className="h-6 w-6 text-gold-deep" />
      </span>
      <div>
        <p className="text-base font-semibold text-navy">{location}</p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Explore this area on Google Maps. Confirm the exact property address with our team before
          a visit.
        </p>
      </div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="pv-button-secondary gap-2"
      >
        Open Google Maps <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  );
}
