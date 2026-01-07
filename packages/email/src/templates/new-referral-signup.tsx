import { CHECKOUT_WORDMARK, getPrettyUrl } from "@dub/utils";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { Footer } from "../components/footer";

export const REFERRAL_SCANS_QUOTA_BONUS = 500;

export default function NewReferralSignup({
  email = "panic@thedis.co",
  workspace = {
    name: "Acme, Inc",
    slug: "acme",
  },
}: {
  email: string;
  workspace: {
    name: string;
    slug: string;
  };
}) {
  // TODO: Determine referral domain (refer.chko.sh?)
  const referralLink = `https://refer.foreverqrs.com/${workspace.slug}`;
  return (
    <Html>
      <Head />
      <Preview>New referral signup</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-10 max-w-[600px] rounded border border-solid border-neutral-200 px-10 py-5">
            <Section className="mt-8">
              <Img src={CHECKOUT_WORDMARK} height="32" alt="Checkout" />
            </Section>
            <Heading className="mx-0 my-7 p-0 text-lg font-medium text-black">
              New referral signup
            </Heading>
            <Text className="text-sm leading-6 text-black">
              Congratulations – someone just signed up for Checkout using your
              referral link:{" "}
              <a
                href={referralLink}
                className="text-semibold font-medium text-black underline"
              >
                {getPrettyUrl(referralLink)}
              </a>
            </Text>
            <Text className="text-sm leading-6 text-black">
              As a thank you from us for spreading the word about Checkout, you've
              earned an additional {REFERRAL_SCANS_QUOTA_BONUS} scans quota
              for your{" "}
              <a
                href={`https://app.foreverqrs.com/${workspace.slug}`}
                className="text-semibold font-medium text-black underline"
              >
                {workspace.name}
              </a>{" "}
              workspace on Checkout.
            </Text>
            <Section className="my-8">
              <Link
                className="rounded-lg bg-black px-6 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={`https://app.foreverqrs.com/${workspace.slug}`}
              >
                View your referral stats
              </Link>
            </Section>
            <Footer email={email} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
