import Container from "@/app/components/container";
import { appConfig } from "@/config/appConfig";

export const metadata = {
  title: `Privacy Policy | ${appConfig.appName}`,
  description: `Read the privacy policy for ${appConfig.appName}. Learn how we collect, use, and protect your personal information in compliance with Google standards.`,
};

export default function PrivacyPolicy() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Container>
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="mb-4">Last updated: December 16, 2025</p>
        <p className="mb-4">
          This Privacy Policy describes how {appConfig.appName} (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, and protects your personal information when you use our website and services. We are committed to safeguarding your privacy and complying with all applicable data protection laws, including those required by Google.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>Personal Information: Name, email address, phone number, delivery address, and payment details when you register, place an order, or contact us.</li>
          <li>Usage Data: Information about how you use our website, including IP address, browser type, device information, and pages visited.</li>
          <li>Cookies & Tracking: We use cookies and similar technologies to enhance your experience, analyze usage, and deliver personalized content and ads.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-6 mb-2">2. How We Use Your Information</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>To provide, operate, and maintain our services.</li>
          <li>To improve our user experience.</li>
          <li>We collect your email address solely for authentication and account security. We do not use your email to send marketing or service communications.</li>
          <li>To comply with legal obligations and protect our rights.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-6 mb-2">3. Sharing Your Information</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>We do not sell your personal information.</li>
          <li>We may share your data with trusted third-party service providers (e.g., payment processors, delivery partners) only as necessary to provide our services.</li>
          <li>We may disclose information if required by law or to protect our rights and safety.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-6 mb-2">4. Google Services</h2>
        <p className="mb-4">
          Our website may use Google services (such as Google Analytics, Google Ads, and Google Sign-In). These services may collect information as described in their respective privacy policies. For more information, please review the <a href="https://policies.google.com/privacy" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a>.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-2">5. Data Security</h2>
        <p className="mb-4">
          We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-2">6. Your Rights</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>You may access, update, or delete your personal information by contacting us.</li>
          <li>You may opt out of marketing communications at any time.</li>
          <li>You may disable cookies in your browser settings, but some features may not work as intended.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-6 mb-2">7. Children&apos;s Privacy</h2>
        <p className="mb-4">
          Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us to have it removed.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-2">8. Changes to This Policy</h2>
        <p className="mb-4">
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page with an updated date.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-2">9. Contact Us</h2>
        <p>
          If you have any questions or concerns about this Privacy Policy or your personal information, please contact us at <a href={`mailto:${appConfig.contactEmail}`} className="text-blue-600 underline">{appConfig.contactEmail}</a>.
        </p>
      </Container>
    </div>
  );
}
