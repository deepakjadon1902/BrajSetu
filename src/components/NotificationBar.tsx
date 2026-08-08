import { useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationBarProps {
  children: ReactNode;
  tone?: "navy" | "gold";
  position?: "top" | "bottom";
}

export function NotificationBar({
  children,
  tone = "navy",
  position = "top",
}: NotificationBarProps) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div
      className={cn(
        "w-full",
        tone === "navy" ? "bg-navy text-background" : "bg-gold text-primary-foreground",
        position === "bottom" && "fixed inset-x-0 bottom-0 z-40",
      )}
    >
      <div className="pv-container flex items-center justify-between gap-4 py-2.5">
        <p className="min-w-0 flex-1 text-center text-xs font-medium sm:text-sm">
          {children}
        </p>
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Dismiss announcement"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors hover:bg-background/15"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
