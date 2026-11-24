import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, X } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { useStore } from "@/lib/mock-store";
import { OFFICE_MAP_URL } from "@/lib/location";

export function Footer() {
  const { settings } = useStore();
  return (
    <footer className="border-t border-navy-soft bg-navy text-white/75">
      <div className="pv-container grid grid-cols-2 gap-x-6 gap-y-8 py-10 sm:py-12 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr] lg:gap-10">
        <div className="col-span-2 lg:col-span-1">
          <BrandLogo compact inverted />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">{settings.tagline}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { href: settings.socialInstagram, Icon: Instagram, label: "Instagram" },
              { href: settings.socialFacebook, Icon: Facebook, label: "Facebook" },
              { href: settings.socialLinkedin, Icon: Linkedin, label: "LinkedIn" },
              { href: settings.socialX, Icon: X, label: "X" },
            ]
              .filter((item) => item.href.trim())
              .map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-11 w-11 place-items-center rounded-lg border border-white/20 transition-colors hover:bg-white/10"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
          </div>
        </div>
        <nav aria-label="Explore links">
          <h2 className="text-sm font-semibold text-white">Explore</h2>
          <ul className="mt-3 text-sm">
            <li>
              <Link
                to="/buy"
                search={{ q: undefined }}
                className="flex min-h-11 items-center hover:text-white"
              >
                Buy a property
              </Link>
            </li>
            <li>
              <Link
                to="/rent"
                search={{ q: undefined }}
                className="flex min-h-11 items-center hover:text-white"
              >
                Rent a property
              </Link>
            </li>
            <li>
              <Link
                to="/sale"
                search={{ q: undefined }}
                className="flex min-h-11 items-center hover:text-white"
              >
                Sell a property
              </Link>
            </li>
            <li>
              <Link to="/list-property" className="flex min-h-11 items-center hover:text-white">
                List your property
              </Link>
            </li>
          </ul>
        </nav>
        <nav aria-label="Company links">
          <h2 className="text-sm font-semibold text-white">Braj Setu</h2>
          <ul className="mt-3 text-sm">
            <li>
              <Link to="/about" className="flex min-h-11 items-center hover:text-white">
                About us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="flex min-h-11 items-center hover:text-white">
                Contact us
              </Link>
            </li>
            <li>
              <Link to="/terms" className="flex min-h-11 items-center hover:text-white">
                Terms of use
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="flex min-h-11 items-center hover:text-white">
                Privacy policy
              </Link>
            </li>
          </ul>
        </nav>
        <div className="col-span-2 min-w-0 lg:col-span-1">
          <h2 className="text-sm font-semibold text-white">Get in touch</h2>
          <ul className="mt-4 space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="mt-1 h-4 w-4 shrink-0 text-gold" />
              <a
                href={OFFICE_MAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="leading-relaxed hover:text-white"
              >
                {settings.address}
              </a>
            </li>
            {settings.contactPhone && (
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-gold" />
                <a
                  href={`tel:${settings.contactPhone.replace(/\s/g, "")}`}
                  className="hover:text-white"
                >
                  {settings.contactPhone}
                </a>
              </li>
            )}
            <li className="flex items-start gap-3">
              <Mail className="mt-1 h-4 w-4 shrink-0 text-gold" />
              <a
                href={`mailto:${settings.contactEmail}`}
                className="min-w-0 break-all hover:text-white"
              >
                {settings.contactEmail}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="pv-container py-6">
          <p className="max-w-4xl text-xs leading-relaxed text-white/60">
            Property information is provided for your reference. Prices and availability may change.
            Please confirm details and complete independent checks before a transaction.
          </p>
          <p className="mt-4 text-xs text-white/60">
            © {new Date().getFullYear()} {settings.siteName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
