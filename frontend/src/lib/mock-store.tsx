import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { newsArticles as seedNews, properties as seedProperties } from "@/data/properties";
import type { NewsArticle, Property } from "@/types/property";

export type UserRole = "user" | "editor" | "manager" | "admin";
export type AdminPermission =
  "dashboard" | "properties" | "enquiries" | "news" | "users" | "settings" | "activity";

export const permissionLabels: Record<AdminPermission, string> = {
  dashboard: "Dashboard",
  properties: "Properties",
  enquiries: "Enquiries",
  news: "News",
  users: "Users",
  settings: "Settings",
  activity: "Activity",
};

export const allPermissions = Object.keys(permissionLabels) as AdminPermission[];

export const roleLabels: Record<UserRole, string> = {
  user: "User",
  editor: "Editor",
  manager: "Manager",
  admin: "Admin",
};

export const rolePermissions: Record<UserRole, AdminPermission[]> = {
  user: [],
  editor: ["dashboard", "properties", "news"],
  manager: ["dashboard", "properties", "news", "enquiries", "users"],
  admin: allPermissions,
};

export function permissionsFor(user: AppUser | null | undefined): AdminPermission[] {
  if (!user) return [];
  if (user.role === "admin") return allPermissions;
  return user.permissions ?? rolePermissions[user.role];
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
  tagline:
    "A heritage-led property consultancy bridging owners and buyers to verified shops, flats, plots, houses and farm houses.",
  metaTitle: "Braj Setu Properties | Premium Property Marketplace",
  metaDescription:
    "Braj Setu Properties bridges buyers, tenants and owners to verified flats, houses, plots, shops and farm houses.",
  contactEmail: "brajsetuproperties@gmail.com",
  contactPhone: "+91 90000 00000",
  address: VRINDAVAN_SARTHI_ADDRESS,
  ogTitle: "Braj Setu Properties | Premium Property Marketplace",
  ogDescription: "Buy, rent and sell verified property with a boutique advisory team.",
  ogImage: "/braj-setu-logo.jpeg",
  twitterCard: "summary_large_image",
  twitterHandle: "@brajsetuproperties",
  socialFacebook: "",
  socialInstagram: "",
  socialLinkedin: "",
  socialX: "",
  announcementEnabled: true,
  announcementMessage:
    "New this week: verified Braj Mandal listings added across Vrindavan, Mathura and Goverdhan.",
  announcementTone: "navy",
};

function normalizeSettings(settings: Partial<SiteSettings> | undefined): SiteSettings {
  const merged = { ...defaultSettings, ...(settings ?? {}) };
  return {
    ...merged,
    address:
      !merged.address || merged.address === LEGACY_DEFAULT_ADDRESS
        ? VRINDAVAN_SARTHI_ADDRESS
        : merged.address,
  };
}

export type ActivityArea = "Settings" | "Properties" | "Users" | "Enquiries" | "News" | "Auth";

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
  news: NewsArticle[];
  enquiries: Enquiry[];
  currentUser: AppUser | null;
  adminUser: AppUser | null;
}

export interface AuthResult {
  ok: boolean;
  error?: string;
  token?: string;
}

interface StoreContextValue extends StoreShape {
  hydrated: boolean;
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
  requestPasswordReset: (email: string) => Promise<AuthResult>;
  resetPassword: (token: string, password: string) => Promise<AuthResult>;
  adminLogin: (email: string, password: string) => Promise<AuthResult>;
  adminLogout: () => void;
  uploadPropertyImages: (files: File[]) => Promise<string[]>;
  saveProperty: (property: Property) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  saveNews: (article: NewsArticle) => Promise<void>;
  deleteNews: (id: string) => Promise<void>;
  saveUser: (user: AppUser) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addEnquiry: (input: Omit<Enquiry, "id" | "createdAt" | "status">) => Promise<void>;
  setEnquiryStatus: (id: string, status: Enquiry["status"]) => Promise<void>;
  deleteEnquiry: (id: string) => Promise<void>;
  saveSettings: (settings: SiteSettings) => Promise<void>;
  resetSettings: () => Promise<void>;
  restoreSettingsVersion: (id: string) => Promise<void>;
  clearActivity: () => Promise<void>;
}

