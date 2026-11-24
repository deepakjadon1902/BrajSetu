import assert from "node:assert/strict";
const base = process.env.SMOKE_BASE_URL || "http://127.0.0.1:5173";
const pages = [
  ["/", "Find your place"],
  ["/buy", "Find a property to buy."],
  ["/rent", "Find your next rental."],
  ["/sale", "Make your next move simple."],
  ["/about", "Local knowledge. Clear conversations."],
  ["/contact", "Tell us what you have in mind."],
  ["/terms", "Terms of use"],
  ["/privacy", "Privacy policy"],
  ["/login", "Sign in"],
  ["/register", "Create"],
  ["/forgot-password", "Reset"],
  ["/reset-password", "password"],
  ["/list-property", "List your property"],
  ["/profile", "Loading your profile"],
  ["/admin/login", "Restricted access"],
  ["/admin/properties", "Checking your admin session"],
];
for (let offset = 0; offset < pages.length; offset += 3) {
  await Promise.all(
    pages.slice(offset, offset + 3).map(async ([path, expected]) => {
      const response = await fetch(base + path, { signal: AbortSignal.timeout(60000) });
      assert.equal(response.status, 200, path + " status");
      const html = await response.text();
      const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
      assert.ok(text.toLowerCase().includes(expected.toLowerCase()), path + " content");
      assert.ok(!html.includes("This page didn&#x27;t load"), path + " error screen");
      assert.ok(!html.includes('href="tel:+919000000000"'), path + " placeholder phone");
      console.log("PASS " + path);
    }),
  );
}
const missing = await fetch(base + "/page-that-does-not-exist", {
  signal: AbortSignal.timeout(60000),
});
assert.equal(missing.status, 404);
console.log("PASS unknown route returns 404");
