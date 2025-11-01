import { CHECKOUT_WORDMARK } from "@dub/utils";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { Footer } from "../components/footer";

export default function WelcomeEmail({
  name = "Brendon Urie",
  email = "panic@thedis.co",
}: {
  name: string | null;
  email: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Checkout</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-10 max-w-[600px] rounded border border-solid border-neutral-200 px-10 py-5">
            <Section className="mt-8">
              <Img src={CHECKOUT_WORDMARK} height="32" alt="Checkout" />
            </Section>
            <Heading className="mx-0 my-7 p-0 text-xl font-semibold text-black">
              Welcome {name || "to Checkout"}!
            </Heading>
            <Text className="mb-8 text-sm leading-6 text-gray-600">
              Thank you for signing up for Checkout! You can now create dynamic QR
              codes that never expire, with guaranteed longevity and complete data
              ownership. Your scan data belongs to you, with transparent pricing and
              no hidden fees.
            </Text>

            <Hr />

            <Heading className="mx-0 my-6 p-0 text-lg font-semibold text-black">
              Getting started
            </Heading>

            <Text className="mb-4 text-sm leading-6 text-gray-600">
              <strong className="font-medium text-black">
                1. Create your first dynamic QR code
              </strong>
              :{" "}
              <Link
                href="https://chko.sh/help/article/how-to-create-qr-code"
                className="font-semibold text-black underline underline-offset-4"
              >
                Generate a QR code
              </Link>{" "}
              that you can update anytime without reprinting.
            </Text>

            <Text className="mb-4 text-sm leading-6 text-gray-600">
              <strong className="font-medium text-black">
                2. Understand your limits
              </strong>
              :{" "}
              <Link
                href="https://chko.sh/help/article/pricing-plans"
                className="font-semibold text-black underline underline-offset-4"
              >
                Review your plan details
              </Link>{" "}
              with transparent pricing and no surprise charges.
            </Text>

            <Text className="mb-4 text-sm leading-6 text-gray-600">
              <strong className="font-medium text-black">
                3. View scan analytics
              </strong>
              : Monitor{" "}
              <Link
                href="https://chko.sh/help/article/scan-analytics"
                className="font-semibold text-black underline underline-offset-4"
              >
                scan data
              </Link>{" "}
              in real time to see how your QR codes perform.
            </Text>

            <Text className="mb-8 text-sm leading-6 text-gray-600">
              <strong className="font-medium text-black">
                4. Integrate with your workflow
              </strong>
              :{" "}
              <Link
                href="https://chko.sh/docs/introduction"
                className="font-semibold text-black underline underline-offset-4"
              >
                Check out our docs
              </Link>{" "}
              to integrate QR code generation into your production process.
            </Text>

            <Section className="mb-8">
              <Link
                className="rounded-lg bg-black px-6 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href="https://app.chko.sh"
              >
                Go to your dashboard
              </Link>
            </Section>

            <Footer email={email} marketing />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