const localApiBase = import.meta.env.DEV
  ? import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:5000/api"
  : "";
const productionApiBase = import.meta.env.PROD
  ? import.meta.env.VITE_PRODUCTION_API_BASE_URL?.trim() || "https://brajsetu.onrender.com/api"
  : "";

const API_BASE_ALIASES: Record<string, string> = {
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
    properties: seedProperties,
    news: seedNews,
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
    response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error(
      `Cannot reach the API at ${API_BASE}. Please make sure the backend is running.`,
    );
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

  const bitmap = await createImageBitmap(file);
  const maxSide = 1600;
  const ratio = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * ratio));
  const height = Math.max(1, Math.round(bitmap.height * ratio));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error(`Could not optimize ${file.name}.`);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error(`Could not convert ${file.name}.`))),
      "image/webp",
      0.82,
    );
  });
  const name = file.name.replace(/\.[^.]+$/, "") || "property-image";
  return new File([blob], `${name}.webp`, { type: "image/webp" });
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
  const [userToken, setUserToken] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  const refreshAdmin = useCallback(
    async (token = adminToken) => {
      if (!token) return;
      const snapshot = await api<Partial<StoreShape>>("/admin/snapshot", {}, token);
      setState((prev) => ({
        ...prev,
        ...snapshot,
        settings: normalizeSettings(snapshot.settings),
      }));
    },
    [adminToken],
  );

  useEffect(() => {
    let mounted = true;
    async function hydrate() {
      const storedUser = window.localStorage.getItem(USER_TOKEN_KEY);
      const storedAdmin = window.localStorage.getItem(ADMIN_TOKEN_KEY);
      setUserToken(storedUser);
      setAdminToken(storedAdmin);
      try {
        const boot = await api<Partial<StoreShape>>("/bootstrap");
        if (!mounted) return;
        setState((prev) => ({
          ...prev,
          properties: Array.isArray(boot.properties) ? boot.properties : prev.properties,
          news: Array.isArray(boot.news) ? boot.news : prev.news,
          settings: normalizeSettings(boot.settings),
        }));
        if (storedUser) {
          const me = await api<{ user: AppUser }>("/auth/me", {}, storedUser);
          if (mounted) setState((prev) => ({ ...prev, currentUser: me.user }));
        }
        if (storedAdmin) {
          const me = await api<{ user: AppUser }>("/auth/me", {}, storedAdmin);
          if (mounted) setState((prev) => ({ ...prev, adminUser: me.user }));
          await refreshAdmin(storedAdmin);
        }
      } catch {
        /* The bundled catalogue keeps the frontend useful while the API is offline. */
      } finally {
        if (mounted) setHydrated(true);
      }
    }
    hydrate();
    return () => {
      mounted = false;
    };
  }, [refreshAdmin]);

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
      requestPasswordReset: async (email) => {
        try {
          const result = await api<AuthResult>("/auth/password/forgot", {
            method: "POST",
            body: JSON.stringify({ email }),
          });
          return { ok: true, token: result.token };
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
        setState((prev) => ({ ...prev, adminUser: null }));
      },
      uploadPropertyImages: async (files) => {
        const optimized = await Promise.all(files.map(fileToWebp));
        return Promise.all(
          optimized.map(async (file) => {
            try {
              return await uploadToImageKit(file, adminToken);
            } catch {
              return blobToDataUrl(file);
            }
          }),
        );
      },
      saveProperty: async (property) => {
        const result = await api<{ property: Property }>(
          "/admin/properties",
          { method: "POST", body: JSON.stringify(property) },
          adminToken,
        );
        setState((prev) => ({
          ...prev,
          properties: prev.properties.some((p) => p.id === property.id)
            ? prev.properties.map((p) => (p.id === property.id ? result.property : p))
            : [result.property, ...prev.properties],
        }));
        await refreshAdmin();
      },
      deleteProperty: async (id) => {
        await api(`/admin/properties/${id}`, { method: "DELETE" }, adminToken);
        setState((prev) => ({ ...prev, properties: prev.properties.filter((p) => p.id !== id) }));
        await refreshAdmin();
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
  }, [adminToken, hydrated, refreshAdmin, state]);

  void userToken;

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
