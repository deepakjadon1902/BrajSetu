import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions | Braj Setu Properties" },
      {
        name: "description",
        content:
          "The terms that govern your use of the Braj Setu Properties property marketplace, listings and advisory services.",
      },
      { property: "og:title", content: "Terms & Conditions | Braj Setu Properties" },
      {
        property: "og:description",
        content: "Terms governing use of Braj Setu Properties services.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      updated="1 September 2026"
      intro="These terms govern your use of Braj Setu Properties for browsing, enquiring, saving and managing property listings across Vrindavan, Mathura, Goverdhan, Barsana and nearby Braj Mandal locations."
      sections={[
        {
          heading: "1. Using this website",
          body: [
            "Braj Setu Properties provides property information for personal and business enquiry use. You agree not to scrape, resell, copy or republish listing content without written permission.",
            "You must be at least 18 years old to submit an enquiry or create an account.",
            "You agree to share accurate contact details and not misuse enquiry forms, admin tools, advisor calls or listing media.",
          ],
        },
        {
          heading: "2. Listing accuracy",
          body: [
            "Listing details, including price, area, address/locality, furnishing, amenities and availability, are provided by owners, developers, partners or our internal team and may change without notice.",
            "We make reasonable efforts to verify property information, images and location context, but final checks on title, approvals, measurements, possession and pricing must be completed before any transaction.",
            "Photos, maps and locality highlights are for guidance and presentation. A site visit and document review should be completed before making a financial decision.",
          ],
        },
        {
          heading: "3. Advisory services",
          body: [
            "Any guidance shared by a Braj Setu Properties advisor is based on available market information, local experience and current listing data.",
            "Advisor suggestions do not replace independent legal, tax, finance, vastu, engineering or investment advice.",
            "Site visits, negotiations and introductions are subject to availability of the owner, developer, buyer, tenant or advisor.",
          ],
        },
        {
          heading: "4. Intellectual property",
          body: [
            "The Braj Setu Properties name, brand marks, website design, page layouts, written content and original listing media are owned by or licensed to Braj Setu Properties.",
            "You may not reproduce, modify, distribute or use our brand assets, property images or listing database without consent.",
          ],
        },
        {
          heading: "5. Liability",
          body: [
            "To the extent permitted by law, Braj Setu Properties is not liable for indirect, incidental or consequential loss arising from reliance on listing content, advisor communication or third-party actions.",
            "Nothing on this website creates a guaranteed sale, rental, purchase, possession, loan approval or investment return.",
          ],
        },
        {
          heading: "6. Contact",
          body: [
            "Questions about these terms can be sent to brajsetuproperties@gmail.com or to our office at Raja wala mandir, Infront of Giriraj ji Maharaj, Goverdhan, Mathura, Uttar Pradesh 281502.",
          ],
        },
      ]}
    />
  );
}
