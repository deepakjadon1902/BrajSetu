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

/**
 * Frontend-only persistence layer. Everything lives in localStorage so the
 * whole auth + admin experience can be demoed without a backend. Swap the
 * bodies of these functions for HTTP calls later without touching the UI.
 */

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

/** Baseline access per role; individual users can override this list. */
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
  password: string;
  role: UserRole;
  /** Optional per-user override of the role's default admin permissions. */
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

export const defaultSettings: SiteSettings = {
  siteName: "PropVista",
  logoInitials: "PV",
  tagline:
    "A boutique property consultancy helping owners and buyers move with clarity across shops, flats, plots, houses and farm houses.",
  metaTitle: "PropVista | Premium Property Marketplace",
  metaDescription:
    "PropVista is a boutique property marketplace for buying, renting and selling flats, houses, plots, shops and farm houses.",
  contactEmail: "hello@propvista.in",
  contactPhone: "+91 90000 00000",
  address: "4th Floor, Meridian House, Baner Road, Pune 411045",
  ogTitle: "PropVista | Premium Property Marketplace",
  ogDescription: "Buy, rent and sell verified property with a boutique advisory team.",
  ogImage: "",
  twitterCard: "summary_large_image",
  twitterHandle: "@propvista",
  socialFacebook: "https://facebook.com/propvista",
  socialInstagram: "https://instagram.com/propvista",
  socialLinkedin: "https://linkedin.com/company/propvista",
  socialX: "https://x.com/propvista",
  announcementEnabled: true,
  announcementMessage: "New this week: 24 verified listings added across Pune, Mumbai and Goa.",
  announcementTone: "navy",
};

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
  sessionUserId: string | null;
  adminSessionId: string | null;
}

const STORAGE_KEY = "propvista-store-v1";

function iso(daysAgo = 0): string {
  return new Date(Date.now() - daysAgo * 86_400_000).toISOString();
}

export function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function seedState(): StoreShape {
  return {
    users: [
      {
        id: "u-admin",
        name: "PropVista Admin",
        email: "admin@propvista.in",
        phone: "+91 98200 00000",
        password: "Admin@123",
        role: "admin",
        status: "Active",
        createdAt: iso(220),
      },
      {
        id: "u-editor",
        name: "Nikhil Deshpande",
        email: "editor@propvista.in",
        phone: "+91 98111 22334",
        password: "Editor@123",
        role: "editor",
        status: "Active",
        createdAt: iso(60),
      },
      {
        id: "u-demo",
        name: "Riya Menon",
        email: "riya@example.com",
        phone: "+91 90040 11223",
        password: "Riya@1234",
        role: "user",
        status: "Active",
        createdAt: iso(31),
      },
      {
        id: "u-demo-2",
        name: "Aditya Rao",
        email: "aditya@example.com",
        phone: "+91 99870 55412",
        password: "Aditya@123",
        role: "user",
        status: "Active",
        createdAt: iso(9),
      },
    ],
    properties: seedProperties,
    news: seedNews,
    enquiries: [
      {
        id: "e-1",
        name: "Kabir Shah",
        email: "kabir@example.com",
        phone: "+91 98765 43210",
        message: "Interested in a site visit for the Koregaon Park villa this weekend.",
        propertyId: "pv-001",
        status: "New",
        createdAt: iso(1),
      },
      {
        id: "e-2",
        name: "Meera Iyer",
        email: "meera@example.com",
        phone: "+91 91234 55678",
        message: "Looking for a 3BHK rental under ₹1.2L a month in Lower Parel.",
        status: "Contacted",
        createdAt: iso(4),
      },
      {
        id: "e-3",
        name: "Vikram Sethi",
        email: "vikram@example.com",
        phone: "+91 90000 12345",
        message: "Please share the title documents and approvals for the plot listing.",
        status: "Closed",
        createdAt: iso(12),
      },
    ],
    settings: defaultSettings,
    activity: [],
    settingsHistory: [],
    sessionUserId: null,
    adminSessionId: null,
  };
}

