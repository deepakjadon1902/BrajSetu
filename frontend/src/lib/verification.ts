import type { Property, VerificationLevel } from "@/types/property";

export const verificationLevelLabels: Record<VerificationLevel, string> = {
  OWNER_LISTED: "Owner listed",
  IDENTITY_CHECKED: "Identity checked",
  DOCUMENT_CHECKED: "Documents checked",
  VERIFIED_LISTING: "Verified listing",
  RERA_VERIFIED: "RERA checked",
};

export const verifiedListingDisclaimer =
  "This status describes the checks recorded by Braj Setu Properties for the available information. It is not government certification or a guarantee of title, approvals, property condition or returns. Buyers and tenants should independently check documents and details before a transaction.";

export function getVerificationLabel(property: Property) {
  const level = property.verification?.level ?? "OWNER_LISTED";
  return verificationLevelLabels[level] ?? "Owner listed";
}

export function canShowVerificationBadge(property: Property) {
  return (
    property.reviewStatus === "Approved" &&
    property.verification?.status === "Approved" &&
    Boolean(property.verification?.verifiedAt) &&
    (!property.verification?.expiresAt ||
      new Date(property.verification.expiresAt).getTime() > Date.now()) &&
    ["IDENTITY_CHECKED", "DOCUMENT_CHECKED", "VERIFIED_LISTING", "RERA_VERIFIED"].includes(
      property.verification?.level ?? "",
    )
  );
}
