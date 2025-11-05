import { constructMetadata } from "@dub/utils";

export const metadata = constructMetadata({
  title: "Terms of Service - Beyond The Checkout",
  description: "Terms of Service for Beyond The Checkout, Inc.",
});

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col bg-default">
      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-center text-content-emphasis mb-6">
          Terms of Service
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
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using any website, application, QR code, reward system, or affiliated
              content operated by Beyond The Checkout, Inc. (&ldquo;BTC,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;),
              you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree,
              do not use our services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-content-emphasis">
              2. Description of Services
            </h2>
            <p>
              BTC provides a digital reward system that delivers randomized Bitcoin incentives
              (&ldquo;Rewards&rdquo;) through QR codes embedded in physical products, marketing materials,
              or digital content. Rewards are accessed by users who scan these QR codes and interact
              with our platform.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-content-emphasis">
              3. Account Creation and Data Collection
            </h2>
            <p>When you engage with BTC services, we may collect the following:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Your email address</li>
              <li>Time of interaction</li>
              <li>Device metadata</li>
              <li>Geographic location (where permitted)</li>
            </ul>
            <p>
              This information is used to provide services, prevent abuse, and support our promotional
              campaigns. We may share this data with:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>The specific business partner associated with the reward or campaign</li>
              <li>Other select third parties as permitted by our Privacy Policy</li>
            </ul>
            <p>By participating, you consent to this data usage and sharing.</p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-content-emphasis">
              4. Bitcoin Rewards
            </h2>
            <ul className="list-disc ml-6 space-y-2">
              <li>Rewards are distributed randomly across various tier levels.</li>
              <li>Rewards are available while supplies last and may be subject to expiration or campaign limits.</li>
              <li>Some rewards may be of nominal value; others may have higher amounts, though these are less frequent.</li>
              <li>Reward amounts are based on a USD-equivalent value at the time of issuance.</li>
              <li>We do not guarantee any specific outcome or reward level.</li>
              <li>No purchase is necessary to receive rewards. Participation may be limited to certain campaigns or eligibility requirements.</li>
              <li>Rewards are promotional in nature and do not constitute investment products or financial instruments.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-content-emphasis">
              5. Third-Party Services
            </h2>
            <p>
              BTC partners with third-party services to facilitate account creation, wallet setup,
              and identity or device verification. Your use of such services is subject to their own
              terms and privacy policies. BTC is not liable for any issues or losses arising from your
              interaction with third-party platforms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-content-emphasis">
              6. Eligibility and User Conduct
            </h2>
            <p>To use our services, you must:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Be at least 18 years old</li>
              <li>Be located in a jurisdiction where Bitcoin rewards are legally permitted</li>
              <li>Use BTC&apos;s services for lawful, personal purposes only</li>
            </ul>
            <p>
              We may restrict access or revoke rewards if we detect suspected fraud, abuse, or violations
              of these Terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-content-emphasis">
              7. Disclaimers and Risk Notice
            </h2>
            <ul className="list-disc ml-6 space-y-2">
              <li>BTC does not provide investment advice or brokerage services.</li>
              <li>Bitcoin is a volatile digital asset and may lose value rapidly.</li>
              <li>Participation is at your own risk.</li>
              <li>BTC disclaims all warranties, express or implied, including merchantability or fitness for a particular purpose.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-content-emphasis">
              8. Limitation of Liability
            </h2>
            <p>To the maximum extent permitted by law:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>BTC is not liable for indirect, incidental, or consequential damages, including loss of profits or data.</li>
              <li>BTC&apos;s total liability for any claim is capped at the greater of (i) $100 or (ii) the value of the Bitcoin reward received.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-content-emphasis">
              9. Dispute Resolution
            </h2>
            <p>
              Any disputes will be resolved by binding arbitration in the State of Delaware under the
              rules of the American Arbitration Association. Class actions and jury trials are waived.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-content-emphasis">
              10. Changes to These Terms
            </h2>
            <p>
              BTC may update these Terms periodically. Changes become effective upon posting to our
              website. Continued use constitutes acceptance.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-content-emphasis">
              11. Contact Information
            </h2>
            <p>
              For legal inquiries, email:{" "}
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
