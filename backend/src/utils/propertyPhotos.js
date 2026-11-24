import { randomUUID } from "node:crypto";
import { imagekitConfigured } from "../config/services.js";

const webpPrefix = "data:image/webp;base64,";
const maxInlineLength = webpPrefix.length + 320 * 1024;

export function isPropertyPhotoSource(src) {
  if (src.startsWith(webpPrefix)) {
    if (src.length > maxInlineLength) return false;
    const header = Buffer.from(
      src.slice(webpPrefix.length, webpPrefix.length + 16),
      "base64",
    );
    return (
      header.toString("ascii", 0, 4) === "RIFF" &&
      header.toString("ascii", 8, 12) === "WEBP"
    );
  }
  try {
    return ["https:", "http:"].includes(new URL(src).protocol);
  } catch {
    return false;
  }
}

export function photoPreview(images = []) {
  const photos = (images ?? []).filter((photo) => {
    const src = typeof photo === "string" ? photo : photo?.src;
    return typeof src === "string" && src.trim();
  });
  const cover =
    photos.find((photo) => photo.cover === true) ??
    photos.find((photo) => photo.label === "Main") ??
    photos[0];
  return { images: cover ? [cover] : [], photoCount: photos.length };
}

export async function storeSubmittedPhotos(images) {
  return Promise.all(
    images.map(async (image, index) => {
      const photo =
        typeof image === "string"
          ? { src: image, label: index === 0 ? "Main" : "Other" }
          : image;
      if (!imagekitConfigured || !photo.src.startsWith(webpPrefix))
        return photo;

      const upload = new FormData();
      const name = `${randomUUID()}.webp`;
      const bytes = Buffer.from(photo.src.slice(webpPrefix.length), "base64");
      upload.set("file", new Blob([bytes], { type: "image/webp" }), name);
      upload.set("fileName", name);
      upload.set("folder", "/braj-setu/properties");
      try {
        const response = await fetch(
          "https://upload.imagekit.io/api/v1/files/upload",
          {
            method: "POST",
            headers: {
              Authorization: `Basic ${Buffer.from(`${process.env.IMAGEKIT_PRIVATE_KEY}:`).toString("base64")}`,
            },
            body: upload,
            signal: AbortSignal.timeout(7000),
          },
        );
        if (response.ok) {
          const { url } = await response.json();
          if (typeof url === "string" && url.startsWith("https://"))
            return { ...photo, src: url };
        }
      } catch {
        // The optimized image can still be kept with the listing during a storage outage.
      }
      return photo;
    }),
  );
}
