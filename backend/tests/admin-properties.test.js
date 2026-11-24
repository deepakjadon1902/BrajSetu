import assert from "node:assert/strict";
import test from "node:test";
import { createApp } from "../src/app.js";
import { Activity } from "../src/models/Activity.js";
import { NewsArticle } from "../src/models/NewsArticle.js";
import { Property } from "../src/models/Property.js";
import { SiteSettings } from "../src/models/SiteSettings.js";
import { User } from "../src/models/User.js";
import { signToken } from "../src/utils/tokens.js";
import {
  adminPropertySchema,
  propertySubmissionSchema,
} from "../src/validators.js";

const requiredFields = {
  title: "Raman Reti flat",
  category: "Flat",
  status: "New",
  reviewStatus: "Approved",
  verification: { level: "OWNER_LISTED" },
  location: { city: "Vrindavan", locality: "Raman Reti" },
  price: 4200000,
  specs: { area: 850.5 },
  propertyDetails: { areaUnit: "sq.ft", landmark: "Near the temple" },
};

const listingPhotos = [
  {
    src: "https://example.test/front.webp",
    label: "Front",
    name: "Street entrance",
  },
  {
    src: "https://example.test/balcony.webp",
    label: "Balcony",
    name: "East balcony",
    cover: true,
  },
];

test("admin property validation requires the listing fields, landmark, and area unit", () => {
  assert.equal(adminPropertySchema.safeParse(requiredFields).success, true);
  for (const overrides of [
    { title: "  " },
    { category: "Apartment" },
    { status: undefined },
    { reviewStatus: undefined },
    { verification: {} },
    { location: { ...requiredFields.location, city: "" } },
    { location: { ...requiredFields.location, locality: "" } },
    { price: -1 },
    { price: true },
    { specs: { area: 0 } },
    { propertyDetails: undefined },
    { propertyDetails: { areaUnit: "sq.ft", landmark: "  " } },
    { propertyDetails: { landmark: "Near the temple" } },
    { propertyDetails: { areaUnit: "unknown", landmark: "Near the temple" } },
  ]) {
    assert.equal(
      adminPropertySchema.safeParse({ ...requiredFields, ...overrides })
        .success,
      false,
    );
  }
});

test("owner submissions require a landmark and area unit and accept fractional areas", () => {
  const listing = {
    title: "Plot near Anjani Kund",
    category: "Plot",
    intent: "Sale",
    location: { city: "Hodal", locality: "Bulwana village road" },
    price: 1200000,
    specs: { area: 0.5 },
    propertyDetails: { areaUnit: "acre", landmark: " Anjani Kund " },
    description: "Clear access from the village road near Anjani Kund.",
    ownerName: "Test owner",
    ownerEmail: "owner@example.test",
    ownerPhone: "1234567890",
    authorityType: "Direct owner",
    termsAccepted: true,
  };
  const valid = propertySubmissionSchema.parse(listing);
  assert.equal(valid.specs.area, 0.5);
  assert.equal(valid.propertyDetails.landmark, "Anjani Kund");
  assert.deepEqual(
    propertySubmissionSchema.parse({ ...listing, images: listingPhotos })
      .images,
    listingPhotos,
  );
  const webp =
    "data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA";
  assert.equal(
    propertySubmissionSchema.safeParse({
      ...listing,
      images: [{ src: webp, label: "Front" }],
    }).success,
    true,
  );
  assert.equal(
    propertySubmissionSchema.safeParse({
      ...listing,
      images: ["data:image/webp;base64,SGVsbG8="],
    }).success,
    false,
  );
  for (const propertyDetails of [
    undefined,
    { landmark: "Anjani Kund" },
    { areaUnit: "acre", landmark: " " },
  ]) {
    assert.equal(
      propertySubmissionSchema.safeParse({ ...listing, propertyDetails })
        .success,
      false,
    );
  }
});

