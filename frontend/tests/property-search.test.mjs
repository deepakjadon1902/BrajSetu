import test from "node:test";
import assert from "node:assert/strict";
import { filterProperties } from "../src/lib/property-search.ts";

const property = (overrides = {}) => ({
  id: "listing-1",
  title: "2 BHK flat",
  category: "Flat",
  intent: "Sale",
  price: 4500000,
  location: { city: "Vrindavan", locality: "Raman Reti" },
  specs: { area: 1000, bedrooms: 2, bathrooms: 2, furnishing: "Semi-furnished" },
  images: [],
  amenities: ["Parking", "Lift"],
  ...overrides,
});

test("multi-word searches match words across title, type and location", () => {
  assert.equal(filterProperties([property()], { query: "  Vrindavan   flat  " }).length, 1);
  assert.equal(filterProperties([property()], { query: "2 BHK Raman" }).length, 1);
  assert.equal(filterProperties([property()], { query: "Mathura flat" }).length, 0);
});
test("price, intent, room and amenity filters combine", () => {
  const properties = [
    property(),
    property({ id: "rental", intent: "Rent", price: 18000 }),
    property({ id: "expensive", price: 9000000 }),
  ];
  assert.deepEqual(
    filterProperties(properties, {
      intent: "Sale",
      minPrice: 4000000,
      maxPrice: 5000000,
      bedrooms: 2,
      amenities: ["Lift", "Parking"],
    }).map((item) => item.id),
    ["listing-1"],
  );
  assert.equal(filterProperties(properties, { intent: "Sale", bathrooms: 3 }).length, 0);
});
test("category controls and city searches return only matching properties", () => {
  const properties = [
    property(),
    property({
      id: "shop",
      category: "Shop",
      location: { city: "Mathura", locality: "Holi Gate" },
    }),
  ];
  assert.deepEqual(
    filterProperties(properties, { categories: ["Shop"], city: "holi" }).map((item) => item.id),
    ["shop"],
  );
});
test("searching does not mutate the original catalogue", () => {
  const properties = [property(), property({ id: "second" })];
  const results = filterProperties(properties);
  results.reverse();
  assert.equal(properties[0].id, "listing-1");
});
