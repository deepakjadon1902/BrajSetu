import type { Property, VerificationLevel } from "@/types/property";

export const verificationLevelLabels: Record<VerificationLevel, string> = {
  OWNER_LISTED: "Owner listed",
  IDENTITY_CHECKED: "Identity checked",
  DOCUMENT_CHECKED: "Documents checked",
  VERIFIED_LISTING: "Verified listing",
  RERA_VERIFIED: "RERA checked",
};

export const verifiedListingDisclaimer =
  "Verified Listing means Brajsetu Properties has completed its published checklist at the recorded level for available information/documents. It is not a government certification, title guarantee, encumbrance-free guarantee, investment guarantee, or assurance of future transaction outcome. Buyer/Tenant should complete independent legal and financial due diligence.";

export function getVerificationLabel(property: Property) {
  const level = property.verification?.level ?? "OWNER_LISTED";
  return verificationLevelLabels[level] ?? "Owner listed";
}

export function canShowVerificationBadge(property: Property) {
  return (
    property.reviewStatus === "Approved" &&
    property.verification?.status === "Approved" &&
    Boolean(property.verification?.verifiedAt) &&
    ["IDENTITY_CHECKED", "DOCUMENT_CHECKED", "VERIFIED_LISTING", "RERA_VERIFIED"].includes(
      property.verification?.level ?? "",
    )
  );
}
