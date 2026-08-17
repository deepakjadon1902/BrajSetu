import { ImageUp, Trash2, ZoomIn } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const MAX_BYTES = 5 * 1024 * 1024;
const MIN_WIDTH = 600;
const MIN_HEIGHT = 315;
const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];

interface Loaded {
  el: HTMLImageElement;
  width: number;
  height: number;
}

/**
 * Upload → validate → crop to a 1200×630 Open Graph image.
 * The result is stored as a data URL so previews and the public head tags
 * always use exactly the saved image.
 */
export function OgImageUploader({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [urlDraft, setUrlDraft] = useState("");
  const frameRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    return () => {
      if (loaded) URL.revokeObjectURL(loaded.el.src);
    };
  }, [loaded]);

  const validateAndLoad = useCallback((file: File) => {
    setError(null);
    if (!ACCEPTED.includes(file.type)) {
      setError("Use a PNG, JPG or WebP image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("That file is larger than 5 MB — please compress it first.");
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth < MIN_WIDTH || img.naturalHeight < MIN_HEIGHT) {
        URL.revokeObjectURL(url);
        setError(
          `Image is ${img.naturalWidth}×${img.naturalHeight}. Minimum is ${MIN_WIDTH}×${MIN_HEIGHT}.`,
        );
        return;
      }
      setLoaded({ el: img, width: img.naturalWidth, height: img.naturalHeight });
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setError("That file could not be read as an image.");
    };
    img.src = url;
  }, []);

  /** Scale that makes the image cover the 1200×630 frame at zoom 1. */
  function coverScale(img: Loaded) {
    return Math.max(OG_WIDTH / img.width, OG_HEIGHT / img.height);
  }

  function clampOffset(next: { x: number; y: number }, img: Loaded) {
    const scale = coverScale(img) * zoom;
    const maxX = Math.max(0, (img.width * scale - OG_WIDTH) / 2);
    const maxY = Math.max(0, (img.height * scale - OG_HEIGHT) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, next.x)),
      y: Math.min(maxY, Math.max(-maxY, next.y)),
    };
  }

  function applyCrop() {
    if (!loaded) return;
    const canvas = document.createElement("canvas");
    canvas.width = OG_WIDTH;
    canvas.height = OG_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setError("Cropping is not supported in this browser.");
      return;
    }
    const scale = coverScale(loaded) * zoom;
    const drawW = loaded.width * scale;
    const drawH = loaded.height * scale;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, OG_WIDTH, OG_HEIGHT);
    ctx.drawImage(
      loaded.el,
      (OG_WIDTH - drawW) / 2 + offset.x,
      (OG_HEIGHT - drawH) / 2 + offset.y,
      drawW,
      drawH,
    );
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    if (dataUrl.length > 1_400_000) {
      onChange(canvas.toDataURL("image/jpeg", 0.6));
    } else {
      onChange(dataUrl);
    }
    URL.revokeObjectURL(loaded.el.src);
    setLoaded(null);
  }

  // Frame is rendered at a smaller size; convert pointer delta to OG pixels.
  function frameRatio() {
    const width = frameRef.current?.clientWidth ?? OG_WIDTH;
    return OG_WIDTH / width;
  }

  const previewScale = loaded ? coverScale(loaded) * zoom : 1;

  return (
    <div className="rounded-2xl border border-border bg-smoke/40 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-navy px-4 py-2 text-xs font-semibold text-background">
          <ImageUp className="h-3.5 w-3.5" />
          {value ? "Replace image" : "Upload image"}
          <input
            type="file"
            accept={ACCEPTED.join(",")}
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) validateAndLoad(file);
              e.target.value = "";
            }}
          />
        </label>
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </button>
        ) : null}
        <span className="text-xs text-muted-foreground">
          PNG, JPG or WebP · min {MIN_WIDTH}×{MIN_HEIGHT} · max 5 MB · cropped to {OG_WIDTH}×
          {OG_HEIGHT}
        </span>
      </div>

      {error ? (
        <p className="mt-3 rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}

      {loaded ? (
        <div className="mt-4">
          <div
            ref={frameRef}
            className="relative w-full cursor-grab overflow-hidden rounded-xl border border-border bg-navy/90 active:cursor-grabbing"
            style={{ aspectRatio: `${OG_WIDTH} / ${OG_HEIGHT}` }}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              dragRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
            }}
            onPointerMove={(e) => {
              const drag = dragRef.current;
              if (!drag) return;
              const ratio = frameRatio();
              setOffset(
                clampOffset(
                  {
                    x: drag.ox + (e.clientX - drag.x) * ratio,
                    y: drag.oy + (e.clientY - drag.y) * ratio,
                  },
                  loaded,
                ),
              );
            }}
            onPointerUp={() => {
              dragRef.current = null;
            }}
          >
            <img
              src={loaded.el.src}
              alt="Crop preview"
              draggable={false}
              className="pointer-events-none absolute top-1/2 left-1/2 max-w-none"
              style={{
                width: `${(loaded.width * previewScale * 100) / OG_WIDTH}%`,
                transform: `translate(calc(-50% + ${(offset.x / OG_WIDTH) * 100}%), calc(-50% + ${
                  (offset.y / OG_HEIGHT) * 100
                }%))`,
              }}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <ZoomIn className="h-4 w-4 text-navy" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              aria-label="Zoom"
              onChange={(e) => {
                const next = Number(e.target.value);
                setZoom(next);
                setOffset((prev) => clampOffset(prev, loaded));
              }}
              className="h-1 flex-1 accent-navy"
            />
            <button
              type="button"
              onClick={applyCrop}
              className="rounded-full bg-navy px-5 py-2 text-xs font-semibold text-background"
            >
              Use this crop
            </button>
            <button
              type="button"
              onClick={() => {
                URL.revokeObjectURL(loaded.el.src);
                setLoaded(null);
              }}
              className="rounded-full border border-border px-5 py-2 text-xs font-semibold text-navy"
            >
              Cancel
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Drag to reposition, zoom to fill. The crop is saved at exactly {OG_WIDTH}×{OG_HEIGHT}.
          </p>
        </div>
      ) : value ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          <img
            src={value}
            alt="Current Open Graph preview"
            className="w-full object-cover"
            style={{ aspectRatio: `${OG_WIDTH} / ${OG_HEIGHT}` }}
          />
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          className="min-w-0 flex-1 rounded-2xl border border-border bg-background px-4 py-2.5 text-sm text-navy outline-none focus:border-navy"
          placeholder="…or paste an https:// image URL"
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
        />
        <button
          type="button"
          onClick={() => {
            const url = urlDraft.trim();
            if (!/^https:\/\/\S+$/i.test(url)) {
              setError("Enter a full https:// image URL.");
              return;
            }
            setError(null);
            onChange(url);
            setUrlDraft("");
          }}
          className="rounded-full border border-border px-5 py-2.5 text-xs font-semibold text-navy"
        >
          Use URL
        </button>
      </div>
    </div>
  );
}
