import { APP_NAME } from "@dub/utils";

export const RESEND_AUDIENCES = {
  "app.chko.sh": "f5ff0661-4234-43f6-b0ca-a3f3682934e3",
  "partners.chko.sh": "6caf6898-941a-45b6-a59f-d0780c3004ac",
};

export const VARIANT_TO_FROM_MAP = {
  primary: `Oliver <oliver@checkout.tech>`,
  notifications: `Dave <dave@checkout.tech>`,
  marketing: `${APP_NAME} <marketing@checkout.tech>`,
};
