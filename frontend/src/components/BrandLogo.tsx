import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  compact?: boolean;
  inverted?: boolean;
}

export function BrandLogo({ className, compact = false, inverted = false }: BrandLogoProps) {
  return (
    <span className={cn("flex min-w-0 items-center", className)}>
      <img
        src="/braj-setu-logo.jpeg"
        alt="Braj Setu Properties"
        className={cn(
          "min-w-0 object-contain",
          compact ? "h-12 w-auto sm:h-14" : "h-14 w-auto sm:h-16",
          inverted && "rounded-md bg-background px-2.5 py-1.5 shadow-[var(--shadow-soft)]",
        )}
        width={1024}
        height={559}
      />
    </span>
  );
}
