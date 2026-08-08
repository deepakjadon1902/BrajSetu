# PropVista Showcase

PropVista — Lovable Build Prompt (Frontend Only)

Copy everything below into Lovable as your project prompt.

PROJECT

Build PropVista, a premium real estate marketplace frontend (property Buy / Rent / Sale platform). This is the public-facing website only — no admin panel in this build. Use React + TypeScript + Tailwind CSS. Structure the code cleanly inside a frontend/ folder mindset (component-based, typed props, no backend calls yet — use realistic mock/placeholder data and typed interfaces so a real API can be wired in later).

DESIGN THEME (strict — follow exactly)

Premium, minimal, trust-building real estate aesthetic — clean and light-led, similar in spirit to top-tier real estate SaaS UI (crisp white space, bold confident headline typography, large architectural photography, pill-shaped controls). Keep the palette simple — only 3 core colors, no rainbow of accents.

Color system — use a strict 60:30:10 ratio

60% Dominant — clean white / off-white / light neutral grays: #FFFFFF, #FAFAFA (White Smoke), #EFF1F2 (Ice Gray), #E8EBF1 (Cool Gray Blue) — used for page backgrounds, card backgrounds, section band backgrounds (alternate white and Ice Gray between sections so the page has gentle rhythm without ever feeling "dark"). This should be the color the eye rests on most.

