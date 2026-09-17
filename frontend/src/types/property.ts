export type PropertyCategory = "Shop" | "Flat" | "Plot" | "House" | "Farm House";
export type PropertyIntent = "Sale" | "Rent";
export type PropertyImageLabel = "Main" | "Bedroom" | "Kitchen" | "Bathroom" | "Balcony";
export type VerificationLevel =
  "OWNER_LISTED" | "IDENTITY_CHECKED" | "DOCUMENT_CHECKED" | "VERIFIED_LISTING" | "RERA_VERIFIED";
export type VerificationStatus =
  | "Draft"
  | "Pending Review"
  | "Under Review"
  | "Needs Correction"
  | "Approved"
  | "Rejected"
  | "Suspended"
  | "Expired";

export interface PropertyImage {
  src: string;
  label: PropertyImageLabel;
}

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
  propertyDetails?: {
    fullAddress?: string;
    landmark?: string;
    areaUnit?: "sq.ft" | "sq.m" | "sq.yd" | "acre" | "bigha";
    plotArea?: number;
    carpetArea?: number;
    builtUpArea?: number;
    floor?: string;
    totalFloors?: string;
    balconies?: number;
    parking?: string;
    availability?: string;
    facing?: string;
    roadWidth?: string;
    leaseType?: string;
    priceNegotiable?: boolean;
    gatedCommunity?: boolean;
    gasPipeline?: boolean;
    waterSupply?: string;
    powerBackup?: string;
  };
  images: (string | PropertyImage)[];
  amenities: string[];
  featured?: boolean;
  status?: "New" | "Active" | "Price Drop";
  listingSource?: "Admin" | "User";
  reviewStatus?: "Pending Review" | "Approved" | "Needs Changes";
  submittedBy?: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  ownerDetails?: {
    ownerName?: string;
    ownerPhone?: string;
    ownerEmail?: string;
    ownerRole?: "Owner" | "Landlord" | "Developer" | "Authorized Partner" | "Broker" | "";
    organizationName?: string;
    ownerAddress?: string;
    authorityType?: string;
    publicContactName?: string;
    publicContactRole?: string;
  };
  termsAcceptedAt?: string;
  transactionType?: "sale" | "rent" | "lease";
  ownershipType?: string;
  legalOwnerName?: string;
  publicLocation?: string;
  lifecycleStatus?: "Draft" | "Active" | "Sold" | "Rented" | "Leased" | "Expired" | "Archived";
  rera?: {
    providedNumber?: string;
    state?: string;
    status?:
      "NOT_APPLICABLE" | "OWNER_PROVIDED" | "CHECK_PENDING" | "CHECKED" | "MISMATCH" | "ISSUE";
    projectName?: string;
    promoter?: string;
    verifiedAt?: string;
    source?: string;
    notes?: string;
  };
  declarations?: {
    loanOrEncumbrance?: string;
    litigationOrDispute?: string;
    ownerDeclarationAccepted?: boolean;
    ownerDeclarationVersion?: string;
    acceptedAt?: string;
  };
  verification?: {
    level?: VerificationLevel;
    status?: VerificationStatus;
    scope?: string;
    verifiedAt?: string;
    expiresAt?: string;
    rejectionReason?: string;
    suspensionReason?: string;
    reviewNotes?: string;
  };
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
