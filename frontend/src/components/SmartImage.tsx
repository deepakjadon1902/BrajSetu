import { useEffect, useRef, useState } from "react";
import { ImageOff } from "lucide-react";
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
  const imageRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(!src);

  useEffect(() => {
    setFailed(!src);
    setLoaded(Boolean(imageRef.current?.complete && imageRef.current?.naturalWidth));
  }, [src]);

  return (
    <div className={cn("relative overflow-hidden bg-ice", aspect, wrapperClassName)}>
      {!loaded && !failed && <div className="pv-shimmer absolute inset-0" aria-hidden="true" />}
      {failed ? (
        <div className="absolute inset-0 flex min-w-0 flex-col items-center justify-center gap-1.5 overflow-hidden bg-smoke p-2 text-xs text-muted-foreground">
          <ImageOff className="size-5 shrink-0" aria-hidden="true" />
          <span className="max-w-full truncate">Photo unavailable</span>
        </div>
      ) : (
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-200",
            loaded ? "opacity-100" : "opacity-0",
            className,
          )}
        />
      )}
    </div>
  );
}
