import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { NewsArticle, Property } from "@/types/property";

export type UserRole =
  "user" | "owner" | "developer" | "editor" | "manager" | "verifier" | "support" | "admin";
export type AdminPermission =
  | "dashboard"
  | "properties"
  | "verification"
  | "fraud"
  | "documents"
  | "enquiries"
  | "news"
  | "users"
  | "settings"
  | "activity";

export const permissionLabels: Record<AdminPermission, string> = {
  dashboard: "Dashboard",
  properties: "Properties",
  verification: "Verification",
  fraud: "Fraud",
  documents: "Documents",
  enquiries: "Enquiries",
  news: "News",
  users: "Users",
  settings: "Settings",
  activity: "Activity",
};

export const allPermissions = Object.keys(permissionLabels) as AdminPermission[];

export const roleLabels: Record<UserRole, string> = {
  user: "User",
  owner: "Owner",
  developer: "Developer",
  editor: "Editor",
  manager: "Manager",
  verifier: "Verifier",
  support: "Support",
  admin: "Admin",
};

export const rolePermissions: Record<UserRole, AdminPermission[]> = {
  user: [],
  owner: [],
  developer: [],
  editor: ["dashboard", "properties", "news"],
  manager: ["dashboard", "properties", "news", "enquiries", "users"],
  verifier: ["dashboard", "properties", "verification", "documents", "activity"],
  support: ["dashboard", "enquiries", "fraud", "activity"],
  admin: allPermissions,
};

export function permissionsFor(user: AppUser | null | undefined): AdminPermission[] {
  if (!user) return [];
  if (user.role === "admin") return allPermissions;
  return user.permissions ?? rolePermissions[user.role] ?? [];
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  permissions?: AdminPermission[] | undefined;
  status: "Active" | "Suspended";
  createdAt: string;
  resetToken?: string | undefined;
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  propertyId?: string;
  status: "New" | "Contacted" | "Closed";
  createdAt: string;
}

export interface SiteSettings {
  siteName: string;
  logoInitials: string;
  tagline: string;
  metaTitle: string;
  metaDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: "summary" | "summary_large_image";
  twitterHandle: string;
  socialFacebook: string;
  socialInstagram: string;
  socialLinkedin: string;
  socialX: string;
  announcementEnabled: boolean;
  announcementMessage: string;
  announcementTone: "navy" | "gold";
}

const LEGACY_DEFAULT_ADDRESS = "4th Floor, Meridian House, Baner Road, Pune 411045";
export const VRINDAVAN_SARTHI_ADDRESS =
  "Raja wala mandir, Infront of Giriraj ji Maharaj, Goverdhan, Mathura, Uttar Pradesh 281502";

export const defaultSettings: SiteSettings = {
  siteName: "Braj Setu Properties",
  logoInitials: "BS",
  tagline: "Connecting buyers, tenants and property owners across Braj Mandal.",
  metaTitle: "Braj Setu Properties | Premium Property Marketplace",
  metaDescription:
    "Find flats, houses, plots, shops and farm houses across Vrindavan, Mathura and nearby Braj towns.",
  contactEmail: "brajsetuproperties@gmail.com",
  contactPhone: "+91 90000 00000",
  address: VRINDAVAN_SARTHI_ADDRESS,
  ogTitle: "Braj Setu Properties | Premium Property Marketplace",
  ogDescription: "Local property listings and support for buyers, tenants and owners in Braj.",
  ogImage: "https://www.brajsetuproperties.com/braj-setu-logo.jpeg",
  twitterCard: "summary_large_image",
  twitterHandle: "@brajsetuproperties",
  socialFacebook: "",
  socialInstagram: "",
  socialLinkedin: "",
  socialX: "",
  announcementEnabled: false,
  announcementMessage: "Explore properties across Vrindavan, Mathura and nearby Braj towns.",
  announcementTone: "navy",
};

