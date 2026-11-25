import { SearchX } from "lucide-react";
import { cn } from "@/lib/utils";

export function PropertyCardSkeleton({ compact }: { compact?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card",
        compact && "sm:flex",
      )}
    >
      <div
        className={cn(
          "pv-shimmer aspect-[4/3] w-full shrink-0",
          compact && "sm:aspect-auto sm:w-[32%] sm:max-w-56 sm:min-h-44",
        )}
      />
      <div className="min-w-0 flex-1 space-y-2 p-4">
        <div className="pv-shimmer h-3 w-24 rounded" />
        <div className="pv-shimmer h-5 w-24 rounded" />
        <div className="pv-shimmer h-4 w-3/4 rounded" />
        <div className="pv-shimmer h-3 w-2/3 rounded" />
        <div className="pv-shimmer h-3 w-1/2 rounded" />
        <div className="border-t border-border pt-2.5">
          <div className="pv-shimmer h-5 w-24 rounded" />
        </div>
      </div>
    </div>
  );
}

export function PropertyGridSkeleton({
  count = 6,
  compact = false,
  className,
}: {
  count?: number;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={className ?? (compact ? "grid gap-4" : "pv-property-grid")}>
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} compact={compact} />
      ))}
    </div>
  );
}

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = "No properties match those filters",
  description = "Try widening the price range, removing an amenity, or searching a nearby locality.",
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-smoke px-6 py-16 text-center",
        className,
      )}
    >
      <span className="grid h-14 w-14 place-items-center rounded-full bg-ice text-navy">
        <SearchX className="h-6 w-6" />
      </span>
      <h3 className="mt-4 text-lg font-bold text-navy">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
