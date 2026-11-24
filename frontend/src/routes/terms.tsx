import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use | Braj Setu Properties" },
      {
        name: "description",
        content:
          "Terms for browsing listings, making enquiries and submitting properties on Braj Setu Properties.",
      },
    ],
  }),
  component: TermsPage,
});
function TermsPage() {
  return (
    <LegalPage
      title="Terms of use"
      updated="17 October 2026"
      intro="These terms explain how you can use Braj Setu Properties to browse, enquire about and list properties."
      sections={[
        {
          heading: "1. Using the website",
          body: [
            "You must be at least 18 to create an account, submit a property or make an enquiry. Use accurate information and keep your account details secure.",
            "Do not misuse forms, impersonate another person, interfere with the service or copy and republish listing content without permission.",
          ],
        },
        {
          heading: "2. Property information",
          body: [
            "Prices, areas, descriptions, photographs and availability are supplied by owners, representatives or our team. They may change and should be confirmed before you proceed.",
            "A verification badge describes the recorded checks for that listing. It is not a government certification or a guarantee of ownership, title, approvals, condition or investment returns.",
            "Visit the property and obtain independent legal and financial advice before paying money or signing an agreement. Check any RERA information against the relevant official register.",
          ],
        },
        {
          heading: "3. Submitting a listing",
          body: [
            "You must own the property or have permission to represent it. Share accurate details, disclose known restrictions or disputes, and use photos and documents you have permission to share.",
            "By submitting content, you allow us to review, edit, display and promote it for the listing and related enquiries. We may request corrections, reject a submission or remove content that is misleading, unlawful, disputed or incomplete.",
            "Do not submit false ownership claims, discriminatory content, copied media, spam or harmful links. Submission does not guarantee publication.",
          ],
        },
        {
          heading: "4. Enquiries and services",
          body: [
            "Enquiries and visit requests depend on availability and confirmation from the relevant parties. Advice from our team is general property guidance and does not replace advice from a qualified lawyer, financial adviser or other specialist.",
            "Any fees and the scope of services must be agreed separately. The website does not promise a completed transaction, a particular price, a loan approval or a return on investment.",
          ],
        },
        {
          heading: "5. Content and responsibility",
          body: [
            "Our brand, original content and website materials are owned by or licensed to Braj Setu Properties. Obtain permission before using them outside normal browsing.",
            "To the extent permitted by law, we are not responsible for indirect or consequential losses caused by reliance on listing information or third-party actions. These terms do not limit rights or liabilities that cannot lawfully be limited.",
          ],
        },
        {
          heading: "6. Changes and complaints",
          body: [
            "We may update these terms as the service changes. The date above identifies the latest version.",
            "For a correction, takedown or ownership complaint, contact us with the listing ID, relevant details and evidence of your authority. We may need to verify your request before taking action.",
          ],
        },
      ]}
    />
  );
}
