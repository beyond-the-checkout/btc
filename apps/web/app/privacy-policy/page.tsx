import { constructMetadata } from "@dub/utils";

export const metadata = constructMetadata({
  title: "Privacy Policy - Beyond The Checkout",
  description: "Privacy Policy for Beyond The Checkout, Inc.",
});

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-default">
      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-center text-content-emphasis mb-6">
          Privacy Policy
        </h1>
        <p className="font-default text-center text-sm text-content-subtle mb-12">
          Effective Date: May 19, 2025
        </p>

        <div className="max-w-3xl mx-auto space-y-8 font-default text-content-default">
          <p>
            <strong className="text-content-emphasis">Company:</strong> Beyond The Checkout, Inc.<br />
            <strong className="text-content-emphasis">Incorporated in:</strong> Delaware, United States
          </p>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-content-emphasis">
              1. Overview
            </h2>
            <p>
              Beyond The Checkout, Inc. (&ldquo;BTC,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;)
              values your privacy. This Privacy Policy explains how we collect, use, share, and protect
              your personal information when you engage with our services, including QR-code reward
              campaigns, mobile or web-based experiences, and affiliated content.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-content-emphasis">
              2. What Information We Collect
            </h2>
            <p>
              When you scan a QR code, register, or interact with a reward promotion, we may collect:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Email address</li>
              <li>Time of interaction</li>
              <li>Device type or metadata</li>
              <li>Geolocation data (when enabled or inferred)</li>
              <li>Interaction data (e.g., reward claims, session duration)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-content-emphasis">
              3. How We Use Your Information
            </h2>
            <ul className="list-disc ml-6 space-y-2">
              <li>Deliver Bitcoin rewards</li>
              <li>Prevent fraud and abuse</li>
              <li>Analyze campaign effectiveness</li>
              <li>Improve our user experience and reward systems</li>
              <li>Support our business partners&apos; marketing and product initiatives</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-content-emphasis">
              4. Who We Share Your Data With
            </h2>
            <p>
              We may share or license personally identifiable data—such as email addresses and
              associated survey responses—with the business partner sponsoring the campaign you engage with.
            </p>
            <p>
              We may also sell or license aggregated or anonymized data for research or commercial purposes.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-content-emphasis">
              5. Your Privacy Rights
            </h2>
            <p>Depending on your jurisdiction (e.g., California), you may have the right to:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Access your personal data</li>
              <li>Request correction or deletion</li>
              <li>Opt out of certain uses or sharing</li>
            </ul>
            <p>
              To exercise your rights, contact:{" "}
              <a href="mailto:beyond@checkout.tech" className="text-content-emphasis underline hover:text-content-subtle transition-colors">
                beyond@checkout.tech
              </a>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-content-emphasis">
              6. Data Security
            </h2>
            <p>
              We use industry-standard measures to protect your information. However, no system is
              perfectly secure. Use is at your own risk.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-content-emphasis">
              7. Cookies and Tracking
            </h2>
            <p>
              We and our partners may use cookies or similar technologies. You can disable cookies in
              your browser settings.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-content-emphasis">
              8. Children&apos;s Privacy
            </h2>
            <p>
              Our services are not intended for users under 18. We do not knowingly collect data from minors.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-content-emphasis">
              9. International Users
            </h2>
            <p>
              Our services are designed for U.S. users. If you are outside the U.S., your data will be
              processed in the United States.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-content-emphasis">
              10. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy. Updates are posted to our website. Continued use means
              acceptance.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-content-emphasis">
              11. Contact Us
            </h2>
            <p>
              For privacy-related questions, email:{" "}
              <a href="mailto:beyond@checkout.tech" className="text-content-emphasis underline hover:text-content-subtle transition-colors">
                beyond@checkout.tech
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
