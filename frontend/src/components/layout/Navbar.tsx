import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Building2,
  ChevronDown,
  Compass,
  Home,
  LogOut,
  Menu,
  Newspaper,
  Plus,
  Smartphone,
  UserCircle,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/mock-store";

type RoutePath = "/" | "/buy" | "/rent" | "/sale" | "/about" | "/contact" | "/login";

type MenuColumn = {
  title: string;
  links: { label: string; to: RoutePath }[];
};

type NavMenu = {
  key: string;
  label: string;
  to?: RoutePath;
  icon: typeof Home;
  columns: MenuColumn[];
  compact?: boolean;
};

const cityLinks = [
  "Vrindavan",
  "Mathura",
  "Govardhan",
  "Barsana",
  "Gokul",
  "Raman Reti",
  "Chhatikara",
];

const emergingLinks = [
  "Rukmani Vihar",
  "Sunrakh Road",
  "Masani",
  "Krishna Nagar",
  "Highway Plaza",
  "Kosi Kalan",
  "Braj Mandal Villages",
];

const menus: NavMenu[] = [
  {
    key: "buyers",
    label: "For Buyers",
    to: "/buy",
    icon: Home,
    columns: [
      {
        title: "Top locations in Braj",
        links: cityLinks.map((city) => ({ label: `Properties for sale in ${city}`, to: "/buy" })),
      },
      {
        title: "Emerging pockets",
        links: emergingLinks.map((city) => ({ label: `Homes for sale in ${city}`, to: "/buy" })),
      },
      {
        title: "Popular searches",
        links: [
          { label: "Ready-to-move flats", to: "/buy" },
          { label: "Independent houses", to: "/buy" },
          { label: "Residential plots", to: "/buy" },
          { label: "Farm houses near Vrindavan", to: "/buy" },
          { label: "Commercial shops", to: "/buy" },
          { label: "Luxury villas", to: "/buy" },
        ],
      },
      {
        title: "Buyer services",
        links: [
          { label: "Site visit planning", to: "/contact" },
          { label: "Title verification help", to: "/contact" },
          { label: "Price guidance", to: "/contact" },
          { label: "Loan assistance", to: "/contact" },
          { label: "Meet an advisor", to: "/about" },
        ],
      },
    ],
  },
  {
    key: "tenants",
    label: "For Tenants",
    to: "/rent",
    icon: Building2,
    columns: [
      {
        title: "Top rental locations",
        links: cityLinks.map((city) => ({ label: `Flats for rent in ${city}`, to: "/rent" })),
      },
      {
        title: "Emerging rental pockets",
        links: emergingLinks.map((city) => ({ label: `Rentals in ${city}`, to: "/rent" })),
      },
      {
        title: "Rental categories",
        links: [
          { label: "1 RK apartments", to: "/rent" },
          { label: "1 BHK apartments", to: "/rent" },
          { label: "Family houses", to: "/rent" },
          { label: "Furnished rentals", to: "/rent" },
          { label: "Student friendly homes", to: "/rent" },
          { label: "Shop rentals", to: "/rent" },
        ],
      },
    ],
  },
  {
    key: "sellers",
    label: "For Sellers",
    to: "/sale",
    icon: Plus,
    columns: [
      {
        title: "Sell with Braj Setu",
        links: [
          { label: "Request valuation", to: "/contact" },
          { label: "Seller advisory", to: "/sale" },
          { label: "Photography support", to: "/sale" },
          { label: "Verified buyer visits", to: "/contact" },
        ],
      },
      {
        title: "Property types",
        links: [
          { label: "Sell a flat", to: "/sale" },
          { label: "Sell a house", to: "/sale" },
          { label: "Sell a plot", to: "/sale" },
          { label: "Sell a shop", to: "/sale" },
          { label: "Sell farm land", to: "/sale" },
        ],
      },
      {
        title: "Seller resources",
        links: [
          { label: "Pricing checklist", to: "/contact" },
          { label: "Documents required", to: "/contact" },
          { label: "Market demand in Braj", to: "/buy" },
          { label: "Talk to our team", to: "/contact" },
        ],
      },
    ],
  },
  {
    key: "services",
    label: "Services",
    icon: Compass,
    compact: true,
    columns: [
      {
        title: "Property services",
        links: [
          { label: "Property consultation", to: "/contact" },
          { label: "Site visits", to: "/contact" },
          { label: "Legal coordination", to: "/contact" },
          { label: "Investment guidance", to: "/about" },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "About Braj Setu", to: "/about" },
          { label: "Contact office", to: "/contact" },
          { label: "Browse listings", to: "/buy" },
        ],
      },
    ],
  },
  {
    key: "news",
    label: "News & Guide",
    icon: Newspaper,
    compact: true,
    columns: [
      {
        title: "Property market guide",
        links: [
          { label: "Real estate news", to: "/" },
          { label: "Buying guide", to: "/buy" },
          { label: "Rental guide", to: "/rent" },
          { label: "Housing research", to: "/about" },
        ],
      },
    ],
  },
];

