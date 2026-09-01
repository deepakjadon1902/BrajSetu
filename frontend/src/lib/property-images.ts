import type { Property, PropertyImage, PropertyImageLabel } from "@/types/property";

export const PROPERTY_IMAGE_LABELS: PropertyImageLabel[] = [
  "Main",
  "Bedroom",
  "Kitchen",
  "Bathroom",
  "Balcony",
];

export function normalizePropertyImage(
  image: string | PropertyImage | undefined,
  fallbackLabel: PropertyImageLabel = "Bedroom",
): PropertyImage {
  if (!image) return { src: "", label: fallbackLabel };
  if (typeof image === "string") return { src: image, label: fallbackLabel };
  return { src: image.src, label: image.label ?? fallbackLabel };
}

export function getImageSrc(image: string | PropertyImage | undefined): string {
  return normalizePropertyImage(image).src;
}

export function getMainImage(property: Property): string {
  const main = property.images.find((image) => normalizePropertyImage(image).label === "Main");
  return getImageSrc(main ?? property.images[0]);
}
