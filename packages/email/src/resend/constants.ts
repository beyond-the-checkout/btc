import { APP_NAME } from "@dub/utils";

export const RESEND_AUDIENCES = {
  "app.chko.sh": "153047f9-2127-465e-8753-3d602fee8cbb",
  "partners.chko.sh": "6caf6898-941a-45b6-a59f-d0780c3004ac",
};

export const VARIANT_TO_FROM_MAP = {
  primary: `${APP_NAME} <team@chko.sh>`,
  notifications: `Dave <dave@checkout.tech>`,
  marketing: `${APP_NAME} <marketing@checkout.tech>`,
};
