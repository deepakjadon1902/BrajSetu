import { Link } from "@tanstack/react-router";
import { ExternalLink, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, X } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { useStore } from "@/lib/mock-store";
import { OFFICE_MAP_URL } from "@/lib/location";

export function Footer() {
  const { settings } = useStore();
  return (
    <footer className="mt-20 bg-navy text-background/80">
      <div className="pv-container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <BrandLogo compact inverted />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">{settings.tagline}</p>
          <div className="mt-5 flex gap-2">
            {[
              { href: settings.socialInstagram, Icon: Instagram, label: "Instagram" },
              { href: settings.socialFacebook, Icon: Facebook, label: "Facebook" },
              { href: settings.socialLinkedin, Icon: Linkedin, label: "LinkedIn" },
              { href: settings.socialX, Icon: X, label: "X" },
            ]
              .filter((item) => item.href.trim().length > 0)
              .map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${settings.siteName} on ${label}`}
                  className="pv-smooth-state grid h-11 w-11 place-items-center rounded-full border border-background/20 hover:border-gold hover:text-gold"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wide text-background uppercase">Explore</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link to="/buy" search={{ q: undefined }} className="hover:text-gold">
                Buy a property
              </Link>
            </li>
            <li>
              <Link to="/rent" search={{ q: undefined }} className="hover:text-gold">
                Rent a property
              </Link>
            </li>
            <li>
              <Link to="/sale" search={{ q: undefined }} className="hover:text-gold">
                Sell with us
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-gold">
                About Braj Setu
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wide text-background uppercase">Company</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link to="/contact" className="hover:text-gold">
                Contact us
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-gold">
                Sign in
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-gold">
                Terms &amp; Conditions
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-gold">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wide text-background uppercase">
            Reach us
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <a
                href={OFFICE_MAP_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-start gap-1 hover:text-gold"
              >
                <span>{settings.address}</span>
                <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              </a>
            </li>
            <li className="flex gap-3">
              <Phone className="h-4 w-4 shrink-0 text-gold" />
              <a
                href={`tel:${settings.contactPhone.replace(/\s/g, "")}`}
                className="hover:text-gold"
              >
                {settings.contactPhone}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="h-4 w-4 shrink-0 text-gold" />
              <a href={`mailto:${settings.contactEmail}`} className="hover:text-gold">
                {settings.contactEmail}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-background/10">
        <div className="pv-container flex flex-col gap-2 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {settings.siteName}. All rights reserved.
          </p>
          <p>RERA registered · Independent advisory</p>
        </div>
      </div>
    </footer>
  );
}