function normalizeSettings(settings: Partial<SiteSettings> | undefined): SiteSettings {
  const merged = { ...defaultSettings, ...(settings ?? {}) };
  if (
    merged.tagline ===
    "A heritage-led property consultancy bridging owners and buyers to verified shops, flats, plots, houses and farm houses."
  )
    merged.tagline = defaultSettings.tagline;
  if (merged.contactPhone.replace(/\D/g, "") === "919000000000") merged.contactPhone = "";
  if (
    merged.announcementMessage ===
    "New this week: verified Braj Mandal listings added across Vrindavan, Mathura and Goverdhan."
  )
    merged.announcementMessage = defaultSettings.announcementMessage;
  return {
    ...merged,
    address:
      !merged.address || merged.address === LEGACY_DEFAULT_ADDRESS
        ? VRINDAVAN_SARTHI_ADDRESS
        : merged.address,
  };
}

export type ActivityArea =
  | "Settings"
  | "Properties"
  | "Verification"
  | "Fraud"
  | "Documents"
  | "Users"
  | "Enquiries"
  | "News"
  | "Auth"
  | "Policy";

export interface ActivityEntry {
  id: string;
  actor: string;
  area: ActivityArea;
  action: string;
  detail: string;
  createdAt: string;
}

export interface SettingsVersion {
  id: string;
  actor: string;
  summary: string;
  createdAt: string;
  settings: SiteSettings;
}

interface StoreShape {
  settings: SiteSettings;
  activity: ActivityEntry[];
  settingsHistory: SettingsVersion[];
  users: AppUser[];
  properties: Property[];
  adminProperties: Property[];
  news: NewsArticle[];
  enquiries: Enquiry[];
  currentUser: AppUser | null;
  adminUser: AppUser | null;
}

type AdminSnapshot = Partial<Omit<StoreShape, "adminProperties">>;

function applyAdminSnapshot(state: StoreShape, snapshot: AdminSnapshot): StoreShape {
  const { properties, ...rest } = snapshot;
  return {
    ...state,
    ...rest,
    adminProperties: properties ?? state.adminProperties,
    settings: normalizeSettings(snapshot.settings),
  };
}

export interface AuthResult {
  ok: boolean;
  error?: string;
  token?: string;
}

