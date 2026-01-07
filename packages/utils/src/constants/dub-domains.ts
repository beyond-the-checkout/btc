import { DUB_WORKSPACE_ID, LEGACY_SHORT_DOMAIN, SHORT_DOMAIN } from "./main";

// Primary built-in domain - environment-driven for dev/prod flexibility
// In dev: foreverqrs.dev, in prod: foreverqrs.com
const PRIMARY_BUILTIN_DOMAIN = SHORT_DOMAIN;

export const DUB_DOMAINS = [
  // PRIMARY: foreverqrs.com (prod) or foreverqrs.dev (dev)
  {
    // Use a stable synthetic ID for built-in domains.
    // Do NOT couple this to the DB primary key; the DB record is keyed by slug.
    id: `builtin:${PRIMARY_BUILTIN_DOMAIN}`,
    slug: PRIMARY_BUILTIN_DOMAIN,
    verified: true,
    primary: true,
    archived: false,
    placeholder: `https://${PRIMARY_BUILTIN_DOMAIN}/help`,
    allowedHostnames: [] as string[], // Explicit type to avoid TypeScript never[] inference
    description: "The default domain for all accounts.",
    projectId: DUB_WORKSPACE_ID,
  },
  // SECONDARY: chko.sh (kept for backwards compatibility)
  {
    id: `builtin:${LEGACY_SHORT_DOMAIN}`,
    slug: LEGACY_SHORT_DOMAIN, // "chko.sh" - stable regardless of SHORT_DOMAIN env
    verified: true,
    primary: false, // Demoted to secondary
    archived: false,
    placeholder: `https://${LEGACY_SHORT_DOMAIN}/help`,
    allowedHostnames: [] as string[], // Explicit type to avoid TypeScript never[] inference
    description: "Legacy short domain (existing links continue to work).",
    projectId: DUB_WORKSPACE_ID,
  },
  // Dub-specific domains removed (NEXT_PUBLIC_IS_DUB=false, permanently disabled)
];

export const DUB_DOMAINS_ARRAY = DUB_DOMAINS.map((domain) => domain.slug);

export const DUB_DEMO_LINKS = [
  {
    id: "clqo10sum0006js08vutzfxt3",
    domain: "d.to",
    key: "try",
    dashboardId: "dash_Rqy6tVEO5Ib4iVFvmYYTK4kO",
  },
  {
    id: "cltshzzpd0005126z3rd2lvo4",
    domain: "dub.sh",
    key: "try",
    dashboardId: "dash_bUNOfMQVcKS0VMDa2HaYhOjg",
  },
  {
    id: "clot0z5rg000djp08ue98hxkn",
    domain: "chatg.pt",
    key: "domains",
    dashboardId: "dash_lX4or5Yj6ZrPk3qW4SwgrQ5t",
  },
  {
    id: "clp4jh9av0001l308ormavtlu",
    domain: "spti.fi",
    key: "hans",
    dashboardId: "dash_v2Ygwn3hZNYx6kFYfBT4IApM",
  },
  {
    id: "cltgtsex40003ck8z444hum5u",
    domain: "git.new",
    key: "dub",
    dashboardId: "dash_FX5HKOKhtQ6uoIeSDxWM8eIb",
  },
  {
    id: "clymd5vqj0005jgkorsopklsk",
    domain: "fig.page",
    key: "dub",
    dashboardId: "dash_no9BFlfSjHDG6K7XIAuwLt5p",
  },
  {
    id: "clp3k3yoi0001ju0874nz899q",
    domain: "amzn.id",
    key: "tv",
    dashboardId: "dash_fKwai9V9nsLcC0IaY0rTF1yA",
  },
  {
    id: "clymd73o50001ulmzzxjumr8l",
    domain: "ggl.link",
    key: "dub",
    dashboardId: "dash_rx5c7pQPnx2MUCX3cL4t1Zpn",
  },
  {
    id: "cm24785ki0001ainw2qks4uq5",
    domain: "cal.link",
    key: "demo",
    dashboardId: "dash_zbzP2UVvTrv5SkIEPP2pV5pC",
  },
];
