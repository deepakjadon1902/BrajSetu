import { newsArticles, properties } from "@/data/properties";
import type { NewsArticle, Property, PropertyFilters } from "@/types/property";

/**
 * Placeholder data layer. Every function here returns mock data today and can
 * be swapped for a real HTTP call later without touching any component.
 */

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
      ...property.amenities,
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(query.trim().toLowerCase())) return false;
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
  if (amenities?.length && !amenities.every((a) => property.amenities.includes(a))) return false;

  return true;
}

/** List-based helpers so callers can pass the live (admin-managed) catalogue. */
export function filterProperties(list: Property[], filters: PropertyFilters = {}): Property[] {
  return list.filter((p) => matches(p, filters));
}

export function pickFeatured(list: Property[], limit = 8): Property[] {
  return [...list]
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
    .slice(0, limit);
}

export function findProperty(list: Property[], id: string): Property | undefined {
  return list.find((p) => p.id === id);
}

export function similarProperties(list: Property[], id: string, limit = 3): Property[] {
  const base = findProperty(list, id);
  if (!base) return [];
  return list
    .filter((p) => p.id !== id && (p.category === base.category || p.intent === base.intent))
    .slice(0, limit);
}

/** Seed-backed convenience wrappers (used for SSR/SEO before hydration). */
export function getProperties(filters: PropertyFilters = {}): Property[] {
  return filterProperties(properties, filters);
}

export function getFeaturedProperties(limit = 8): Property[] {
  return pickFeatured(properties, limit);
}

export function getPropertyById(id: string): Property | undefined {
  return findProperty(properties, id);
}

export function getSimilarProperties(id: string, limit = 3): Property[] {
  return similarProperties(properties, id, limit);
}

export function getNews(): NewsArticle[] {
  return newsArticles;
}

export const PRICE_BOUNDS = { min: 0, max: 40000000 };

export function formatPrice(value: number, intent?: Property["intent"]): string {
  const formatted =
    value >= 10000000
      ? `₹${(value / 10000000).toFixed(2).replace(/\.00$/, "")} Cr`
      : value >= 100000
        ? `₹${(value / 100000).toFixed(2).replace(/\.00$/, "")} L`
        : `₹${value.toLocaleString("en-IN")}`;
  return intent === "Rent" ? `${formatted}/mo` : formatted;
}

export function formatArea(area: number): string {
  return `${area.toLocaleString("en-IN")} sq.ft`;
}