30% Secondary — deep navy / charcoal (e.g. #0F1B2B – #1C2B3A, or near-black #252525 for pure text): all headings, body text, navbar logo/links, icons, dark pill overlays on card images (see Cards section), footer background. This is what gives the "premium" weight against the white space.

10% Accent — warm gold / bronze (e.g. #C9A24B – #B8894A): reserved strictly for the primary CTA button, price tags, active tab/filter/toggle state, and small icon highlights. Everything else stays navy-on-white/gray.

Typography: Inter (or an Inter-equivalent geometric sans) for everything — bold/extrabold weight for headlines (tight line-height, dark navy/near-black, 40–64px on desktop hero, scaling down responsively), regular/medium weight for body and nav. One typeface family used consistently across headings and body, varied only by weight/size — clean, modern, confident, not decorative.

Hero section — reference layout

Model the homepage hero on this structure: a large, bold two-line headline on the left (dark navy text on white/light background), a short one-to-two-line supporting sentence in muted gray to its right or below, and a large, high-quality architectural/property photograph anchoring the section (a modern house/building with clean landscaping — use a premium stock-style placeholder image). Overlapping the bottom of the hero photo, place a floating pill-shaped search module: a segmented toggle (Buy / Sell / Rent) at the top of the pill, an input field below it (icon + placeholder text like "House with a great school nearby, in Irvine, CA" style natural-language placeholder), with a subtle mic/voice icon and a circular arrow submit button on the right, all inside a soft-shadowed white rounded card floating above the image edge.

Navbar — reference layout

Logo on the far left. Centered (or left-of-center) horizontal nav links: Buy · Rent · Sale · About · Contact (dot-separated or plain spacing, small-caps or sentence case, navy text). A single filled pill-shaped CTA button on the far right (e.g. "Contact Us" in navy or gold fill, white text). Keep the navbar white/transparent with a hairline bottom border or soft shadow — not a solid dark bar.

Cards — proper premium proportions

Use two card styles, mixed intentionally across the site:

Style A — "Details overlay" card (used for discovery/category tiles, e.g. homepage "Explore" grid): full-bleed photo (~4:3), gradient scrim at the bottom for legibility, title + location in white text over the image, a small dark rounded-pill "Details" button bottom-right sitting on the photo itself.

Style B — "Info below" card (used for main listing grids, e.g. "Homes For You," search results): photo on top (~4:3, fixed height, never distorted), then a white card body below with: title (bold, dark), price (bold, right-aligned or same row as title), address/locality (muted gray, small), and a bottom meta row of icon+label chips (beds, baths, area) evenly spaced.

Compact/list card: horizontal layout, small square-ish thumbnail (~1:1) on the left, details on the right — used specifically in the split search-results view (see Listing Page Layout below)

Consistent internal padding, consistent corner radius across all card types (rounded-2xl), soft low-opacity shadow instead of hard borders

Price and category badge always in the same position across cards of the same style for visual rhythm

Search bars, filter pills, and buttons throughout the site should echo the hero's fully-rounded "pill" shape language for a consistent, modern feel

Effects — subtle, purposeful, never gimmicky

Hover on cards: gentle lift (translateY -2 to -4px) + shadow deepen, ~200ms ease-out — nothing bouncy or exaggerated

Buttons: slight scale (1.02) or background-shift on hover, not both at once

Page/section entrance: soft fade-up on scroll for listing grids and hero content (once, not repeating/looping)

Image loading: skeleton shimmer, never a blank flash

Sticky elements (navbar, booking panel on Property Detail) should have a subtle shadow/blur backdrop when scrolled past the top, so they read as "elevated" over content

The floating pill search module on the hero should have a pronounced but soft drop shadow so it visually "lifts" off the photo behind it

Avoid: gradients as a crutch, heavy drop shadows, neon glows, parallax gimmicks, autoplay carousels with motion — these read as template-y, not premium

Use effects to guide attention (toward CTAs, prices, key actions) — never purely decorative

WCAG-AA contrast throughout, verified for gold-on-white and navy-on-white pairings specifically

Fully responsive: mobile, tablet, laptop, desktop breakpoints; card grid should reflow 1 → 2 → 3 → 4 columns cleanly, never awkward gaps; on mobile, the floating pill search module stacks cleanly below the hero photo rather than overlapping

PAGES TO BUILD

1. Home

Premium hero section following the "Hero — reference layout" spec above: bold two-line headline + supporting line, large architectural photo, and a floating pill-shaped search module (Buy/Rent/Sale segmented toggle + natural-language input + mic icon + circular submit arrow) overlapping the bottom of the photo

Live top notification bar (dismissible announcement strip — static/mock data)

"Explore Our Homes" section: centered heading + short subline, a horizontal row of rounded filter pills (e.g. New to Market, 3D Tours, Most Viewed, Open Houses, Price Drop, Luxury Homes, Sold — one active/selected in dark fill, rest outlined), followed by a 3-column grid of Style A "Details overlay" cards

"Homes For You" section: centered heading, 3–4 column grid of Style B "Info below" cards with full meta rows (beds/baths/area)

"The Smarter Way to Sell Your Home" split section: two-column layout — left side has a heading (mixed weight, e.g. bold black + muted gray span), short paragraph, a 2–3 item checklist (checkmark icon + label), and a pill CTA button ("Learn More"); right side has a large single property photo. Stack vertically on mobile, image below text.

Discovery row: 3-column grid of Style A overlay cards for site sections — "Search Neighborhoods," "New Homes," "Agent Directory" — each with a relevant photo, bold white title + short description overlaid, and a dark pill button

"Real Estate News" section: centered heading + subline, horizontal scrollable/carousel row of news cards (photo top, bold headline, 1-line excerpt, date), with left/right arrow nav controls

Footer with quick links, contact, social icons

2. Buy / Rent / Sale (category listing pages — one reusable template)

Model this on a split search-results layout:

Top bar: the same pill-shaped search bar from the hero (category toggle + input + mic + filter-toggle icon), plus a right-aligned "Save Search" pill button

Left panel — Filters: a card-style filter panel (collapsible on tablet/mobile) with Location input, Price Range (dual slider + min/max labels), Property Type (icon toggle buttons: House, Medical/Office, Shophouse, Apartment), Bedroom/Bathroom counters, Amenities (checkbox pills: Backyard, Fireplace, Garden, Storage, Gym, Swimming Pool, Surveillance Cameras, Laundry), and a full-width "Apply" pill button pinned at the panel bottom

Center panel — Results list: result count heading (e.g. "139 Homes For Sale") + sort dropdown + list/grid view toggle icon, then a scrollable vertical stack of compact horizontal cards (thumbnail left, price + "View Details" link top row, title, address, meta chips below)

Right panel — Map: a sticky embedded map placeholder with pin markers matching the visible listings, zoom controls, and layer/filter icon buttons in the top-right corner of the map

On tablet: map collapses to a toggle ("List / Map" switch); on mobile: filters become a full-screen slide-up drawer triggered by a filter icon button, and the layout becomes a single-column results list with a floating "Map" pill button to switch views

Empty state for no results

2b. Property listing detail preview card (used within results + "select a property" flow)

When a listing is highlighted/selected from the results list, show an expanded preview panel: larger photo, status pill ("New / Active"), tab row (Overview / Reviews / Details), a description paragraph, and a mini location map with pins — this can live as a modal or side-panel state on the listing page, and reuse the same component on the full Property Detail page.

3. Property Detail Page

Full image gallery (lightbox-style, multi-image)

Deep specs table (price, area, bedrooms, furnishing, amenities, category, intent — sale/rent)

Location block with embedded map placeholder

Sticky booking panel: WhatsApp Click-to-Chat button (pre-filled message) and Click-to-Call button (tel: link)

Similar listings section at bottom

4. About Us

Brand story section, mission/values, team or trust badges

5. Terms & Conditions / Privacy Policy

Clean, readable legal page template (reusable for both, static content placeholders)

6. Contact Us

Working contact form UI (name, email, phone, message) — form should be fully built with validation states, but submit just needs to call a placeholder onSubmit handler (real Resend integration comes later on backend)

WhatsApp/call quick-link buttons

Embedded map placeholder

Office address/hours block

7. Login / Register

Single clean auth screen with "Continue with Google" button as the primary/only sign-in method (styled prominently, no manual email/password fields — matches Google OAuth-only spec)

Simple, centered card layout consistent with the premium theme

SHARED COMPONENTS TO BUILD

Header/Navbar (logo, nav links, search icon, login/profile state, sticky on scroll)

Top/bottom notification bar (reusable, dismissible)

Property Card (compact, standard, featured variants as one flexible component)

Filter/Search Bar (reusable across Home + listing pages)

WhatsApp Button + Call Button (reusable, reused on Property Detail and Contact)

Footer

Loading skeleton states for listing grids

Empty/error states

DATA MODEL (use as TypeScript interfaces for mock data)

interface Property {
  id: string;
  title: string;
  category: 'Shop' | 'Flat' | 'Plot' | 'House' | 'Farm House';
  intent: 'Sale' | 'Rent';
  price: number;
  location: { city: string; locality: string };
  specs: { area: number; bedrooms?: number; bathrooms?: number; furnishing?: string };
  images: string[];
  amenities: string[];
  featured?: boolean;
}


Seed each listing page and the homepage with ~12–18 realistic mock properties across all categories so the UI feels populated.

TECHNICAL NOTES

TypeScript throughout, typed props and interfaces

Tailwind CSS for all styling — no inline styles

Component-based architecture (organize into components/, pages/, types/, data/ mock folders)

Image optimization mindset: use loading="lazy" on listing images, and structure components so a CDN (ImageKit) URL can later replace placeholder image sources with no refactor

Keep API/data-fetching logic isolated in a services/ or lib/ layer with placeholder functions (e.g. getProperties()) returning mock data — so backend wiring later is a drop-in swap, not a rewrite

No payment, no multi-language, no native app — out of scope for this build

RESPONSIVENESS — MUST WORK PERFECTLY ON EVERY DEVICE

This is a hard requirement, not a nice-to-have. Build mobile-first, then scale up. Test every page/component mentally at these breakpoints:

Mobile (< 640px): single column throughout. Navbar collapses to logo + hamburger menu (slide-in full-height drawer with nav links + CTA button stacked). Hero headline drops to ~28–32px, hero photo shortens, floating pill search module becomes a stacked (non-overlapping) block directly below the photo, full width with comfortable tap targets (min 44px height). Filter panel on listing pages becomes a full-screen slide-up drawer, triggered by a filter icon button in the top bar; map becomes a toggle, not a permanent panel. Card grids go to 1 column. Bottom-sticky WhatsApp/Call buttons on Property Detail become a full-width fixed bar at the screen bottom. News carousel becomes horizontally swipeable with visible peek of the next card.

Small tablet (640–1024px): 2-column card grids. Navbar keeps full links if they fit, otherwise collapses to hamburger. On listing pages, filters collapse into a toggleable drawer/accordion; map and results can stack (map on top, collapsible) rather than full 3-panel split.

Laptop (1024–1280px): 3-column card grids. Full split layout on listing pages (filters + results + map) becomes available, slightly tightened spacing.

Desktop (1280px+): 3–4 column card grids, full split listing layout, max content width (e.g. max-w-7xl) centered with generous side margins so content never stretches edge-to-edge on very large/ultra-wide monitors.

Additional cross-device rules:

All tap/click targets minimum 44×44px on touch devices

No horizontal scroll or overflow at any breakpoint except intentional carousels

Images use responsive srcset-style sizing logic (or object-fit: cover with fixed aspect-ratio containers) so photos never distort or overflow their card on any screen

Typography scales fluidly (use Tailwind responsive text classes, e.g. text-2xl md:text-4xl lg:text-6xl) rather than jumping abruptly

Test and ensure the floating hero search pill, sticky navbar, and sticky booking panel never overlap other content or get clipped at any viewport width

Forms (Contact, Login) remain single-column and comfortably tappable on mobile, with inputs full-width

GENERAL UI/UX NOTE

The overall interaction pattern, spacing rhythm, section structure (hero → filter-pill discovery grid → featured listings → split sell-pitch → discovery/category tiles → news carousel → footer), and search/filter/map experience should follow the structure described above closely. Do not copy any specific brand name, logo, or exact marketing copy from reference material — generate original PropVista-branded text, using the SOP's actual categories (Shop, Flat, Plot, House, Farm House) and Buy/Rent/Sale intents throughout instead of generic placeholders.

OUTCOME

The result should feel like a polished, investor-ready real estate brand website — the kind of premium look you'd expect from a boutique property consultancy, not a generic listings template.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://propvistaa.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8e328319-51e2-4538-955c-942e50e55c0e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
