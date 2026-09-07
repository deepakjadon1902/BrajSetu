import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions | Braj Setu Properties" },
      {
        name: "description",
        content:
          "Terms for browsing, enquiring and submitting property listings on Braj Setu Properties.",
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
      intro="These terms govern your use of Braj Setu Properties for browsing, enquiring, submitting, reviewing and managing property listings across Vrindavan, Mathura, Goverdhan, Barsana and nearby Braj Mandal locations."
      sections={[
        {
          heading: "1. Using this website",
          body: [
            "Braj Setu Properties provides property information for personal and business enquiry use. You agree not to scrape, resell, copy or republish listing content without written permission.",
            "You must be at least 18 years old to submit an enquiry, create an account or list a property.",
            "You agree to share accurate contact details and not misuse enquiry forms, admin tools, advisor calls or listing media.",
          ],
        },
        {
          heading: "2. User submitted property listings",
          body: [
            "When you submit a property, you confirm that you are the owner, authorized representative, broker or lawful contact for that property and that you have permission to share the details and images.",
            "You must provide true, current and complete information, including property type, sale or rent intent, price expectation, city, locality, area, bedrooms, bathrooms, furnishing, amenities, description and owner contact details.",
            "By checking the acceptance box on the listing form, you agree that Braj Setu Properties may review, edit, reject, hold, publish, unpublish or remove the listing if information is incomplete, misleading, duplicate, unlawful, disputed or unsuitable for the platform.",
          ],
        },
        {
          heading: "3. Admin and team managed listings",
          body: [
            "Listings created or edited by an admin may be based on information received from owners, developers, field visits, public records, partners or user submissions.",
            "Admins are expected to keep listing information professional, relevant and reasonably verified before publishing it to public pages.",
            "Admin review does not create a legal guarantee of title, possession, measurement, approvals, valuation, rental yield or transaction completion.",
          ],
        },
        {
          heading: "4. Listing accuracy",
          body: [
            "Listing details, including price, area, address/locality, furnishing, amenities and availability, are provided by owners, developers, partners or our internal team and may change without notice.",
            "We make reasonable efforts to verify property information, images and location context, but final checks on title, approvals, measurements, possession and pricing must be completed before any transaction.",
            "Photos, maps and locality highlights are for guidance and presentation. A site visit and document review should be completed before making a financial decision.",
          ],
        },
        {
          heading: "5. Prohibited listing content",
          body: [
            "You may not submit false ownership claims, copied photos without permission, fake pricing, unlawful land or property offers, discriminatory content, offensive media, spam, malware links or contact details that do not belong to you.",
            "You may not list a property involved in an undisclosed dispute, restriction, encumbrance, fraud concern or legal issue that would materially affect a buyer, tenant or advisor.",
            "Braj Setu Properties may suspend accounts, remove listings and preserve relevant records when misuse, fraud or legal risk is suspected.",
          ],
        },
        {
          heading: "6. Advisory services",
          body: [
            "Any guidance shared by a Braj Setu Properties advisor is based on available market information, local experience and current listing data.",
            "Advisor suggestions do not replace independent legal, tax, finance, vastu, engineering or investment advice.",
            "Site visits, negotiations and introductions are subject to availability of the owner, developer, buyer, tenant or advisor.",
          ],
        },
        {
          heading: "7. Intellectual property and listing media",
          body: [
            "The Braj Setu Properties name, brand marks, website design, page layouts, written content and original listing media are owned by or licensed to Braj Setu Properties.",
            "You may not reproduce, modify, distribute or use our brand assets, property images or listing database without consent.",
            "When you upload or share property images, descriptions or documents, you grant Braj Setu Properties permission to use them for verification, listing display, promotion, communication with interested parties and platform operations.",
          ],
        },
        {
          heading: "8. Liability",
          body: [
            "To the extent permitted by law, Braj Setu Properties is not liable for indirect, incidental or consequential loss arising from reliance on listing content, advisor communication or third-party actions.",
            "Nothing on this website creates a guaranteed sale, rental, purchase, possession, loan approval or investment return.",
          ],
        },
        {
          heading: "9. Changes, takedowns and contact",
          body: [
            "We may update these terms when the platform, listing workflow, verification process or legal requirements change. Continued use means you accept the updated terms.",
            "For corrections, takedowns, ownership disputes or listing complaints, include the property title, locality, contact number and supporting details.",
            "Questions about these terms can be sent to brajsetuproperties@gmail.com or to our office at Raja wala mandir, Infront of Giriraj ji Maharaj, Goverdhan, Mathura, Uttar Pradesh 281502.",
          ],
        },
      ]}
    />
  );
}
