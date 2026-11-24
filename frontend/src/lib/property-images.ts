import type { Property, PropertyImage, PropertyImageLabel } from "@/types/property";

export const PROPERTY_IMAGE_LABELS: PropertyImageLabel[] = [
  "Main",
  "Front",
  "Exterior",
  "Living room",
  "Bedroom",
  "Kitchen",
  "Bathroom",
  "Balcony",
  "Terrace",
  "Garden",
  "Parking",
  "Floor plan",
  "View",
  "Other",
];

export function normalizePropertyImage(
  image: string | PropertyImage | undefined,
  fallbackLabel: PropertyImageLabel = "Other",
): PropertyImage {
  if (!image) return { src: "", label: fallbackLabel };
  if (typeof image === "string") return { src: image, label: fallbackLabel };
  return {
    ...image,
    src: typeof image.src === "string" ? image.src : "",
    label: image.label ?? fallbackLabel,
  };
}

export function getPropertyPhotos(images: Property["images"] = []): PropertyImage[] {
  return (images ?? [])
    .map((image) => normalizePropertyImage(image))
    .filter((photo) => photo.src.trim());
}

export function getPhotoName(photo: PropertyImage, index: number): string {
  return (
    photo.name?.trim() ||
    (photo.label === "Main"
      ? "Main photo"
      : photo.label === "Other"
        ? `Photo ${index + 1}`
        : photo.label)
  );
}

export function getCoverPhotoIndex(photos: PropertyImage[]): number {
  const cover = photos.findIndex((photo) => photo.cover === true);
  return cover >= 0
    ? cover
    : Math.max(
        0,
        photos.findIndex((photo) => photo.label === "Main"),
      );
}

export function getMainImage(property: Property): string {
  const photos = getPropertyPhotos(property.images);
  return photos[getCoverPhotoIndex(photos)]?.src ?? "";
}
