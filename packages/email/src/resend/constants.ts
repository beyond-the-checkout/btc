import { APP_NAME } from "@dub/utils";

export const RESEND_AUDIENCES = {
  "app.dub.co": "f5ff0661-4234-43f6-b0ca-a3f3682934e3",
  "partners.dub.co": "6caf6898-941a-45b6-a59f-d0780c3004ac",
};

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || "example.com";

export const VARIANT_TO_FROM_MAP = {
  primary: `${APP_NAME} <system@${APP_DOMAIN}>`,
  notifications: `${APP_NAME} <notifications@${APP_DOMAIN}>`,
  marketing: `${APP_NAME} <marketing@${APP_DOMAIN}>`,
};
