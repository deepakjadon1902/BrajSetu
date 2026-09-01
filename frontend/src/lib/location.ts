import { VRINDAVAN_SARTHI_ADDRESS } from "@/lib/mock-store";

export const OFFICE_MAP_QUERY = VRINDAVAN_SARTHI_ADDRESS;
export const OFFICE_MAP_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  OFFICE_MAP_QUERY,
)}`;
export const OFFICE_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  OFFICE_MAP_QUERY,
)}`;
export const OFFICE_MAP_EMBED_URL = `https://maps.google.com/maps?q=${encodeURIComponent(
  OFFICE_MAP_QUERY,
)}&z=16&output=embed`;
