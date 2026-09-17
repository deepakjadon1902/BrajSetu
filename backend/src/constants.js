export const allPermissions = [
  "dashboard",
  "properties",
  "verification",
  "fraud",
  "documents",
  "enquiries",
  "news",
  "users",
  "settings",
  "activity",
];

export const rolePermissions = {
  user: [],
  owner: [],
  developer: [],
  editor: ["dashboard", "properties", "news"],
  manager: ["dashboard", "properties", "news", "enquiries", "users"],
  verifier: ["dashboard", "properties", "verification", "documents", "activity"],
  support: ["dashboard", "enquiries", "fraud", "activity"],
  admin: allPermissions,
};

export const verificationLevels = [
  "OWNER_LISTED",
  "IDENTITY_CHECKED",
  "DOCUMENT_CHECKED",
  "VERIFIED_LISTING",
  "RERA_VERIFIED",
];

export const verificationStatuses = [
  "Draft",
  "Pending Review",
  "Under Review",
  "Needs Correction",
  "Approved",
  "Rejected",
  "Suspended",
  "Expired",
];

export const listingLifecycleStatuses = [
  "Draft",
  "Active",
  "Sold",
  "Rented",
  "Leased",
  "Expired",
  "Archived",
];

export const verifiedListingDisclaimer =
  "Verified Listing means Brajsetu Properties has completed its published checklist at the recorded level for available information/documents. It is not a government certification, title guarantee, encumbrance-free guarantee, investment guarantee, or assurance of future transaction outcome. Buyer/Tenant should complete independent legal and financial due diligence.";

export const ownerDeclarationVersion = "owner-declaration-v1.0";

export function permissionsFor(user) {
  if (!user) return [];
  if (user.role === "admin") return allPermissions;
  return user.permissions?.length ? user.permissions : rolePermissions[user.role] || [];
}
