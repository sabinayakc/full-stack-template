import { InfoPage, InfoPageSection } from "@/components/ui/info-page";
import { APP_NAME } from "@/constants/app";

export default function TermsOfServiceScreen() {
  return (
    <InfoPage badge="Legal" title="Terms of Service" subtitle="Last updated: March 2026">
      <InfoPageSection title="1. Acceptance of Terms">
        By accessing or using {APP_NAME}, you agree to be bound by these Terms of Service and our
        Privacy Policy. If you do not agree to these terms, you must discontinue use of our services
        immediately.
      </InfoPageSection>

      <InfoPageSection title="2. Account Registration">
        You must provide accurate and complete information when creating an account. You are
        responsible for maintaining the confidentiality of your account credentials and for all
        activities that occur under your account. You must notify us immediately of any unauthorized
        use.
      </InfoPageSection>

      <InfoPageSection title="3. Use of Services">
        You agree to use {APP_NAME} only for lawful business purposes related to property
        maintenance, landscaping, and field services management. You shall not misuse the platform,
        attempt to gain unauthorized access, or use automated systems to extract data from the
        service.
      </InfoPageSection>

      <InfoPageSection title="4. User Content">
        You retain ownership of all content you create within {APP_NAME}, including estimates,
        customer records, and project data. By using our services, you grant us a limited license to
        store, process, and display your content as necessary to provide the service. We will not
        use your content for purposes other than delivering the service.
      </InfoPageSection>

      <InfoPageSection title="5. Organization and Team Use">
        Organization administrators are responsible for managing member access and permissions. When
        you invite team members, you confirm they are authorized to access your organization's data.
        Removing a member revokes their access but does not delete data they contributed.
      </InfoPageSection>

      <InfoPageSection title="6. Service Availability">
        We strive to maintain high availability but do not guarantee uninterrupted access. We may
        perform scheduled maintenance with reasonable notice. We are not liable for temporary
        service disruptions due to maintenance, updates, or circumstances beyond our control.
      </InfoPageSection>

      <InfoPageSection title="7. Limitation of Liability">
        {APP_NAME} is provided "as is" without warranties of any kind. We shall not be liable for
        any indirect, incidental, special, or consequential damages arising from your use of the
        service, including but not limited to loss of profits, data, or business opportunities.
      </InfoPageSection>

      <InfoPageSection title="8. Changes to Terms">
        We reserve the right to modify these terms at any time. Material changes will be
        communicated through the app or via email. Continued use of {APP_NAME} after changes
        constitutes acceptance of the updated terms.
      </InfoPageSection>
    </InfoPage>
  );
}