const locationMenu: NavMenu = {
  key: "locations",
  label: "All Braj",
  icon: Compass,
  compact: true,
  columns: [
    {
      title: "Browse by location",
      links: [
        { label: "Vrindavan", to: "/buy" },
        { label: "Mathura", to: "/buy" },
        { label: "Govardhan", to: "/buy" },
        { label: "Barsana", to: "/buy" },
        { label: "Gokul", to: "/buy" },
      ],
    },
  ],
};

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const { currentUser, logout, settings } = useStore();
  const desktopMenus = [locationMenu, ...menus];
  const activeDesktopMenu = desktopMenus.find((menu) => menu.key === activeMenu);

  useEffect(() => {
    function closeOnOutside(event: MouseEvent) {
      if (!navRef.current?.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveMenu(null);
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  function closeMenus() {
    setActiveMenu(null);
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 px-2 py-2 sm:px-4">
      <nav
        ref={navRef}
        onMouseLeave={() => setActiveMenu(null)}
        className="relative mx-auto max-w-[88rem] rounded-full border border-gold/25 bg-[linear-gradient(135deg,#091933_0%,#172d54_44%,#3b2b66_100%)] px-2 text-background shadow-[0_22px_48px_-28px_rgba(18,35,63,0.95),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-xl sm:px-3"
      >
        <div className="grid h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 lg:gap-3">
          <Link
            to="/"
            onClick={closeMenus}
            className="pv-smooth-state flex h-13 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/70 bg-background px-3 shadow-[0_12px_26px_-18px_rgba(255,250,240,0.9)] hover:scale-[1.02] sm:w-32 [&_img]:h-10 [&_img]:sm:h-11"
          >
            <BrandLogo compact />
            <span className="sr-only">{settings.siteName}</span>
          </Link>

          <div className="relative hidden min-w-0 lg:block">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 rounded-l-full bg-gradient-to-r from-[#13284b] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 rounded-r-full bg-gradient-to-l from-[#2f2a61] to-transparent" />
            <div className="pv-no-scrollbar flex min-w-0 items-center gap-1 overflow-x-auto rounded-full border border-white/10 bg-white/[0.07] p-1 shadow-[inset_0_1px_10px_rgba(255,255,255,0.06)]">
              <DesktopTrigger
                menu={locationMenu}
                active={activeMenu === locationMenu.key}
                onOpen={setActiveMenu}
              />
              {menus.map((menu) => (
                <DesktopTrigger
                  key={menu.key}
                  menu={menu}
                  active={activeMenu === menu.key}
                  onOpen={setActiveMenu}
                />
              ))}
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-2">
            <a
              href={`tel:${settings.contactPhone.replace(/\s/g, "")}`}
              className="pv-smooth-state hidden h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3.5 text-sm font-bold whitespace-nowrap text-background/95 hover:border-gold/35 hover:bg-white/[0.13] xl:inline-flex"
            >
              <Smartphone className="h-4 w-4" />
              Call Advisor
            </a>
            {currentUser ? (
              <button
                type="button"
                onClick={() => {
                  logout();
                  closeMenus();
                }}
                className="pv-smooth-state hidden h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3.5 text-sm font-bold text-background/95 hover:bg-white/[0.13] md:inline-flex"
              >
                <LogOut className="h-4 w-4" />
                <span className="max-w-[8rem] truncate">{currentUser.name}</span>
              </button>
            ) : (
              <Link
                to="/login"
                onClick={closeMenus}
                className="pv-smooth-state hidden h-11 items-center gap-2 rounded-full bg-background px-4 text-sm font-black text-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] hover:scale-[1.02] md:inline-flex"
              >
                <UserCircle className="h-4 w-4" />
                Login
              </Link>
            )}
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => {
                setOpen((v) => !v);
                setActiveMenu(null);
              }}
              className="pv-smooth-state grid h-11 w-11 place-items-center rounded-full bg-background text-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] hover:scale-[1.03] lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {activeDesktopMenu ? <MegaMenu menu={activeDesktopMenu} onNavigate={closeMenus} /> : null}
      </nav>

      <div
        className={cn(
          "mx-2 overflow-hidden rounded-3xl border border-border bg-background shadow-[var(--shadow-lift)] transition-[max-height] duration-[var(--motion-page)] ease-[var(--motion-ease)] sm:mx-4 lg:hidden",
          open ? "max-h-[90vh]" : "max-h-0",
        )}
      >
        <div className="pv-container max-h-[calc(90vh-4rem)] overflow-y-auto py-4">
          <MobileMenu menu={locationMenu} onNavigate={closeMenus} />
          {menus.map((menu) => (
            <MobileMenu key={menu.key} menu={menu} onNavigate={closeMenus} />
          ))}
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Link
              to="/contact"
              onClick={closeMenus}
              className="pv-tap flex items-center justify-center rounded-full bg-navy text-sm font-semibold text-background"
            >
              Contact advisor
            </Link>
            {currentUser ? (
              <button
                type="button"
                onClick={() => {
                  logout();
                  closeMenus();
                }}
                className="pv-tap flex items-center justify-center rounded-full border border-border text-sm font-semibold text-navy"
              >
                Sign out
              </button>
            ) : (
              <Link
                to="/login"
                onClick={closeMenus}
                className="pv-tap flex items-center justify-center rounded-full border border-border text-sm font-semibold text-navy"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function DesktopTrigger({
  menu,
  active,
  onOpen,
}: {
  menu: NavMenu;
  active: boolean;
  onOpen: (key: string | null) => void;
}) {
  return (
    <button
      type="button"
      aria-expanded={active}
      onMouseEnter={() => onOpen(menu.key)}
      onFocus={() => onOpen(menu.key)}
      onClick={() => onOpen(active ? null : menu.key)}
      className={cn(
        "pv-smooth-state relative inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-bold whitespace-nowrap text-background/85 hover:bg-background/12 hover:text-background xl:px-4",
        active &&
          "bg-gradient-to-r from-gold to-[#f4d46b] text-navy shadow-[0_10px_20px_-16px_rgba(201,161,53,0.95)]",
      )}
    >
      <menu.icon className="h-4 w-4" />
      {menu.label}
      <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", active && "rotate-180")} />
    </button>
  );
}

function MegaMenu({ menu, onNavigate }: { menu: NavMenu; onNavigate: () => void }) {
  return (
    <div
      onMouseEnter={() => undefined}
      className={cn(
        "absolute top-[calc(100%-0.15rem)] left-1/2 hidden -translate-x-1/2 pt-4 lg:block",
        menu.compact ? "w-[min(34rem,calc(100vw-3rem))]" : "w-[min(68rem,calc(100vw-3rem))]",
      )}
    >
      <div className="relative max-h-[min(32rem,calc(100vh-8rem))] overflow-y-auto rounded-[1.35rem] border border-gold/25 bg-[linear-gradient(145deg,#fffefa_0%,#fff7df_46%,#ffffff_100%)] p-6 text-navy shadow-[0_30px_80px_-28px_rgba(18,35,63,0.55),inset_0_1px_0_rgba(255,255,255,0.9)]">
        <span className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 rounded-[0.2rem] border-t border-l border-gold/25 bg-[#fffefa]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gold via-[#f5d66c] to-[#6d3ff1]" />
        <div
          className={cn(
            "grid gap-7",
            menu.columns.length === 1
              ? "grid-cols-1"
              : menu.columns.length === 2
                ? "grid-cols-2"
                : menu.columns.length === 3
                  ? "grid-cols-3"
                  : "grid-cols-4",
          )}
        >
          {menu.columns.map((column) => (
            <div key={column.title} className="min-w-0">
              <p className="mb-4 border-b border-gold/20 pb-3 text-sm font-black text-navy">
                {column.title}
              </p>
              <ul className="space-y-1">
                {column.links.map((item) => (
                  <li key={`${column.title}-${item.label}`}>
                    <Link
                      to={item.to}
                      onClick={onNavigate}
                      className="pv-smooth-state block rounded-xl px-3 py-2.5 text-sm font-semibold text-navy-soft hover:bg-gold/12 hover:text-navy"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MobileMenu({ menu, onNavigate }: { menu: NavMenu; onNavigate: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-border py-2 last:border-b-0">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
        className="pv-tap flex w-full items-center justify-between gap-3 text-left text-base font-bold text-navy"
      >
        <span className="flex items-center gap-2">
          <menu.icon className="h-4 w-4 text-gold-deep" />
          {menu.label}
        </span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200",
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="grid gap-4 pb-3 sm:grid-cols-2">
            {menu.columns.map((column) => (
              <div key={column.title}>
                <p className="mt-3 mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {column.title}
                </p>
                <div className="grid gap-1">
                  {column.links.map((item) => (
                    <Link
                      key={`${column.title}-${item.label}`}
                      to={item.to}
                      onClick={onNavigate}
                      className="pv-tap flex items-center rounded-md px-2 text-sm font-medium text-navy-soft hover:bg-smoke hover:text-navy"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
