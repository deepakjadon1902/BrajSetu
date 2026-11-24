import test from "node:test";
import assert from "node:assert/strict";
import { profileUpdateSchema } from "../src/validators.js";
import { createApp } from "../src/app.js";
import { User } from "../src/models/User.js";
import { signToken } from "../src/utils/tokens.js";

test("profile input trims contact details and rejects account privileges", () => {
  assert.deepEqual(
    profileUpdateSchema.parse({
      name: "  Test User  ",
      phone: "  +91 9876543210  ",
    }),
    { name: "Test User", phone: "+91 9876543210" },
  );
  for (const field of ["role", "permissions", "status", "email", "id"]) {
    assert.equal(
      profileUpdateSchema.safeParse({
        name: "Test User",
        phone: "",
        [field]: "admin",
      }).success,
      false,
    );
  }
  assert.equal(
    profileUpdateSchema.safeParse({ name: "A", phone: "abc" }).success,
    false,
  );
});

test("profile endpoint requires authentication and saves only allowed fields", async () => {
  process.env.JWT_SECRET =
    "isolated-profile-test-secret-at-least-32-characters";
  const originalFindById = User.findById;
  let saves = 0;
  const user = {
    id: "507f1f77bcf86cd799439011",
    _id: "507f1f77bcf86cd799439011",
    name: "Original Name",
    email: "profile-test@example.test",
    phone: "",
    role: "user",
    status: "Active",
    save: async () => {
      saves += 1;
    },
  };
  User.findById = (id) => {
    assert.equal(id, user.id, "Only the authenticated account can be updated");
    return {
      lean: async () => ({ ...user }),
      then: (resolve, reject) => Promise.resolve(user).then(resolve, reject),
    };
  };
  const server = createApp().listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const url = "http://127.0.0.1:" + server.address().port + "/api/auth/me";
  try {
    const anonymous = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "New Name", phone: "" }),
    });
    assert.equal(anonymous.status, 401);
    assert.equal(saves, 0);
    const token = signToken(user, "user");
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    };
    const escalation = await fetch(url, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ name: "New Name", phone: "", role: "admin" }),
    });
    assert.equal(escalation.status, 400);
    assert.equal(saves, 0);
    const update = await fetch(url, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ name: "New Name", phone: "+91 9876543210" }),
    });
    assert.equal(update.status, 200);
    const result = await update.json();
    assert.equal(result.user.name, "New Name");
    assert.equal(result.user.phone, "+91 9876543210");
    assert.equal(result.user.role, "user");
    assert.equal(result.user.email, "profile-test@example.test");
    assert.equal(saves, 1);
  } finally {
    User.findById = originalFindById;
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
