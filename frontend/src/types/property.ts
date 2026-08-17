export type PropertyCategory = "Shop" | "Flat" | "Plot" | "House" | "Farm House";
export type PropertyIntent = "Sale" | "Rent";

export interface Property {
  id: string;
  title: string;
  category: PropertyCategory;
  intent: PropertyIntent;
  price: number;
  location: { city: string; locality: string };
  specs: {
    area: number;
    bedrooms?: number;
    bathrooms?: number;
    furnishing?: string;
  };
  images: string[];
  amenities: string[];
  featured?: boolean;
  status?: "New" | "Active" | "Price Drop";
  description?: string;
}

export interface PropertyFilters {
  intent?: PropertyIntent | undefined;
  query?: string | undefined;
  city?: string | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  categories?: PropertyCategory[] | undefined;
  bedrooms?: number | undefined;
  bathrooms?: number | undefined;
  amenities?: string[] | undefined;
}

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
}
