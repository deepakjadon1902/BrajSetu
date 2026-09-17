import { ShieldCheck } from "lucide-react";

import type { Property } from "@/types/property";
import { cn } from "@/lib/utils";
import {
  canShowVerificationBadge,
  getVerificationLabel,
  verifiedListingDisclaimer,
} from "@/lib/verification";

export function VerificationBadge({
  property,
  compact = false,
  className,
}: {
  property: Property;
  compact?: boolean;
  className?: string;
}) {
  const showBadge = canShowVerificationBadge(property);
  const label = showBadge ? getVerificationLabel(property) : "Owner listed";
  const verifiedAt = property.verification?.verifiedAt
    ? new Date(property.verification.verifiedAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";
  const explanation = property.verification?.scope || verifiedListingDisclaimer;

  return (
    <span
      title={`${label}${verifiedAt ? ` on ${verifiedAt}` : ""}. ${explanation}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-bold",
        showBadge
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-border bg-background text-muted-foreground",
        className,
      )}
    >
      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
      {compact ? label : `${label}${verifiedAt ? ` · ${verifiedAt}` : ""}`}
    </span>
  );
}
