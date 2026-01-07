import { APP_NAME } from "@dub/utils";

export const RESEND_AUDIENCES = {
  "app.foreverqrs.com": "153047f9-2127-465e-8753-3d602fee8cbb",
  "partners.foreverqrs.com": "6caf6898-941a-45b6-a59f-d0780c3004ac",
  // Legacy aliases retained for backward compatibility
  "app.chko.sh": "153047f9-2127-465e-8753-3d602fee8cbb",
  "partners.chko.sh": "6caf6898-941a-45b6-a59f-d0780c3004ac",
};

export const VARIANT_TO_FROM_MAP = {
  primary: `${APP_NAME} <team@foreverqrs.com>`,
  notifications: `${APP_NAME} <notifications@foreverqrs.com>`,
  marketing: `${APP_NAME} <marketing@foreverqrs.com>`,
};
