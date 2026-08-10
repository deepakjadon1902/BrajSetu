import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner";
import { StoreProvider, useStore } from "@/lib/mock-store";
import { NotificationBar } from "@/components/NotificationBar";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-extrabold text-navy">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-navy">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-navy px-6 py-3 text-sm font-semibold text-background"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-navy">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-navy px-6 py-3 text-sm font-semibold text-background"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-navy"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "PropVista | Premium Property Marketplace" },
      {
        name: "description",
        content:
          "PropVista is a boutique property marketplace for buying, renting and selling flats, houses, plots, shops and farm houses.",
      },
      { name: "author", content: "PropVista Realty" },
      { property: "og:title", content: "PropVista | Premium Property Marketplace" },
      {
        property: "og:description",
        content: "Buy, rent and sell verified property with a boutique advisory team.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <SiteMeta />
        {isAdmin ? (
          /* Admin console renders standalone, without the public site chrome. */
          <Outlet />
        ) : (
          <div className="flex min-h-screen flex-col">
            <SiteAnnouncement />
            <Navbar />
            <main className="flex-1">
              {/* Required: nested routes render here. */}
              <Outlet />
            </main>
            <Footer />
          </div>
        )}
        <Toaster />
      </StoreProvider>
    </QueryClientProvider>
  );
}

/** Applies admin-managed metadata to the document head on the client. */
function SiteMeta() {
  const { settings, hydrated } = useStore();

  useEffect(() => {
    if (!hydrated) return;
    document.title = settings.metaTitle;
    const selectors: Array<[string, string]> = [
      ['meta[name="description"]', settings.metaDescription],
      ['meta[property="og:title"]', settings.metaTitle],
      ['meta[property="og:description"]', settings.metaDescription],
    ];
    for (const [selector, content] of selectors) {
      const el = document.head.querySelector(selector);
      if (el) el.setAttribute("content", content);
    }
  }, [hydrated, settings.metaTitle, settings.metaDescription]);

  return null;
}

function SiteAnnouncement() {
  const { settings, hydrated } = useStore();
  if (!hydrated || !settings.announcementEnabled || !settings.announcementMessage)
    return null;
  return (
    <NotificationBar key={settings.announcementMessage} tone={settings.announcementTone}>
      {settings.announcementMessage}
    </NotificationBar>
  );
}
