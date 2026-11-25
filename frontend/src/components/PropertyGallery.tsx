import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { SmartImage } from "@/components/SmartImage";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { getCoverPhotoIndex, getPhotoName } from "@/lib/property-images";
import { cn } from "@/lib/utils";
import type { PropertyImage } from "@/types/property";

const galleryButton =
  "grid size-11 touch-manipulation place-items-center rounded-full bg-[#10192a]/80 text-white shadow-sm transition-colors hover:bg-[#10192a] focus-visible:outline-white";

function PhotoNavigation({ onMove }: { onMove: (step: number) => void }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-between px-2 sm:px-4">
      <button
        type="button"
        aria-label="Previous photo"
        onClick={() => onMove(-1)}
        className={cn(galleryButton, "pointer-events-auto")}
      >
        <ChevronLeft className="size-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="Next photo"
        onClick={() => onMove(1)}
        className={cn(galleryButton, "pointer-events-auto")}
      >
        <ChevronRight className="size-5" aria-hidden="true" />
      </button>
    </div>
  );
}

export function PropertyGallery({ title, photos }: { title: string; photos: PropertyImage[] }) {
  const [selection, setSelection] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const previewRef = useRef<HTMLButtonElement>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const index = selection !== null && photos[selection] ? selection : getCoverPhotoIndex(photos);
  const photo = photos[index];
  const caption = photo ? getPhotoName(photo, index) : "";
  const count = `${index + 1} of ${photos.length}`;

  useEffect(() => {
    const strip = thumbnailsRef.current;
    const thumbnail = strip?.children.item(index) as HTMLElement | null;
    if (!strip || !thumbnail) return;
    const left = thumbnail.offsetLeft;
    const end = left + thumbnail.offsetWidth;
    if (left < strip.scrollLeft || end > strip.scrollLeft + strip.clientWidth) {
      strip.scrollTo({
        left: left - 12,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
    }
  }, [index]);

  function movePhoto(step: number) {
    if (photos.length > 1) setSelection((index + step + photos.length) % photos.length);
  }

  function onKeyDown(event: KeyboardEvent) {
    if (photos.length <= 1 || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
    event.preventDefault();
    event.stopPropagation();
    movePhoto(event.key === "ArrowLeft" ? -1 : 1);
  }

  function startSwipe(event: PointerEvent) {
    swiped.current = false;
    touchStart.current =
      event.pointerType === "touch" ? { x: event.clientX, y: event.clientY } : null;
  }

  function endSwipe(event: PointerEvent) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || photos.length <= 1) return;
    const x = event.clientX - start.x;
    const y = event.clientY - start.y;
    if (Math.abs(x) > 45 && Math.abs(x) > Math.abs(y)) {
      swiped.current = true;
      movePhoto(x < 0 ? 1 : -1);
    }
  }

  const swipeHandlers = {
    onPointerDown: startSwipe,
    onPointerUp: endSwipe,
    onPointerCancel: () => {
      touchStart.current = null;
    },
  };
  const photoFrame = "aspect-[4/3] sm:aspect-[16/10] max-h-[65svh]";
  const photoBackdrop = "bg-gradient-to-br from-[#172639] via-[#101a2a] to-[#223a50]";

  return (
    <section
      aria-label="Property photos"
      onKeyDown={onKeyDown}
      className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]"
    >
      {photo ? (
        <>
          <div className="relative">
            <button
              ref={previewRef}
              type="button"
              aria-label={`View ${caption} full screen, photo ${count}`}
              className="relative block w-full cursor-zoom-in touch-pan-y focus-visible:outline-offset-[-4px] focus-visible:outline-white"
              {...swipeHandlers}
              onClick={() => {
                if (!swiped.current) setExpanded(true);
                swiped.current = false;
              }}
            >
              <SmartImage
                src={photo.src}
                alt={`${title} — ${caption}`}
                aspect={photoFrame}
                wrapperClassName={photoBackdrop}
                className="absolute inset-0 h-full w-full object-contain"
                priority
              />
              <span className={cn(galleryButton, "absolute top-3 right-3")}>
                <Maximize2 className="size-4" aria-hidden="true" />
              </span>
            </button>
            {photos.length > 1 && <PhotoNavigation onMove={movePhoto} />}
          </div>

          <div
            className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5"
            aria-live="polite"
          >
            <p className="min-w-0 break-words text-sm font-semibold text-navy sm:text-base">
              {caption}
            </p>
            <span className="shrink-0 rounded-full bg-smoke px-3 py-1 text-xs tabular-nums text-navy-soft">
              {count}
            </span>
          </div>

          {photos.length > 1 && (
            <div
              ref={thumbnailsRef}
              role="group"
              aria-label="Choose a property photo"
              className="relative flex snap-x snap-proximity gap-2 overflow-x-auto border-t border-border bg-smoke/55 p-3"
            >
              {photos.map((item, position) => {
                const name = getPhotoName(item, position);
                return (
                  <button
                    key={`${item.src}-${position}`}
                    type="button"
                    aria-label={`Show ${name}, photo ${position + 1}`}
                    aria-pressed={index === position}
                    onClick={() => setSelection(position)}
                    className={cn(
                      "w-[5.75rem] shrink-0 snap-start overflow-hidden rounded-lg border bg-card text-left transition-[border-color,box-shadow] sm:w-[7.25rem]",
                      index === position
                        ? "border-navy ring-1 ring-navy"
                        : "border-border hover:border-navy/50",
                    )}
                  >
                    <SmartImage
                      src={item.src}
                      alt=""
                      aspect="aspect-[3/2]"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <span
                      className="block truncate px-2 py-1.5 text-xs font-medium text-navy"
                      title={name}
                    >
                      {name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <Dialog open={expanded} onOpenChange={setExpanded}>
            <DialogContent
              className="w-[calc(100%-1rem)] max-w-6xl gap-3 overflow-hidden rounded-2xl bg-card p-3 sm:w-[calc(100%-2rem)] sm:p-5"
              onKeyDown={onKeyDown}
              onCloseAutoFocus={(event) => {
                event.preventDefault();
                previewRef.current?.focus({ preventScroll: true });
              }}
            >
              <div className="min-w-0 space-y-1 pr-12">
                <DialogTitle className="text-base leading-snug">{title}</DialogTitle>
                <DialogDescription aria-live="polite" className="break-words">
                  {caption} · {count}
                </DialogDescription>
              </div>
              <div className="relative touch-pan-y overflow-hidden rounded-xl" {...swipeHandlers}>
                <SmartImage
                  src={photo.src}
                  alt={`${title} — ${caption}`}
                  aspect="h-[min(68dvh,46rem)]"
                  wrapperClassName={photoBackdrop}
                  className="absolute inset-0 h-full w-full object-contain"
                  priority
                />
                {photos.length > 1 && <PhotoNavigation onMove={movePhoto} />}
              </div>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <SmartImage src="" alt="" aspect={photoFrame} wrapperClassName="bg-smoke" />
      )}
    </section>
  );
}
