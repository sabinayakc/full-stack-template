import { InfoPage, InfoPageSection } from "@/components/ui/info-page";
import { APP_NAME } from "@/constants/app";

export default function PrivacyPolicyScreen() {
  return (
    <InfoPage badge="Legal" title="Privacy Policy" subtitle="Last updated: March 2026">
      <InfoPageSection title="1. Information We Collect">
        {APP_NAME} collects information you provide directly when you create an account, including
        your name, email address, phone number, and organization details. We also collect property
        data, estimate information, and project details you enter into the platform. Usage data such
        as app interactions, device information, and log data is collected automatically to improve
        our services.
      </InfoPageSection>

      <InfoPageSection title="2. How We Use Your Information">
        We use your information to provide, maintain, and improve {APP_NAME} services, including
        generating estimates, managing customer relationships, and scheduling projects. Your data
        helps us personalize your experience, communicate service updates, and provide customer
        support. We do not sell your personal data to third parties.
      </InfoPageSection>

      <InfoPageSection title="3. Data Sharing">
        We may share your information with service providers who assist in operating our platform
        (e.g., cloud hosting, payment processing). We may also share data when required by law or to
        protect the rights and safety of our users. When you use the contractor portal feature,
        limited project information is shared with designated contractors.
      </InfoPageSection>

      <InfoPageSection title="4. Data Storage and Security">
        Your data is stored securely using industry-standard encryption both in transit and at rest.
        We implement appropriate technical and organizational measures including access controls,
        regular security audits, and secure backup procedures to protect your personal information.
      </InfoPageSection>

      <InfoPageSection title="5. Your Rights">
        You have the right to access, update, or delete your personal information at any time
        through the app settings. You may request a copy of your data, ask us to restrict its
        processing, or withdraw consent for optional data collection. Account deletion can be
        initiated from the settings page and will remove all associated data within 30 days.
      </InfoPageSection>

      <InfoPageSection title="6. Cookies and Tracking">
        {APP_NAME} uses minimal tracking technologies necessary for app functionality. We do not use
        third-party advertising trackers. Analytics data is collected in aggregate form to
        understand usage patterns and improve the product.
      </InfoPageSection>

      <InfoPageSection title="7. Contact Us">
        If you have questions about this Privacy Policy or wish to exercise your data rights, please
        contact us at support@example.com or through the in-app support feature.
      </InfoPageSection>
    </InfoPage>
  );
}
