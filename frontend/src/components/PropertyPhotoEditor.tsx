import { Camera, ImagePlus, Link2, Star, Trash2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { SmartImage } from "@/components/SmartImage";
import {
  getCoverPhotoIndex,
  getPhotoName,
  getPropertyPhotos,
  PROPERTY_IMAGE_LABELS,
} from "@/lib/property-images";
import { cn } from "@/lib/utils";
import type { Property, PropertyImage, PropertyImageLabel } from "@/types/property";

const photoField =
  "mt-1.5 min-h-10 w-full rounded-lg border border-border bg-card px-2.5 py-2 text-sm text-navy placeholder:text-muted-foreground";

export function PropertyPhotoEditor({
  images,
  onChange,
  prepareFiles,
  onPreparingChange,
  disabled = false,
  maxPhotos,
}: {
  images: Property["images"];
  onChange: (photos: PropertyImage[]) => void;
  prepareFiles: (files: File[]) => Promise<PromiseSettledResult<string>[]>;
  onPreparingChange: (preparing: boolean) => void;
  disabled?: boolean;
  maxPhotos?: number;
}) {
  const photos = useMemo(() => getPropertyPhotos(images), [images]);
  const [link, setLink] = useState("");
  const [preparing, setPreparing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const uploadInProgress = useRef(false);
  const coverIndex = getCoverPhotoIndex(photos);
  const remaining = maxPhotos === undefined ? Infinity : Math.max(0, maxPhotos - photos.length);
  const locked = disabled || preparing;

  async function addFiles(files: File[]) {
    if (!files.length || disabled || uploadInProgress.current) return;
    if (!remaining) return;
    const selected = files.slice(0, remaining);
    if (selected.length < files.length)
      toast.info(`This listing can have up to ${maxPhotos} photos.`);
    uploadInProgress.current = true;
    setPreparing(true);
    onPreparingChange(true);
    try {
      const results = await prepareFiles(selected);
      const existingSources = new Set(photos.map((photo) => photo.src));
      const additions: PropertyImage[] = [];
      for (const result of results) {
        if (result.status === "fulfilled" && !existingSources.has(result.value)) {
          additions.push({ src: result.value, label: "Other" });
          existingSources.add(result.value);
        } else if (result.status === "rejected") {
          toast.error(
            result.reason instanceof Error ? result.reason.message : "A photo could not be added.",
          );
        }
      }
      if (additions.length) onChange([...photos, ...additions]);
      else if (results.every((result) => result.status === "fulfilled"))
        toast.info("These photos are already in the gallery.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Photos could not be added.");
    } finally {
      uploadInProgress.current = false;
      setPreparing(false);
      onPreparingChange(false);
    }
  }

  function addLink() {
    const src = link.trim();
    if (!src || locked || !remaining) return;
    try {
      if (!["http:", "https:"].includes(new URL(src).protocol)) throw new Error();
    } catch {
      toast.error("Enter a photo link that starts with https:// or http://.");
      return;
    }
    if (photos.some((photo) => photo.src === src)) {
      toast.info("This photo is already in the gallery.");
      return;
    }
    onChange([...photos, { src, label: "Other" }]);
    setLink("");
  }

  function changePhoto(index: number, update: Partial<PropertyImage>) {
    onChange(
      photos.map((photo, position) => (position === index ? { ...photo, ...update } : photo)),
    );
  }

  function movePhoto(from: number, to: number) {
    const photo = photos[from];
    if (!photo || from === to) return;
    const reordered = [...photos];
    reordered.splice(from, 1);
    reordered.splice(to, 0, photo);
    onChange(reordered);
  }

  return (
    <section
      aria-label="Property photos"
      className="min-w-0 space-y-4 rounded-xl border border-border bg-card p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-navy">
            <Camera className="size-4 text-gold-deep" aria-hidden="true" /> Property photos
          </h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Name your photos and arrange them in gallery order.
          </p>
        </div>
        <span
          aria-live="polite"
          className="shrink-0 rounded-full bg-smoke px-2.5 py-1 text-xs font-medium text-navy"
        >
          {maxPhotos ? `${photos.length} / ${maxPhotos}` : photos.length}
        </span>
      </div>

      <label
        className={cn(
          "flex min-h-28 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-navy/25 bg-smoke p-4 text-center text-navy transition-colors focus-within:ring-2 focus-within:ring-navy",
          locked || !remaining ? "opacity-60" : "cursor-pointer hover:border-navy/60 hover:bg-ice",
          dragging && !locked && remaining > 0 && "border-navy bg-ice",
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void addFiles(Array.from(event.dataTransfer.files));
        }}
      >
        <ImagePlus className="size-5" aria-hidden="true" />
        <span className="text-sm font-semibold">
          {preparing ? "Preparing photos…" : "Choose photos"}
        </span>
        <span className="text-xs text-muted-foreground">
          {remaining ? "Or drop image files here" : "Remove a photo to add another"}
        </span>
        <input
          className="sr-only"
          type="file"
          accept="image/*"
          multiple
          disabled={locked || !remaining}
          onChange={(event) => {
            const files = Array.from(event.currentTarget.files ?? []);
            event.currentTarget.value = "";
            void addFiles(files);
          }}
        />
      </label>

      <details className="rounded-lg border border-border px-3 py-2">
        <summary className="cursor-pointer py-1 text-xs font-semibold text-navy">
          Add a photo link
        </summary>
        <div className="mt-2 flex items-center gap-2 pb-1">
          <input
            aria-label="Photo link"
            inputMode="url"
            placeholder="https://…"
            value={link}
            disabled={locked || !remaining}
            onChange={(event) => setLink(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addLink();
              }
            }}
            className={cn(photoField, "mt-0 min-w-0 flex-1")}
          />
          <button
            type="button"
            onClick={addLink}
            disabled={locked || !remaining || !link.trim()}
            className="pv-icon-button border border-border disabled:opacity-50"
            aria-label="Add photo link"
          >
            <Link2 className="size-4" aria-hidden="true" />
          </button>
        </div>
      </details>

      {photos.length > 0 && (
        <ol aria-label="Gallery order" className="space-y-3">
          {photos.map((photo, index) => {
            const caption = getPhotoName(photo, index);
            const cover = index === coverIndex;
            const repeated = photos.findIndex((item) => item.src === photo.src) !== index;
            return (
              <li
                key={repeated ? `${photo.src}-${index}` : photo.src}
                className="overflow-hidden rounded-xl border border-border bg-smoke/60"
              >
                <div className="relative">
                  <SmartImage src={photo.src} alt={caption} aspect="aspect-[16/10]" />
                  <span className="absolute top-2 left-2 rounded-full bg-[#10192a]/85 px-2.5 py-1 text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  {cover && (
                    <span className="absolute top-2 right-2 rounded-full bg-card px-2.5 py-1 text-xs font-semibold text-navy">
                      Cover
                    </span>
                  )}
                </div>
                <div className="space-y-3 p-3">
                  <label className="block text-xs font-medium text-navy">
                    Photo name
                    <input
                      className={photoField}
                      aria-label={`Photo ${index + 1} name`}
                      value={photo.name ?? ""}
                      placeholder={photo.label === "Other" ? "e.g. Balcony view" : photo.label}
                      maxLength={80}
                      disabled={locked}
                      onChange={(event) => changePhoto(index, { name: event.target.value })}
                    />
                  </label>
                  <div className="grid grid-cols-[minmax(0,1fr)_5rem] gap-2">
                    <label className="text-xs font-medium text-navy">
                      Category
                      <select
                        value={photo.label}
                        aria-label={`Photo ${index + 1} category`}
                        className={photoField}
                        disabled={locked}
                        onChange={(event) =>
                          changePhoto(index, { label: event.target.value as PropertyImageLabel })
                        }
                      >
                        {PROPERTY_IMAGE_LABELS.map((label) => (
                          <option key={label} value={label}>
                            {label === "Main" ? "Main photo" : label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-xs font-medium text-navy">
                      Position
                      <select
                        value={index}
                        aria-label={`Photo ${index + 1} position`}
                        className={photoField}
                        disabled={locked || photos.length === 1}
                        onChange={(event) => movePhoto(index, Number(event.target.value))}
                      >
                        {photos.map((_, position) => (
                          <option key={position} value={position}>
                            {position + 1}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      className="pv-tap inline-flex items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-navy hover:bg-ice disabled:cursor-default"
                      disabled={locked || cover}
                      onClick={() =>
                        onChange(
                          photos.map((item, position) => ({ ...item, cover: position === index })),
                        )
                      }
                    >
                      <Star
                        aria-hidden="true"
                        className={cn("size-3.5", cover && "fill-current")}
                      />{" "}
                      {cover ? "Cover photo" : "Make cover"}
                    </button>
                    <button
                      type="button"
                      className="pv-icon-button text-destructive disabled:opacity-50"
                      disabled={locked}
                      aria-label={`Remove ${caption}`}
                      onClick={() => onChange(photos.filter((_, position) => position !== index))}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
