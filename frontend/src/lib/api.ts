import { newsArticles, properties } from "@/data/properties";
import { filterProperties } from "@/lib/property-search";
import type { NewsArticle, Property, PropertyFilters } from "@/types/property";

/** Catalogue helpers shared by the public site and listing forms. */

export { filterProperties } from "@/lib/property-search";

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

export function formatArea(area: number, unit: string = "sq.ft"): string {
  return `${area.toLocaleString("en-IN")} ${unit}`;
}
