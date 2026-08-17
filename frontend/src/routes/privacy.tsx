import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | PropVista" },
      {
        name: "description",
        content:
          "How PropVista collects, uses and protects the personal information you share when enquiring about a property.",
      },
      { property: "og:title", content: "Privacy Policy | PropVista" },
      {
        property: "og:description",
        content: "How PropVista handles and protects your personal information.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="1 July 2026"
      intro="We collect only what we need to help you find or sell a property, and we never sell your data to third parties."
      sections={[
        {
          heading: "1. What we collect",
          body: [
            "Contact details you submit through enquiry or contact forms: name, email address, phone number and your message.",
            "Basic usage information such as pages viewed and search filters applied, used to improve the site experience.",
          ],
        },
        {
          heading: "2. How we use it",
          body: [
            "To respond to your enquiry, arrange site visits and share listings that match your requirement.",
            "To send occasional market updates, which you can opt out of at any time.",
          ],
        },
        {
          heading: "3. Sharing",
          body: [
            "We share your contact details with a property owner or developer only when it is necessary to progress an enquiry you initiated.",
            "We do not sell personal data or share it for third-party advertising.",
          ],
        },
        {
          heading: "4. Retention and security",
          body: [
            "Enquiry records are retained for up to 24 months. Data is stored with access controls and encrypted in transit.",
          ],
        },
        {
          heading: "5. Your rights",
          body: [
            "You can request a copy of your data, ask for corrections, or ask us to delete it by writing to hello@propvista.in.",
          ],
        },
        {
          heading: "6. Cookies",
          body: [
            "We use essential cookies to keep the site working and anonymous analytics to understand which pages are useful.",
          ],
        },
      ]}
    />
  );
}
