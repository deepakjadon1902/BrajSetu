import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Braj Setu Properties" },
      {
        name: "description",
        content:
          "How Braj Setu Properties collects, uses and protects data for enquiries, accounts and property listings.",
      },
      { property: "og:title", content: "Privacy Policy | Braj Setu Properties" },
      {
        property: "og:description",
        content: "How Braj Setu Properties handles and protects your personal information.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="1 September 2026"
      intro="This policy explains how Braj Setu Properties, a property unit connected with Vrindavan Sarthi Enterprises, handles information shared by buyers, tenants, owners, admins and visitors across Vrindavan, Mathura, Goverdhan, Barsana and nearby Braj Mandal locations."
      sections={[
        {
          heading: "1. What we collect",
          body: [
            "We collect details you submit through enquiry, call-back, contact and account forms, including your name, phone number, email address, location preference, budget, message and property interest.",
            "When users, owners, brokers, partners or admins submit listings, we collect property details, images or image URLs, city, locality, area, price expectation, furnishing, amenities, description, owner contact details, acceptance of listing terms and review status.",
            "For logged-in submissions, we connect the listing record with the submitting account so admins can review, contact, correct, approve or remove the listing.",
            "We may collect basic usage information such as pages viewed, search filters, device/browser details and approximate location signals to improve search, navigation and listing quality.",
          ],
        },
        {
          heading: "2. How we use it",
          body: [
            "We use your information to respond to enquiries, arrange property visits, connect you with an advisor, shortlist relevant properties and support communication between interested parties.",
            "Listing information is used to publish, verify, update and promote properties on this website and through approved Braj Setu Properties communication channels.",
            "Admin users use listing submission data to verify ownership or authority, check completeness, correct errors, prevent duplicate listings and decide whether a listing should be published.",
            "We may send service updates, visit confirmations and relevant market information. You can ask us to stop non-essential communication at any time.",
          ],
        },
        {
          heading: "3. Sharing",
          body: [
            "We share your contact details with an owner, developer, advisor or service partner only when it is necessary to respond to an enquiry, schedule a visit, verify a listing or progress a request started by you.",
            "We do not sell personal data. We also do not share enquiry data for unrelated third-party advertising.",
            "A published listing may display property information and selected contact or enquiry paths, but sensitive account, admin and internal review details are kept out of public listing pages.",
            "Information may be shared if required by law, legal process, fraud prevention or protection of our users, advisors and business operations.",
          ],
        },
        {
          heading: "4. Retention and security",
          body: [
            "Enquiry and listing records are kept only as long as needed for service, audit, dispute handling, fraud prevention and legal requirements.",
            "Rejected, unpublished or edited listings may still be retained in internal records where needed for audit, fraud prevention, dispute handling, moderation history or legal compliance.",
            "We use access controls, secure systems and reasonable administrative safeguards to protect records. No online system is perfectly secure, so we keep collection limited to what is useful for the service.",
          ],
        },
        {
          heading: "5. Your rights",
          body: [
            "You can request a copy of your data, ask for corrections, withdraw non-essential communication consent, or ask us to delete eligible records by writing to brajsetuproperties@gmail.com.",
            "For listing ownership, removal or correction requests, please include the property title, locality and your contact number so our team can verify the request.",
            "If you submitted a listing, you can ask us to update owner details, remove images, unpublish the listing or correct inaccurate information after verification.",
          ],
        },
        {
          heading: "6. Cookies",
          body: [
            "We use essential cookies or local storage to keep sign-in, saved searches, filters and admin workflows working.",
            "Analytics, if enabled, help us understand which locations and pages are useful so we can improve the Braj Setu Properties experience.",
          ],
        },
      ]}
    />
  );
}