interface StoreContextValue extends StoreShape {
  hydrated: boolean;
  sessionHydrated: boolean;
  publicDataError: string | null;
  refreshPublic: () => Promise<void>;
  permissions: AdminPermission[];
  can: (permission: AdminPermission) => boolean;
  register: (input: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<AuthResult>;
  login: (email: string, password: string) => Promise<AuthResult>;
  googleLogin: (credential: string) => Promise<AuthResult>;
  logout: () => void;
  updateCurrentUser: (user: AppUser) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<AuthResult>;
  resetPassword: (token: string, password: string) => Promise<AuthResult>;
  adminLogin: (email: string, password: string) => Promise<AuthResult>;
  adminLogout: () => void;
  uploadPropertyImages: (
    files: File[],
    source: "admin" | "owner",
  ) => Promise<PromiseSettledResult<string>[]>;
  saveProperty: (property: Property) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  saveNews: (article: NewsArticle) => Promise<void>;
  deleteNews: (id: string) => Promise<void>;
  saveUser: (user: AppUser) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addEnquiry: (input: Omit<Enquiry, "id" | "createdAt" | "status">) => Promise<void>;
  reportProperty: (input: {
    propertyId: string;
    reporterName: string;
    reporterEmail?: string;
    reporterPhone?: string;
    category:
      | "fake_property"
      | "wrong_owner"
      | "misleading_price"
      | "duplicate_listing"
      | "document_concern"
      | "other";
    message: string;
  }) => Promise<{ ticketNumber: string }>;
  submitProperty: (
    property: Omit<Property, "id" | "featured" | "status" | "listingSource" | "reviewStatus"> & {
      ownerName: string;
      ownerEmail: string;
      ownerPhone: string;
      ownerRole?: "Owner" | "Landlord" | "Developer" | "Authorized Partner" | "Broker" | "";
      organizationName?: string;
      ownerAddress?: string;
      authorityType?: string;
      propertyDetails?: Property["propertyDetails"];
      termsAccepted: boolean;
      loanOrEncumbrance?: string;
      litigationOrDispute?: string;
      reraNumber?: string;
    },
  ) => Promise<Property>;
  setEnquiryStatus: (id: string, status: Enquiry["status"]) => Promise<void>;
  deleteEnquiry: (id: string) => Promise<void>;
  saveSettings: (settings: SiteSettings) => Promise<void>;
  resetSettings: () => Promise<void>;
  restoreSettingsVersion: (id: string) => Promise<void>;
  clearActivity: () => Promise<void>;
}

const localApiBase = import.meta.env.DEV
  ? import.meta.env["VITE_API_BASE_URL"]?.trim() || "http://localhost:5000/api"
  : "";
const productionApiBase = import.meta.env.PROD
  ? import.meta.env["VITE_PRODUCTION_API_BASE_URL"]?.trim() || "https://brajsetu.onrender.com/api"
  : "";

const API_BASE_ALIASES: Record<string, string> = {
  "http://127.0.0.1:5000/api": "http://localhost:5000/api",
  "https://braj-setu-api.onrender.com/api": "https://brajsetu.onrender.com/api",
};

function normalizeApiBase(apiBase: string) {
  const trimmed = apiBase.replace(/\/$/, "");
  return API_BASE_ALIASES[trimmed] ?? trimmed;
}

export const API_BASE = normalizeApiBase(productionApiBase || localApiBase);
const USER_TOKEN_KEY = "braj-setu-user-token";
const ADMIN_TOKEN_KEY = "braj-setu-admin-token";

export function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function initialState(): StoreShape {
  return {
    settings: normalizeSettings(defaultSettings),
    activity: [],
    settingsHistory: [],
    users: [],
    properties: [],
    adminProperties: [],
    news: [],
    enquiries: [],
    currentUser: null,
    adminUser: null,
  };
}

async function api<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      signal: options.signal ?? AbortSignal.timeout(12000),
    });
  } catch {
    throw new Error("We could not connect to the service. Please try again in a moment.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data as T;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read optimized image."));
    reader.readAsDataURL(blob);
  });
}

async function fileToWebp(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) throw new Error(`${file.name} is not an image.`);

  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error(`Could not open ${file.name}. Try a JPEG, PNG or WebP photo.`);
  });
  const canvas = document.createElement("canvas");
  try {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error(`Could not optimize ${file.name}.`);
    for (const [maxSide, quality] of [
      [1600, 0.82],
      [1400, 0.74],
      [1100, 0.68],
      [800, 0.62],
    ] as const) {
      const ratio = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
      canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
      canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", quality),
      );
      if (blob?.type === "image/webp" && blob.size <= 240 * 1024) {
        const name = file.name.replace(/\.[^.]+$/, "") || "property-image";
        return new File([blob], `${name}.webp`, { type: blob.type });
      }
    }
    throw new Error(`Could not optimize ${file.name}. Try a smaller photo or add a link.`);
  } finally {
    bitmap.close();
  }
}

async function uploadToImageKit(file: File, token: string | null): Promise<string> {
  const auth = await api<{
    token: string;
    expire: number;
    signature: string;
    publicKey: string;
    urlEndpoint: string;
  }>("/admin/imagekit-auth", {}, token);

  const form = new FormData();
  form.set("file", file);
  form.set("fileName", file.name);
  form.set("folder", "/braj-setu/properties");
  form.set("useUniqueFileName", "true");
  form.set("token", auth.token);
  form.set("expire", String(auth.expire));
  form.set("signature", auth.signature);
  form.set("publicKey", auth.publicKey);

  const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(10000),
  });
  const data = (await response.json().catch(() => ({}))) as { url?: string; filePath?: string };
  if (!response.ok) throw new Error("ImageKit upload failed.");
  if (data.url) return data.url;
  if (data.filePath) return `${auth.urlEndpoint}${data.filePath}`;
  throw new Error("ImageKit did not return an image URL.");
}