test("admin can save, publish, and edit a listing with optional details left blank", async (context) => {
  const admin = {
    _id: "507f1f77bcf86cd799439011",
    email: "admin@example.test",
    role: "admin",
    status: "Active",
  };
  const records = new Map();
  const matches = (record, query) =>
    Object.entries(query).every(([path, condition]) => {
      const value = record.get(path) ?? null;
      if (condition.$in) return condition.$in.includes(value);
      if (condition.$nin) return !condition.$nin.includes(value);
      return value === condition;
    });
  context.mock.method(User, "findById", () => ({ lean: async () => admin }));
  context.mock.method(Activity, "create", async () => {});
  context.mock.method(NewsArticle, "find", () => ({
    sort: () => ({ lean: async () => [] }),
  }));
  context.mock.method(SiteSettings, "findOne", () => ({
    lean: async () => null,
  }));
  context.mock.method(Property, "findOne", (query) => {
    const record =
      [...records.values()].find((entry) => matches(entry, query)) ?? null;
    return {
      lean: async () => record?.toObject() ?? null,
      then: (resolve, reject) => Promise.resolve(record).then(resolve, reject),
    };
  });
  context.mock.method(Property, "find", (query) => ({
    select: () => ({ limit: () => ({ lean: async () => [] }) }),
    sort: () => ({
      lean: async () =>
        [...records.values()]
          .filter((record) => matches(record, query))
          .map((record) => record.toObject()),
    }),
  }));
  context.mock.method(Property, "create", async (data) => {
    const property = new Property(data);
    assert.equal(property.validateSync(), undefined);
    records.set(property.id, property);
    return property;
  });
  context.mock.method(
    Property.collection,
    "findOneAndUpdate",
    async ({ id }, { $set, $setOnInsert }, options) => {
      assert.equal(options.upsert, true);
      assert.equal(options.returnDocument, "after");
      const record = records.get(id) ?? new Property({ id, ...$setOnInsert });
      for (const [path, value] of Object.entries($set)) {
        if (value !== undefined) record.set(path, value);
      }
      assert.equal(record.validateSync(), undefined);
      records.set(id, record);
      return record.toObject();
    },
  );

  const server = createApp().listen(0, "127.0.0.1");
  context.after(() => new Promise((resolve) => server.close(resolve)));
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}/api`;
  const token = signToken({ ...admin, id: admin._id }, "admin");
  const save = (data) =>
    fetch(`${base}/admin/properties`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  const publicListings = async () => {
    const response = await fetch(`${base}/bootstrap`);
    assert.equal(response.status, 200);
    return (await response.json()).properties;
  };

  const invalidCity = await save({
    ...requiredFields,
    location: { city: " ", locality: "Raman Reti" },
  });
  assert.equal(invalidCity.status, 400);
  assert.equal(records.size, 0);

  const ownerSubmission = await fetch(`${base}/properties`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...requiredFields,
      intent: "Sale",
      description:
        "A flat near the temple with a front entrance and east balcony.",
      ownerName: "Test owner",
      ownerEmail: "owner@example.test",
      ownerPhone: "1234567890",
      authorityType: "Direct owner",
      termsAccepted: true,
      images: listingPhotos,
    }),
  });
  assert.equal(ownerSubmission.status, 201);
  const submitted = (await ownerSubmission.json()).property;
  assert.deepEqual(submitted.images, listingPhotos);
  assert.equal(submitted.reviewStatus, "Pending Review");

  const created = await save({
    ...requiredFields,
    intent: "Rent",
    reviewStatus: "Pending Review",
    description: " ",
    ownerEmail: "private@example.test",
    specs: { area: 850.5, furnishing: "" },
  });
  assert.equal(created.status, 200);
  const {
    property: { id },
  } = await created.json();
  assert.deepEqual(await publicListings(), []);

  records.get(id).set("propertyDetails.landmark", "");
  const rejectedApproval = await fetch(
    `${base}/admin/properties/${id}/verification`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: "Approved", notes: "Review complete" }),
    },
  );
  assert.equal(rejectedApproval.status, 400);

  const approved = await save({
    ...requiredFields,
    id,
    title: "Renovated Raman Reti flat",
    images: listingPhotos,
  });
  assert.equal(approved.status, 200);
  const [published] = await publicListings();
  assert.equal(published.id, id);
  assert.equal(published.title, "Renovated Raman Reti flat");
  assert.equal(published.intent, "Rent");
  assert.equal(published.verification.status, "Approved");
  assert.equal(published.propertyDetails.landmark, "Near the temple");
  assert.equal(published.ownerEmail, undefined);
  assert.deepEqual(published.images, [listingPhotos[1]]);
  assert.equal(published.photoCount, 2);
  const detail = await fetch(`${base}/properties/${id}`);
  assert.equal(detail.status, 200);
  assert.deepEqual((await detail.json()).property.images, listingPhotos);
  const publishedAt = published.publishedAt;

  records.get(id).set("location.locality", "Chhatikara Road");
  const edited = await save({
    ...requiredFields,
    id,
    title: "Updated flat",
    description: "Good light.",
    location: { ...requiredFields.location, locality: "Chhatikara Road" },
  });
  assert.equal(edited.status, 200);
  const [updated] = await publicListings();
  assert.equal(updated.title, "Updated flat");
  assert.equal(updated.description, "Good light.");
  assert.equal(updated.publishedAt, publishedAt);
  assert.deepEqual(updated.images, [listingPhotos[1]]);

  const needsChanges = await save({
    ...requiredFields,
    id,
    reviewStatus: "Needs Changes",
  });
  assert.equal(needsChanges.status, 200);
  assert.equal(
    (await needsChanges.json()).property.verification.status,
    "Needs Correction",
  );
  assert.deepEqual(await publicListings(), []);

  const minimal = await save({
    ...requiredFields,
    title: "Kaman plot",
    category: "Plot",
    location: { city: "Kaman", locality: " Road behind Vimala Kund " },
    specs: { area: 0.5 },
    propertyDetails: { areaUnit: "bigha", landmark: " Near Vimala Kund " },
  });
  assert.equal(minimal.status, 200);
  const [newListing] = await publicListings();
  assert.equal(newListing.intent, "Sale");
  assert.equal(newListing.title, "Kaman plot");
  assert.equal(newListing.location.locality, "Road behind Vimala Kund");
  assert.equal(newListing.specs.area, 0.5);
  assert.equal(newListing.propertyDetails.areaUnit, "bigha");
  assert.equal(newListing.propertyDetails.landmark, "Near Vimala Kund");
});