function loadState(): StoreShape {
  if (typeof window === "undefined") return seedState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw) as Partial<StoreShape>;
    const base = seedState();
    return {
      ...base,
      ...parsed,
      settings: { ...base.settings, ...(parsed.settings ?? {}) },
      activity: parsed.activity ?? [],
      settingsHistory: (parsed.settingsHistory ?? []).map((v) => ({
        ...v,
        settings: { ...base.settings, ...v.settings },
      })),
    };
  } catch {
    return seedState();
  }
}

export interface AuthResult {
  ok: boolean;
  error?: string;
  token?: string;
}

interface StoreContextValue {
  hydrated: boolean;
  settings: SiteSettings;
  saveSettings: (settings: SiteSettings) => void;
  resetSettings: () => void;
  activity: ActivityEntry[];
  settingsHistory: SettingsVersion[];
  restoreSettingsVersion: (id: string) => void;
  clearActivity: () => void;
  users: AppUser[];
  properties: Property[];
  news: NewsArticle[];
  enquiries: Enquiry[];
  currentUser: AppUser | null;
  adminUser: AppUser | null;
  permissions: AdminPermission[];
  can: (permission: AdminPermission) => boolean;
  register: (input: { name: string; email: string; phone: string; password: string }) => AuthResult;
  login: (email: string, password: string) => AuthResult;
  logout: () => void;
  requestPasswordReset: (email: string) => AuthResult;
  resetPassword: (token: string, password: string) => AuthResult;
  adminLogin: (email: string, password: string) => AuthResult;
  adminLogout: () => void;
  saveProperty: (property: Property) => void;
  deleteProperty: (id: string) => void;
  saveNews: (article: NewsArticle) => void;
  deleteNews: (id: string) => void;
  saveUser: (user: AppUser) => void;
  deleteUser: (id: string) => void;
  addEnquiry: (input: Omit<Enquiry, "id" | "createdAt" | "status">) => void;
  setEnquiryStatus: (id: string, status: Enquiry["status"]) => void;
  deleteEnquiry: (id: string) => void;
}

