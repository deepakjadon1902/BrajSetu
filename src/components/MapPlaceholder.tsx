import { Layers, MapPin, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MapPlaceholderProps {
  pins?: { id: string; label: string; x: number; y: number }[];
  className?: string;
  compact?: boolean;
}

/** Static map surface — swap for a real map SDK later without layout changes. */
export function MapPlaceholder({ pins = [], className, compact }: MapPlaceholderProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-coolgray",
        compact ? "h-56" : "h-full min-h-80",
        className,
      )}
      role="img"
      aria-label="Map showing property locations"
    >
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.7) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div className="absolute top-1/4 -left-10 h-24 w-[140%] -rotate-6 rounded-full bg-background/70" />
      <div className="absolute top-2/3 -left-10 h-16 w-[140%] rotate-3 rounded-full bg-background/60" />

      {pins.map((pin) => (
        <div
          key={pin.id}
          className="absolute -translate-x-1/2 -translate-y-full"
          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
        >
          <span className="flex items-center gap-1 rounded-full bg-navy px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap text-background shadow-[var(--shadow-soft)]">
            <MapPin className="h-3 w-3 text-gold" />
            {pin.label}
          </span>
        </div>
      ))}

      <div className="absolute top-3 right-3 flex flex-col gap-2">
        <button
          type="button"
          aria-label="Map layers"
          className="grid h-10 w-10 place-items-center rounded-xl bg-background text-navy shadow-[var(--shadow-soft)]"
        >
          <Layers className="h-4 w-4" />
        </button>
        <div className="overflow-hidden rounded-xl bg-background shadow-[var(--shadow-soft)]">
          <button
            type="button"
            aria-label="Zoom in"
            className="grid h-10 w-10 place-items-center text-navy"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Zoom out"
            className="grid h-10 w-10 place-items-center border-t border-border text-navy"
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
