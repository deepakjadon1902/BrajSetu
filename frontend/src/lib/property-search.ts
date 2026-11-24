import type { Property, PropertyFilters } from "@/types/property";

function matches(property: Property, filters: PropertyFilters): boolean {
  const { intent, query, city, minPrice, maxPrice, categories, bedrooms, bathrooms, amenities } =
    filters;

  if (intent && property.intent !== intent) return false;

  if (query) {
    const haystack = [
      property.title,
      property.category,
      property.location.city,
      property.location.locality,
      property.description,
      property.publicLocation,
      property.propertyDetails?.fullAddress,
      property.propertyDetails?.landmark,
      property.specs.furnishing,
      property.specs.bedrooms ? `${property.specs.bedrooms} BHK` : "",
      property.status,
      ...(property.amenities ?? []),
    ]
      .join(" ")
      .toLowerCase();
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.every((word) => haystack.includes(word))) return false;
  }

  if (
    city &&
    !`${property.location.city} ${property.location.locality}`
      .toLowerCase()
      .includes(city.trim().toLowerCase())
  )
    return false;

  if (typeof minPrice === "number" && property.price < minPrice) return false;
  if (typeof maxPrice === "number" && property.price > maxPrice) return false;
  if (categories?.length && !categories.includes(property.category)) return false;
  if (bedrooms && (property.specs.bedrooms ?? 0) < bedrooms) return false;
  if (bathrooms && (property.specs.bathrooms ?? 0) < bathrooms) return false;
  if (amenities?.length && !amenities.every((a) => (property.amenities ?? []).includes(a)))
    return false;

  return true;
}

/** List-based helpers so callers can pass the live (admin-managed) catalogue. */
export function filterProperties(list: Property[], filters: PropertyFilters = {}): Property[] {
  return list.filter((p) => matches(p, filters));
}
