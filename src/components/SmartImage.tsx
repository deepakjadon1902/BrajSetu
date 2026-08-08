import { useState } from "react";
import { cn } from "@/lib/utils";

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  aspect?: string;
  priority?: boolean;
  width?: number;
  height?: number;
}

/**
 * Image with a fixed aspect-ratio box, object-cover and a shimmer skeleton so
 * photos never distort, overflow or flash blank while loading.
 */
export function SmartImage({
  src,
  alt,
  className,
  wrapperClassName,
  aspect = "aspect-[4/3]",
  priority = false,
  width,
  height,
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-ice", aspect, wrapperClassName)}>
      {!loaded && <div className="pv-shimmer absolute inset-0" aria-hidden="true" />}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
      />
    </div>
  );
}
