"use client";

import { APP_DOMAIN } from "@dub/utils";
import Link from "next/link";
import { useParams } from "next/navigation";

const partners = [
  {
    name: "Free Market Kids",
    logo: "https://assets.chko.sh/partners/FMK_Logo.webp",
    href: "https://www.freemarketkids.com/",
    description:
      "Teaching kids about free markets and entrepreneurship through interactive learning.",
    quote:
      "Teaching financial literacy requires capturing attention in creative ways. With dynamic QR codes on our event materials, we can update destinations on the fly and see exactly which activities drive the most engagement. Parents and kids weren't just walking by—they were actively scanning to learn more. The real-time analytics helped us optimize our booth layout mid-event.",
    category: "Education",
  },
  {
    name: "Foundation",
    logo: "https://assets.chko.sh/partners/foundation_brand.png",
    href: "https://foundation.xyz/",
    description: "Digital art and collectibles platform built for creators.",
    quote:
      "Privacy and security are paramount to our users, but so is community connection. These QR codes let us engage our audience without invasive tracking while maintaining a polished, professional look. Being able to update where codes point without reprinting is a game-changer for hardware packaging.",
    category: "Tech",
  },
  {
    name: "BTC-TC",
    logo: "https://assets.chko.sh/partners/BTC-TC_Gold-Black.jpg",
    href: "https://btc-tc.com/",
    description: "Premium trading cards and collectibles.",
    quote:
      "Building a strong collector network relies on effective communication tools. We put QR codes on every card pack, and the scan analytics tell us exactly which products generate the most interest. Being able to redirect scans to new campaigns without reprinting saved us thousands.",
    category: "Community",
  },
  {
    name: "Shamory",
    logo: "https://assets.chko.sh/partners/ShamoryLogo.jpg",
    href: "https://shamory.com/",
    description:
      "Fun, educational card game teaching financial basics to families.",
    quote:
      "We wanted our card game to feel interactive beyond the table. QR codes on our packaging link to tutorials, bonus content, and community features—and we can update those links seasonally. The dashboard shows us scan patterns by region, helping us plan where to focus marketing efforts.",
    category: "Education",
  },
  {
    name: "Panties for Bitcoin",
    logo: "https://assets.chko.sh/partners/P4B_RoundLogo.png",
    href: "https://www.pantiesforbitcoin.com/",
    description: "Bold lingerie brand with a tech-forward approach.",
    quote:
      "We tested QR codes on our packaging and at events, and the response was incredible. Customers scan to access exclusive content and care instructions. The analytics showed us which product lines drive the most engagement, and we can update the destination without touching the packaging.",
    category: "Lifestyle",
  },
  {
    name: "NiHowdy",
    logo: "https://assets.chko.sh/partners/241120_NiHowdy_Logo.png",
    href: "https://nihowdy.com/",
    description: "Modern Chinese language learning platform.",
    quote:
      "Integrating QR codes into our physical materials was a natural fit. Students scan to access lessons, and we see exactly which materials drive app downloads. The ability to A/B test different landing pages by updating the QR destination has dramatically improved our conversion rates.",
    category: "Lifestyle",
  },
  {
    name: "Proof of Pod",
    logo: "https://assets.chko.sh/partners/ProofOfPod_Logo.png",
    href: "https://www.youtube.com/@ProofofPod",
    description: "Podcast bringing stories from the community.",
    quote:
      "Audience engagement is the lifeblood of any podcast. QR codes on our merch and event materials give us a direct line to listeners. The scan analytics show us which episodes and topics resonate most, and we can update codes to point to new content without reprinting anything.",
    category: "Media",
  },
  {
    name: "Jippi",
    logo: "https://assets.chko.sh/partners/Jippi_Logo.png",
    href: "https://jippi.app/",
    description: "Gamified savings app for everyday purchases.",
    quote:
      "Adding QR codes to our physical touchpoints extended our app into the real world. The codes on our promotional materials link directly to personalized onboarding flows, and we can see exactly which events and locations drive the most sign-ups. Dynamic updates mean we never waste printed materials.",
    category: "Gaming",
  },
];

export default function CustomersPage() {
  const { domain } = useParams() as { domain: string };

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl font-medium tracking-tight text-neutral-900 sm:text-5xl">
          Meet our customers
        </h1>
        <p className="mt-6 text-lg text-neutral-600">
          ForeverQRs helps businesses of all sizes connect physical products
          with digital experiences. QR codes that work forever, even if you
          cancel.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href={`${APP_DOMAIN}/register?next=/onboarding/qr-landing`}
            className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-neutral-800"
          >
            Get started
          </Link>
          <Link
            href={`mailto:support@chko.sh`}
            className="rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50"
          >
            Contact us
          </Link>
        </div>
      </div>

      {/* Logo Strip */}
      <div className="mt-16 flex flex-wrap items-center justify-center gap-x-12 gap-y-8 border-y border-neutral-200 py-10">
        {partners.slice(0, 4).map((partner) => (
          <img
            key={partner.name}
            src={partner.logo}
            alt={partner.name}
            className="h-8 w-auto object-contain grayscale transition-all hover:grayscale-0"
          />
        ))}
      </div>

      {/* Featured Testimonial */}
      <div className="mt-20">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-800 px-8 py-12 sm:px-12 sm:py-16">
          <div className="relative z-10">
            <img
              src={partners[0].logo}
              alt={partners[0].name}
              className="h-10 w-auto object-contain brightness-0 invert"
            />
            <blockquote className="mt-8">
              <p className="text-xl leading-relaxed text-white sm:text-2xl">
                "{partners[0].quote}"
              </p>
            </blockquote>
            <div className="mt-8 flex items-center gap-4">
              <div>
                <p className="font-medium text-white">{partners[0].name}</p>
                <p className="text-sm text-neutral-400">
                  {partners[0].category}
                </p>
              </div>
            </div>
          </div>
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/5" />
        </div>
      </div>

      {/* Partner Testimonial Cards Grid */}
      <div className="mt-16 grid gap-6 sm:grid-cols-2">
        {partners.slice(1).map((partner) => (
          <div
            key={partner.name}
            className="group flex flex-col rounded-xl border border-neutral-200 bg-white p-8 transition-all hover:border-neutral-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <img
                src={partner.logo}
                alt={partner.name}
                className="h-10 w-auto object-contain"
              />
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
                {partner.category}
              </span>
            </div>
            <blockquote className="mt-6 flex-1">
              <p className="leading-relaxed text-neutral-700">
                "{partner.quote}"
              </p>
            </blockquote>
            <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-6">
              <div>
                <span className="text-sm font-medium text-neutral-900">
                  {partner.name}
                </span>
                <p className="text-xs text-neutral-500">
                  {partner.description}
                </p>
              </div>
              <a
                href={partner.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
              >
                Visit →
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-20 rounded-2xl bg-neutral-900 px-8 py-16 text-center">
        <h2 className="font-display text-3xl font-medium text-white sm:text-4xl">
          Ready to get started?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-neutral-400">
          Create your first QR code in seconds. No credit card required.
        </p>
        <Link
          href={`${APP_DOMAIN}/register?next=/onboarding/qr-landing`}
          className="mt-8 inline-block rounded-lg bg-white px-6 py-3 text-sm font-medium text-neutral-900 shadow-sm transition-colors hover:bg-neutral-100"
        >
          Start for free
        </Link>
      </div>
    </div>
  );
}
