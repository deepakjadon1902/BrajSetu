import { cn } from "@/lib/utils";
interface BrandLogoProps {
  className?: string;
  compact?: boolean;
  inverted?: boolean;
}
export function BrandLogo({ className, compact = false, inverted = false }: BrandLogoProps) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2.5", className)}>
      <span
        className={cn(
          "grid shrink-0 place-items-center overflow-hidden rounded-lg bg-white",
          compact ? "h-10 w-10" : "h-12 w-12",
        )}
      >
        <img
          src="/favicon.png"
          alt=""
          width={512}
          height={512}
          className="h-full w-full scale-[1.4] object-contain"
        />
      </span>
      <span className={cn("block leading-none", inverted ? "text-white" : "text-navy")}>
        <span className={cn("block font-semibold tracking-tight", compact ? "text-lg" : "text-xl")}>
          Braj Setu
        </span>
        <span
          className={cn(
            "mt-1.5 block text-[9px] font-medium tracking-[0.22em] uppercase",
            inverted ? "text-white/65" : "text-muted-foreground",
          )}
        >
          Properties
        </span>
      </span>
    </span>
  );
}
