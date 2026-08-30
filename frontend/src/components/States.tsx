import { SearchX } from "lucide-react";
import { cn } from "@/lib/utils";

export function PropertyCardSkeleton({ compact }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex gap-4 rounded-2xl bg-card p-3 shadow-[var(--shadow-soft)]">
        <div className="pv-shimmer h-28 w-28 shrink-0 rounded-xl sm:w-36" />
        <div className="flex-1 space-y-3 py-1">
          <div className="pv-shimmer h-4 w-24 rounded-full" />
          <div className="pv-shimmer h-4 w-3/4 rounded-full" />
          <div className="pv-shimmer h-3 w-1/2 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-soft)]">
      <div className="pv-shimmer aspect-[4/3] w-full" />
      <div className="space-y-3 p-5">
        <div className="pv-shimmer h-4 w-3/4 rounded-full" />
        <div className="pv-shimmer h-3 w-1/2 rounded-full" />
        <div className="pv-shimmer h-3 w-2/3 rounded-full" />
      </div>
    </div>
  );
}

export function PropertyGridSkeleton({
  count = 6,
  compact = false,
}: {
  count?: number;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid gap-6",
        compact ? "grid-cols-1" : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      )}
    >
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
