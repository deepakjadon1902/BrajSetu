import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions | PropVista" },
      {
        name: "description",
        content:
          "The terms that govern your use of the PropVista property marketplace, listings and advisory services.",
      },
      { property: "og:title", content: "Terms & Conditions | PropVista" },
      { property: "og:description", content: "Terms governing use of PropVista services." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      updated="1 July 2026"
      intro="These terms explain what you can expect from PropVista and what we expect from you when you browse listings, contact an advisor or submit an enquiry through this website."
      sections={[
        {
          heading: "1. Using this website",
          body: [
            "PropVista provides property information for personal, non-commercial use. You agree not to scrape, resell or republish listing content without written permission.",
            "You must be at least 18 years old to submit an enquiry or create an account.",
          ],
        },
        {
          heading: "2. Listing accuracy",
          body: [
            "Listing details, including price, area and availability, are provided by owners and developers and are verified by our team on a best-effort basis. They may change without notice.",
            "Photographs are indicative. Always confirm measurements, approvals and title documents independently before committing to a transaction.",
          ],
        },
        {
          heading: "3. Advisory services",
          body: [
            "Any guidance shared by a PropVista advisor is an opinion based on available market information and does not constitute legal, tax or investment advice.",
          ],
        },
        {
          heading: "4. Intellectual property",
          body: [
            "The PropVista name, brand marks, page design and original photography are owned by PropVista Realty and may not be reproduced without consent.",
          ],
        },
        {
          heading: "5. Liability",
          body: [
            "To the extent permitted by law, PropVista is not liable for indirect or consequential loss arising from reliance on listing content.",
          ],
        },
        {
          heading: "6. Contact",
          body: [
            "Questions about these terms can be sent to hello@propvista.in or to our registered office in Pune.",
          ],
        },
      ]}
    />
  );
}