function describeSettingsDiff(prev: SiteSettings, next: SiteSettings): string {
  const changed = (Object.keys(next) as Array<keyof SiteSettings>).filter(
    (key) => prev[key] !== next[key],
  );
  if (changed.length === 0) return "No field changes";
  return `${changed.length} field${changed.length > 1 ? "s" : ""} updated: ${changed
    .slice(0, 4)
    .join(", ")}${changed.length > 4 ? "…" : ""}`;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreShape>(() => seedState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable — demo data is non-critical */
    }
  }, [state, hydrated]);

  const patch = useCallback((fn: (prev: StoreShape) => StoreShape) => {
    setState(fn);
  }, []);

  const register = useCallback<StoreContextValue["register"]>(
    ({ name, email, phone, password }) => {
      const normalized = email.trim().toLowerCase();
      let result: AuthResult = { ok: true };
      patch((prev) => {
        if (prev.users.some((u) => u.email.toLowerCase() === normalized)) {
          result = { ok: false, error: "An account with this email already exists." };
          return prev;
        }
        const user: AppUser = {
          id: uid("u"),
          name: name.trim(),
          email: normalized,
          phone: phone.trim(),
          password,
          role: "user",
          status: "Active",
          createdAt: new Date().toISOString(),
        };
        return { ...prev, users: [...prev.users, user], sessionUserId: user.id };
      });
      return result;
    },
    [patch],
  );

  const login = useCallback<StoreContextValue["login"]>(
    (email, password) => {
      const normalized = email.trim().toLowerCase();
      const user = state.users.find((u) => u.email.toLowerCase() === normalized);
      if (!user || user.password !== password)
        return { ok: false, error: "Incorrect email or password." };
      if (user.status === "Suspended")
        return { ok: false, error: "This account has been suspended." };
      patch((prev) => ({ ...prev, sessionUserId: user.id }));
      return { ok: true };
    },
    [state.users, patch],
  );

  const logout = useCallback(() => {
    patch((prev) => ({ ...prev, sessionUserId: null }));
  }, [patch]);

  const requestPasswordReset = useCallback<StoreContextValue["requestPasswordReset"]>(
    (email) => {
      const normalized = email.trim().toLowerCase();
      const user = state.users.find((u) => u.email.toLowerCase() === normalized);
      if (!user) return { ok: false, error: "No account found with that email." };
      const token = Math.random().toString(36).slice(2, 8).toUpperCase();
      patch((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === user.id ? { ...u, resetToken: token } : u)),
      }));
      return { ok: true, token };
    },
    [state.users, patch],
  );

  const resetPassword = useCallback<StoreContextValue["resetPassword"]>(
    (token, password) => {
      const clean = token.trim().toUpperCase();
      const user = state.users.find((u) => u.resetToken === clean);
      if (!user) return { ok: false, error: "That reset code is invalid or expired." };
      patch((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u.id === user.id ? { ...u, password, resetToken: undefined } : u,
        ),
      }));
      return { ok: true };
    },
    [state.users, patch],
  );

  const adminLogin = useCallback<StoreContextValue["adminLogin"]>(
    (email, password) => {
      const normalized = email.trim().toLowerCase();
      const user = state.users.find((u) => u.email.toLowerCase() === normalized);
      if (!user || user.password !== password)
        return { ok: false, error: "Incorrect email or password." };
      if (permissionsFor(user).length === 0)
        return { ok: false, error: "This account does not have admin access." };
      if (user.status === "Suspended")
        return { ok: false, error: "This account has been suspended." };
      patch((prev) => ({
        ...prev,
        adminSessionId: user.id,
        activity: [
          {
            id: uid("a"),
            actor: user.email,
            area: "Auth" as const,
            action: "Admin signed in",
            detail: "Signed in to the admin console",
            createdAt: new Date().toISOString(),
          },
          ...prev.activity,
        ].slice(0, 200),
      }));
      return { ok: true };
    },
    [state.users, patch],
  );

  const adminLogout = useCallback(() => {
    patch((prev) => ({ ...prev, adminSessionId: null }));
  }, [patch]);

  const value = useMemo<StoreContextValue>(() => {
    const currentUser = state.users.find((u) => u.id === state.sessionUserId) ?? null;
    const adminUser = state.users.find((u) => u.id === state.adminSessionId) ?? null;
    const actorName = adminUser?.email ?? currentUser?.email ?? "system";
    const log = (
      next: StoreShape,
      area: ActivityArea,
      action: string,
      detail: string,
    ): StoreShape => ({
      ...next,
      activity: [
        {
          id: uid("a"),
          actor: actorName,
          area,
          action,
          detail,
          createdAt: new Date().toISOString(),
        },
        ...next.activity,
      ].slice(0, 200),
    });
    return {
      hydrated,
      settings: state.settings,
      activity: state.activity,
      settingsHistory: state.settingsHistory,
      saveSettings: (settings) =>
        patch((prev) =>
          log(
            {
              ...prev,
              settings,
              settingsHistory: [
                {
                  id: uid("v"),
                  actor: actorName,
                  summary: describeSettingsDiff(prev.settings, settings),
                  createdAt: new Date().toISOString(),
                  settings: prev.settings,
                },
                ...prev.settingsHistory,
              ].slice(0, 25),
            },
            "Settings",
            "Updated site settings",
            describeSettingsDiff(prev.settings, settings),
          ),
        ),
      resetSettings: () =>
        patch((prev) =>
          log(
            {
              ...prev,
              settings: defaultSettings,
              settingsHistory: [
                {
                  id: uid("v"),
                  actor: actorName,
                  summary: "Before reset to defaults",
                  createdAt: new Date().toISOString(),
                  settings: prev.settings,
                },
                ...prev.settingsHistory,
              ].slice(0, 25),
            },
            "Settings",
            "Reset settings",
            "Restored the default branding and metadata",
          ),
        ),
      restoreSettingsVersion: (id) =>
        patch((prev) => {
          const version = prev.settingsHistory.find((v) => v.id === id);
          if (!version) return prev;
          return log(
            {
              ...prev,
              settings: version.settings,
              settingsHistory: [
                {
                  id: uid("v"),
                  actor: actorName,
                  summary: "Before rollback",
                  createdAt: new Date().toISOString(),
                  settings: prev.settings,
                },
                ...prev.settingsHistory,
              ].slice(0, 25),
            },
            "Settings",
            "Rolled back settings",
            `Restored the version saved ${new Date(version.createdAt).toLocaleString()}`,
          );
        }),
      clearActivity: () => patch((prev) => ({ ...prev, activity: [] })),
      users: state.users,
      properties: state.properties,
      news: state.news,
      enquiries: state.enquiries,
      currentUser,
      adminUser,
      permissions: permissionsFor(adminUser),
      can: (permission) => permissionsFor(adminUser).includes(permission),
      register,
      login,
      logout,
      requestPasswordReset,
      resetPassword,
      adminLogin,
      adminLogout,
      saveProperty: (property) =>
        patch((prev) => {
          const existing = prev.properties.some((p) => p.id === property.id);
          return log(
            {
              ...prev,
              properties: existing
                ? prev.properties.map((p) => (p.id === property.id ? property : p))
                : [property, ...prev.properties],
            },
            "Properties",
            existing ? "Updated property" : "Created property",
            property.title,
          );
        }),
      deleteProperty: (id) =>
        patch((prev) =>
          log(
            { ...prev, properties: prev.properties.filter((p) => p.id !== id) },
            "Properties",
            "Deleted property",
            prev.properties.find((p) => p.id === id)?.title ?? id,
          ),
        ),
      saveNews: (article) =>
        patch((prev) => {
          const existing = prev.news.some((n) => n.id === article.id);
          return log(
            {
              ...prev,
              news: existing
                ? prev.news.map((n) => (n.id === article.id ? article : n))
                : [article, ...prev.news],
            },
            "News",
            existing ? "Updated article" : "Published article",
            article.title,
          );
        }),
      deleteNews: (id) =>
        patch((prev) =>
          log(
            { ...prev, news: prev.news.filter((n) => n.id !== id) },
            "News",
            "Deleted article",
            prev.news.find((n) => n.id === id)?.title ?? id,
          ),
        ),
      saveUser: (user) =>
        patch((prev) => {
          const existing = prev.users.some((u) => u.id === user.id);
          return log(
            {
              ...prev,
              users: existing
                ? prev.users.map((u) => (u.id === user.id ? user : u))
                : [...prev.users, user],
            },
            "Users",
            existing ? "Updated user" : "Created user",
            `${user.name} (${user.role}, ${user.status})`,
          );
        }),
      deleteUser: (id) =>
        patch((prev) =>
          log(
            {
              ...prev,
              users: prev.users.filter((u) => u.id !== id),
              sessionUserId: prev.sessionUserId === id ? null : prev.sessionUserId,
              adminSessionId: prev.adminSessionId === id ? null : prev.adminSessionId,
            },
            "Users",
            "Deleted user",
            prev.users.find((u) => u.id === id)?.email ?? id,
          ),
        ),
      addEnquiry: (input) =>
        patch((prev) => ({
          ...prev,
          enquiries: [
            {
              ...input,
              id: uid("e"),
              status: "New",
              createdAt: new Date().toISOString(),
            },
            ...prev.enquiries,
          ],
        })),
      setEnquiryStatus: (id, status) =>
        patch((prev) =>
          log(
            {
              ...prev,
              enquiries: prev.enquiries.map((e) => (e.id === id ? { ...e, status } : e)),
            },
            "Enquiries",
            `Marked enquiry ${status}`,
            prev.enquiries.find((e) => e.id === id)?.name ?? id,
          ),
        ),
      deleteEnquiry: (id) =>
        patch((prev) =>
          log(
            { ...prev, enquiries: prev.enquiries.filter((e) => e.id !== id) },
            "Enquiries",
            "Deleted enquiry",
            prev.enquiries.find((e) => e.id === id)?.name ?? id,
          ),
        ),
    };
  }, [
    state,
    hydrated,
    patch,
    register,
    login,
    logout,
    requestPasswordReset,
    resetPassword,
    adminLogin,
    adminLogout,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
