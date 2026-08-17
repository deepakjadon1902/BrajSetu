import prop1 from "@/assets/prop-1.jpg";
import prop2 from "@/assets/prop-2.jpg";
import prop3 from "@/assets/prop-3.jpg";
import prop4 from "@/assets/prop-4.jpg";
import prop5 from "@/assets/prop-5.jpg";
import prop6 from "@/assets/prop-6.jpg";
import news1 from "@/assets/news-1.jpg";
import news2 from "@/assets/news-2.jpg";
import news3 from "@/assets/news-3.jpg";
import type { NewsArticle, Property } from "@/types/property";

/**
 * Mock catalogue. Image sources are plain strings so a CDN (e.g. ImageKit)
 * URL can replace the bundled asset with no component refactor.
 */
export const properties: Property[] = [
  {
    id: "pv-001",
    title: "Aster Court Garden Villa",
    category: "House",
    intent: "Sale",
    price: 18500000,
    location: { city: "Pune", locality: "Koregaon Park" },
    specs: { area: 3200, bedrooms: 4, bathrooms: 4, furnishing: "Semi-furnished" },
    images: [prop2, prop1, prop6],
    amenities: ["Backyard", "Fireplace", "Garden", "Storage", "Surveillance Cameras"],
    featured: true,
    status: "New",
    description:
      "A north-facing villa on a quiet tree-lined avenue, built around a double-height living core with a private lawn and covered parking for three cars.",
  },
  {
    id: "pv-002",
    title: "Skyline Terrace Flat",
    category: "Flat",
    intent: "Sale",
    price: 9750000,
    location: { city: "Mumbai", locality: "Lower Parel" },
    specs: { area: 1450, bedrooms: 3, bathrooms: 3, furnishing: "Furnished" },
    images: [prop6, prop1],
    amenities: ["Gym", "Swimming Pool", "Surveillance Cameras", "Laundry"],
    featured: true,
    status: "Active",
    description:
      "High-floor residence with an uninterrupted skyline outlook, a wraparound terrace and access to a full clubhouse deck.",
  },
  {
    id: "pv-003",
    title: "Meridian High Street Shop",
    category: "Shop",
    intent: "Rent",
    price: 145000,
    location: { city: "Bengaluru", locality: "Indiranagar" },
    specs: { area: 820, furnishing: "Bare shell" },
    images: [prop3],
    amenities: ["Storage", "Surveillance Cameras"],
    status: "New",
    description:
      "Corner retail frontage on a high-footfall boulevard with 18 ft of glass display and dedicated customer parking.",
  },
  {
    id: "pv-004",
    title: "Rosewood Farm House",
    category: "Farm House",
    intent: "Sale",
    price: 26400000,
    location: { city: "Lonavala", locality: "Tungarli" },
    specs: { area: 8600, bedrooms: 5, bathrooms: 5, furnishing: "Furnished" },
    images: [prop5, prop2],
    amenities: ["Garden", "Swimming Pool", "Fireplace", "Backyard", "Storage"],
    featured: true,
    status: "Active",
    description:
      "A weekend estate set on two acres, with a wraparound veranda, orchard planting and an infinity edge pool facing the valley.",
  },
  {
    id: "pv-005",
    title: "Elmgrove Residential Plot",
    category: "Plot",
    intent: "Sale",
    price: 7200000,
    location: { city: "Nashik", locality: "Gangapur Road" },
    specs: { area: 4800 },
    images: [prop4],
    amenities: ["Garden"],
    status: "Price Drop",
    description:
      "Clear-title corner plot with approved layout, gated community access and underground utilities already provisioned.",
  },
  {
    id: "pv-006",
    title: "Linden Park Apartment",
    category: "Flat",
    intent: "Rent",
    price: 68000,
    location: { city: "Pune", locality: "Baner" },
    specs: { area: 1180, bedrooms: 2, bathrooms: 2, furnishing: "Semi-furnished" },
    images: [prop1, prop6],
    amenities: ["Gym", "Swimming Pool", "Laundry", "Storage"],
    status: "New",
    description:
      "Bright two-bedroom home with a wide balcony, modular kitchen and covered parking in a low-density tower.",
  },
  {
    id: "pv-007",
    title: "Wharton Lane Family House",
    category: "House",
    intent: "Rent",
    price: 125000,
    location: { city: "Hyderabad", locality: "Jubilee Hills" },
    specs: { area: 2750, bedrooms: 4, bathrooms: 3, furnishing: "Furnished" },
    images: [prop2, prop5],
    amenities: ["Backyard", "Garden", "Fireplace", "Surveillance Cameras"],
    status: "Active",
    description:
      "Independent house with landscaped front garden, staff quarter and a shaded rear deck for evening dining.",
  },
  {
    id: "pv-008",
    title: "Crescent Boulevard Shop",
    category: "Shop",
    intent: "Sale",
    price: 11250000,
    location: { city: "Ahmedabad", locality: "SG Highway" },
    specs: { area: 1100, furnishing: "Bare shell" },
    images: [prop3],
    amenities: ["Storage", "Surveillance Cameras", "Laundry"],
    status: "Active",
    description:
      "Ground-floor commercial unit inside a mixed-use development with anchor tenants already in place.",
  },
  {
    id: "pv-009",
    title: "Solace Hill Farm House",
    category: "Farm House",
    intent: "Rent",
    price: 210000,
    location: { city: "Alibaug", locality: "Kihim" },
    specs: { area: 6400, bedrooms: 4, bathrooms: 4, furnishing: "Furnished" },
    images: [prop5],
    amenities: ["Swimming Pool", "Garden", "Backyard", "Storage"],
    status: "New",
    description:
      "Coastal retreat available on long lease, ten minutes from the shoreline with a shaded courtyard and outdoor kitchen.",
  },
  {
    id: "pv-010",
    title: "Harborview Penthouse",
    category: "Flat",
    intent: "Sale",
    price: 34500000,
    location: { city: "Mumbai", locality: "Worli Sea Face" },
    specs: { area: 3850, bedrooms: 4, bathrooms: 5, furnishing: "Furnished" },
    images: [prop6, prop1],
    amenities: ["Swimming Pool", "Gym", "Surveillance Cameras", "Laundry", "Storage"],
    featured: true,
    status: "New",
    description:
      "Duplex penthouse with private lift lobby, sea-facing terrace and a fully fitted entertainment level.",
  },
  {
    id: "pv-011",
    title: "Kestrel Field Plot",
    category: "Plot",
    intent: "Sale",
    price: 4300000,
    location: { city: "Jaipur", locality: "Ajmer Road" },
    specs: { area: 3200 },
    images: [prop4],
    amenities: [],
    status: "Active",
    description:
      "Regular-shaped plot in an approved township with wide internal roads and 24x7 gated security.",
  },
  {
    id: "pv-012",
    title: "Cedar Row House",
    category: "House",
    intent: "Sale",
    price: 14200000,
    location: { city: "Chandigarh", locality: "Sector 21" },
    specs: { area: 2400, bedrooms: 3, bathrooms: 3, furnishing: "Semi-furnished" },
    images: [prop2, prop1],
    amenities: ["Garden", "Backyard", "Storage", "Fireplace"],
    status: "Price Drop",
    description:
      "Classic row house refreshed in 2024 with new flooring, upgraded wiring and a landscaped rear courtyard.",
  },
  {
    id: "pv-013",
    title: "Marlowe Studio Flat",
    category: "Flat",
    intent: "Rent",
    price: 32000,
    location: { city: "Bengaluru", locality: "HSR Layout" },
    specs: { area: 620, bedrooms: 1, bathrooms: 1, furnishing: "Furnished" },
    images: [prop1],
    amenities: ["Gym", "Laundry", "Surveillance Cameras"],
    status: "New",
    description:
      "Efficient studio with a separate work nook, ideal for a single professional close to the tech corridor.",
  },
  {
    id: "pv-014",
    title: "Bellhaven Courtyard House",
    category: "House",
    intent: "Sale",
    price: 21800000,
    location: { city: "Goa", locality: "Assagao" },
    specs: { area: 3600, bedrooms: 4, bathrooms: 4, furnishing: "Furnished" },
    images: [prop5, prop2],
    amenities: ["Swimming Pool", "Garden", "Backyard", "Fireplace", "Storage"],
    featured: true,
    status: "Active",
    description:
      "Portuguese-influenced villa arranged around a central courtyard, with laterite walls and a lap pool.",
  },
  {
    id: "pv-015",
    title: "Northgate Corner Shop",
    category: "Shop",
    intent: "Rent",
    price: 88000,
    location: { city: "Pune", locality: "FC Road" },
    specs: { area: 540, furnishing: "Semi-furnished" },
    images: [prop3],
    amenities: ["Storage", "Surveillance Cameras"],
    status: "Active",
    description:
      "Compact retail unit on a student-heavy stretch, fitted with shutters, mezzanine storage and signage rights.",
  },
  {
    id: "pv-016",
    title: "Willow Bend Plot",
    category: "Plot",
    intent: "Sale",
    price: 9600000,
    location: { city: "Coimbatore", locality: "Saravanampatti" },
    specs: { area: 5400 },
    images: [prop4],
    amenities: ["Garden"],
    status: "New",
    description:
      "Large frontage plot suited to a single-family build, with drainage, water and power connections at the boundary.",
  },
  {
    id: "pv-017",
    title: "Ashcombe Garden Flat",
    category: "Flat",
    intent: "Sale",
    price: 12400000,
    location: { city: "Kolkata", locality: "Ballygunge" },
    specs: { area: 1680, bedrooms: 3, bathrooms: 3, furnishing: "Semi-furnished" },
    images: [prop1, prop2],
    amenities: ["Gym", "Storage", "Laundry", "Surveillance Cameras"],
    status: "Active",
    description:
      "Ground-floor apartment with a private garden strip, high ceilings and original teak joinery retained.",
  },
  {
    id: "pv-018",
    title: "Orchard Gate Farm House",
    category: "Farm House",
    intent: "Sale",
    price: 19900000,
    location: { city: "Dehradun", locality: "Sahastradhara Road" },
    specs: { area: 7200, bedrooms: 4, bathrooms: 4, furnishing: "Semi-furnished" },
    images: [prop5, prop4],
    amenities: ["Garden", "Backyard", "Fireplace", "Storage"],
    status: "Active",
    description:
      "Hill-facing farm house with mature orchard, glass-fronted living pavilion and a caretaker cottage.",
  },
];

export const newsArticles: NewsArticle[] = [
  {
    id: "n1",
    title: "Where buyer demand is quietly shifting this quarter",
    excerpt: "Secondary corridors are absorbing inventory faster than prime pockets.",
    date: "12 July 2026",
    image: news1,
  },
  {
    id: "n2",
    title: "A practical checklist before you sign the agreement",
    excerpt: "Six title and approval checks that prevent expensive surprises later.",
    date: "04 July 2026",
    image: news2,
  },
  {
    id: "n3",
    title: "The finishes that actually hold resale value",
    excerpt: "Material choices buyers notice, and the ones they never pay extra for.",
    date: "27 June 2026",
    image: news3,
  },
  {
    id: "n4",
    title: "Renting out a second home without the friction",
    excerpt: "How owners are structuring longer leases with better tenant quality.",
    date: "18 June 2026",
    image: news1,
  },
];

export const AMENITY_OPTIONS = [
  "Backyard",
  "Fireplace",
  "Garden",
  "Storage",
  "Gym",
  "Swimming Pool",
  "Surveillance Cameras",
  "Laundry",
];
