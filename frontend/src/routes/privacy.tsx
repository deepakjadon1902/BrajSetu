import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Braj Setu Properties" },
      {
        name: "description",
        content:
          "How Braj Setu Properties uses information from enquiries, accounts and property submissions.",
      },
    ],
  }),
  component: PrivacyPage,
});
function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      updated="17 October 2026"
      intro="This policy explains how Braj Setu Properties uses information you share when browsing, creating an account, making an enquiry or listing a property."
      sections={[
        {
          heading: "1. Information we collect",
          body: [
            "Account and enquiry forms collect information such as your name, email address, phone number and message. Listing forms also collect property details, photographs, owner or representative details and declarations.",
            "If you choose Google sign-in, we receive the account information needed to sign you in. You can also use the email and password sign-in option.",
            "Our systems may record technical request information needed to operate, secure and troubleshoot the service.",
          ],
        },
        {
          heading: "2. How we use information",
          body: [
            "We use your information to manage your account, respond to enquiries, review and publish listings, arrange requested contact or visits, and protect the service from misuse.",
            "Property preferences saved in your profile help you keep track of your requirements. Service messages relate to requests you have made; you can ask us to stop non-essential contact.",
          ],
        },
        {
          heading: "3. What we share",
          body: [
            "Published listings display property information and selected public contact details. Internal review records, account credentials and private owner contact fields are not intended for public display.",
            "We may share the details needed with an owner, representative, adviser or service provider to handle your enquiry, review a listing or provide a service you requested. Providers that support sign-in, email delivery and image hosting may process information needed for those functions.",
            "We do not sell personal data or share enquiry details for unrelated third-party advertising. We may disclose information when required by law or when necessary to investigate misuse and protect the service.",
          ],
        },
        {
          heading: "4. Storage and security",
          body: [
            "We keep account, enquiry and listing records for the purposes described here, including required business records, dispute handling and fraud prevention. Some records may need to be retained after a listing is removed.",
            "We use measures such as password hashing and access controls to protect information. No online system can guarantee complete security. Do not include unnecessary sensitive information in an enquiry.",
          ],
        },
        {
          heading: "5. Your choices and requests",
          body: [
            "You can contact us to request access, correction or deletion of your personal information, withdraw optional consent, or raise a privacy concern. We may need to verify your identity and may retain records where applicable law or an unresolved dispute requires it.",
            "For a listing correction or removal, include the listing ID and your relationship to the property. You can update account contact details through your profile.",
          ],
        },
        {
          heading: "6. Browser storage and other services",
          body: [
            "We use browser storage to keep you signed in, remember listing filters and store property preferences and saved listings on your device. Signing out removes the relevant sign-in token.",
            "Maps, Google sign-in, externally hosted photos and links to WhatsApp or social platforms are provided by other services. Their own privacy terms apply when you use them.",
            "This policy may change as the service changes. Check the date above for the latest version.",
          ],
        },
      ]}
    />
  );
}