function saveToken(key: string, token?: string) {
  if (token) window.localStorage.setItem(key, token);
}

function removeToken(key: string) {
  window.localStorage.removeItem(key);
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreShape>(() => initialState());
  const [hydrated, setHydrated] = useState(false);
  const [sessionHydrated, setSessionHydrated] = useState(false);
  const [publicDataError, setPublicDataError] = useState<string | null>(null);
  const publicRequest = useRef(0);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  const refreshPublic = useCallback(async () => {
    const request = ++publicRequest.current;
    setHydrated(false);
    setPublicDataError(null);
    try {
      const boot = await api<Partial<StoreShape>>("/bootstrap", { cache: "no-store" });
      if (request !== publicRequest.current) return;
      setState((prev) => ({
        ...prev,
        properties: Array.isArray(boot.properties) ? boot.properties : prev.properties,
        news: Array.isArray(boot.news) ? boot.news : prev.news,
        settings: normalizeSettings(boot.settings),
      }));
    } catch {
      if (request === publicRequest.current)
        setPublicDataError("We could not load the latest properties.");
    } finally {
      if (request === publicRequest.current) setHydrated(true);
    }
  }, []);

  useEffect(() => {
    void refreshPublic();
  }, [refreshPublic]);

  const refreshAdmin = useCallback(
    async (token = adminToken) => {
      if (!token) return;
      const snapshot = await api<AdminSnapshot>("/admin/snapshot", {}, token);
      setState((prev) => applyAdminSnapshot(prev, snapshot));
    },
    [adminToken],
  );

  useEffect(() => {
    let mounted = true;
    async function hydrate() {
      try {
        const storedUser = window.localStorage.getItem(USER_TOKEN_KEY);
        const storedAdmin = window.localStorage.getItem(ADMIN_TOKEN_KEY);
        setUserToken(storedUser);
        setAdminToken(storedAdmin);
        if (storedUser) {
          try {
            const me = await api<{ user: AppUser }>("/auth/me", {}, storedUser);
            if (mounted) setState((prev) => ({ ...prev, currentUser: me.user }));
          } catch {
            /* The saved public session could not be restored. */
          }
        }
        if (storedAdmin) {
          const me = await api<{ user: AppUser }>("/auth/me", {}, storedAdmin);
          const snapshot = await api<AdminSnapshot>("/admin/snapshot", {}, storedAdmin);
          if (mounted)
            setState((prev) => ({
              ...applyAdminSnapshot(prev, snapshot),
              adminUser: me.user,
            }));
        }
      } catch {
        /* A failed session restore does not prevent browsing public listings. */
      } finally {
        if (mounted) setSessionHydrated(true);
      }
    }
    hydrate();
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<StoreContextValue>(() => {
    const permissions = permissionsFor(state.adminUser);
    const authCall = async (path: string, body: unknown, key: string, asAdmin = false) => {
      try {
        const result = await api<{ token: string; user: AppUser }>(path, {
          method: "POST",
          body: JSON.stringify(body),
        });
        saveToken(key, result.token);
        if (asAdmin) {
          setAdminToken(result.token);
          setState((prev) => ({ ...prev, adminUser: result.user }));
          await refreshAdmin(result.token);
        } else {
          setUserToken(result.token);
          setState((prev) => ({ ...prev, currentUser: result.user }));
        }
        return { ok: true };
      } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : "Request failed." };
      }
    };

    return {
      ...state,
      hydrated,
      sessionHydrated,
      publicDataError,
      refreshPublic,
      permissions,
      can: (permission) => permissions.includes(permission),
      register: (input) => authCall("/auth/register", input, USER_TOKEN_KEY),
      login: (email, password) => authCall("/auth/login", { email, password }, USER_TOKEN_KEY),
      googleLogin: (credential) => authCall("/auth/google", { credential }, USER_TOKEN_KEY),
      logout: () => {
        removeToken(USER_TOKEN_KEY);
        setUserToken(null);
        setState((prev) => ({ ...prev, currentUser: null }));
      },
      updateCurrentUser: async (user) => {
        const result = await api<{ user: AppUser }>(
          "/auth/me",
          {
            method: "PATCH",
            body: JSON.stringify({ name: user.name, phone: user.phone }),
          },
          userToken,
        );
        setState((prev) => ({
          ...prev,
          currentUser: result.user,
          users: prev.users.map((entry) => (entry.id === user.id ? result.user : entry)),
        }));
      },
      requestPasswordReset: async (email) => {
        try {
          const result = await api<AuthResult>("/auth/password/forgot", {
            method: "POST",
            body: JSON.stringify({ email }),
          });
          return { ok: true, ...(result.token ? { token: result.token } : {}) };
        } catch (error) {
          return { ok: false, error: error instanceof Error ? error.message : "Request failed." };
        }
      },
      resetPassword: async (token, password) => {
        try {
          await api("/auth/password/reset", {
            method: "POST",
            body: JSON.stringify({ token, password }),
          });
          return { ok: true };
        } catch (error) {
          return { ok: false, error: error instanceof Error ? error.message : "Request failed." };
        }
      },
      adminLogin: (email, password) =>
        authCall("/auth/admin/login", { email, password }, ADMIN_TOKEN_KEY, true),
      adminLogout: () => {
        removeToken(ADMIN_TOKEN_KEY);
        setAdminToken(null);
        setState((prev) => ({ ...prev, adminUser: null, adminProperties: [] }));
      },
      uploadPropertyImages: async (files, source) => {
        const results: PromiseSettledResult<string>[] = [];
        for (let start = 0; start < files.length; start += 3) {
          const batch = await Promise.allSettled(
            files.slice(start, start + 3).map(async (file) => {
              const photo = await fileToWebp(file);
              if (source === "admin") {
                try {
                  return await uploadToImageKit(photo, adminToken);
                } catch {
                  /* Use the optimized photo. */
                }
              }
              return blobToDataUrl(photo);
            }),
          );
          results.push(...batch);
        }
        return results;
      },
      saveProperty: async (property) => {
        const result = await api<{ property: Property }>(
          "/admin/properties",
          { method: "POST", body: JSON.stringify(property) },
          adminToken,
        );
        setState((prev) => ({
          ...prev,
          adminProperties: prev.adminProperties.some((p) => p.id === property.id)
            ? prev.adminProperties.map((p) => (p.id === property.id ? result.property : p))
            : [result.property, ...prev.adminProperties],
        }));
        await Promise.allSettled([refreshAdmin(), refreshPublic()]);
      },
      deleteProperty: async (id) => {
        await api(`/admin/properties/${id}`, { method: "DELETE" }, adminToken);
        setState((prev) => ({
          ...prev,
          adminProperties: prev.adminProperties.filter((p) => p.id !== id),
          properties: prev.properties.filter((p) => p.id !== id),
        }));
        await Promise.allSettled([refreshAdmin(), refreshPublic()]);
      },
      saveNews: async (article) => {
        const result = await api<{ article: NewsArticle }>(
          "/admin/news",
          { method: "POST", body: JSON.stringify(article) },
          adminToken,
        );
        setState((prev) => ({
          ...prev,
          news: prev.news.some((n) => n.id === article.id)
            ? prev.news.map((n) => (n.id === article.id ? result.article : n))
            : [result.article, ...prev.news],
        }));
        await refreshAdmin();
      },
      deleteNews: async (id) => {
        await api(`/admin/news/${id}`, { method: "DELETE" }, adminToken);
        setState((prev) => ({ ...prev, news: prev.news.filter((n) => n.id !== id) }));
        await refreshAdmin();
      },
      saveUser: async (user) => {
        const result = await api<{ user: AppUser }>(
          "/admin/users",
          { method: "POST", body: JSON.stringify(user) },
          adminToken,
        );
        setState((prev) => ({
          ...prev,
          users: prev.users.some((u) => u.id === result.user.id)
            ? prev.users.map((u) => (u.id === result.user.id ? result.user : u))
            : [result.user, ...prev.users],
        }));
        await refreshAdmin();
      },
      deleteUser: async (id) => {
        await api(`/admin/users/${id}`, { method: "DELETE" }, adminToken);
        setState((prev) => ({ ...prev, users: prev.users.filter((u) => u.id !== id) }));
        await refreshAdmin();
      },
      addEnquiry: async (input) => {
        try {
          const result = await api<{ enquiry: Enquiry }>("/enquiries", {
            method: "POST",
            body: JSON.stringify(input),
          });
          setState((prev) => ({ ...prev, enquiries: [result.enquiry, ...prev.enquiries] }));
        } catch {
          setState((prev) => ({
            ...prev,
            enquiries: [
              {
                ...input,
                id: uid("enq"),
                status: "New",
                createdAt: new Date().toISOString(),
              },
              ...prev.enquiries,
            ],
          }));
        }
      },
      reportProperty: async ({ propertyId, ...input }) => {
        const result = await api<{ ticketNumber: string }>(`/properties/${propertyId}/report`, {
          method: "POST",
          body: JSON.stringify(input),
        });
        return { ticketNumber: result.ticketNumber };
      },
      submitProperty: async (property) => {
        const result = await api<{ property: Property }>(
          "/properties",
          {
            method: "POST",
            body: JSON.stringify(property),
            signal: AbortSignal.timeout(25000),
          },
          userToken,
        );
        return result.property;
      },
      setEnquiryStatus: async (id, status) => {
        const result = await api<{ enquiry: Enquiry }>(
          `/admin/enquiries/${id}/status`,
          { method: "PATCH", body: JSON.stringify({ status }) },
          adminToken,
        );
        setState((prev) => ({
          ...prev,
          enquiries: prev.enquiries.map((e) => (e.id === id ? result.enquiry : e)),
        }));
        await refreshAdmin();
      },
      deleteEnquiry: async (id) => {
        await api(`/admin/enquiries/${id}`, { method: "DELETE" }, adminToken);
        setState((prev) => ({ ...prev, enquiries: prev.enquiries.filter((e) => e.id !== id) }));
        await refreshAdmin();
      },
      saveSettings: async (settings) => {
        const result = await api<{ settings: SiteSettings }>(
          "/admin/settings",
          { method: "PUT", body: JSON.stringify(settings) },
          adminToken,
        );
        setState((prev) => ({ ...prev, settings: normalizeSettings(result.settings) }));
        await refreshAdmin();
      },
      resetSettings: async () => {
        const result = await api<{ settings: SiteSettings }>(
          "/admin/settings/reset",
          { method: "POST" },
          adminToken,
        );
        setState((prev) => ({ ...prev, settings: normalizeSettings(result.settings) }));
        await refreshAdmin();
      },
      restoreSettingsVersion: async (id) => {
        const result = await api<{ settings: SiteSettings }>(
          `/admin/settings/restore/${id}`,
          { method: "POST" },
          adminToken,
        );
        setState((prev) => ({ ...prev, settings: normalizeSettings(result.settings) }));
        await refreshAdmin();
      },
      clearActivity: async () => {
        await api("/admin/activity", { method: "DELETE" }, adminToken);
        setState((prev) => ({ ...prev, activity: [] }));
      },
    };
  }, [
    adminToken,
    hydrated,
    sessionHydrated,
    publicDataError,
    refreshPublic,
    refreshAdmin,
    state,
    userToken,
  ]);

  void userToken;

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
