const logTypeToEnv = {
  alerts: process.env.DUB_SLACK_HOOK_ALERTS,
  cron: process.env.DUB_SLACK_HOOK_CRON,
  errors: process.env.DUB_SLACK_HOOK_ERRORS,
  links: process.env.DUB_SLACK_HOOK_LINKS,
  payouts: process.env.DUB_SLACK_HOOK_PAYOUTS,
};

const chkoLogTypeToEnv = {
  signups: process.env.CHKO_SLACK_HOOK_SIGNUPS,
};

export const log = async ({
  message,
  type,
  mention = false,
}: {
  message: string;
  type: "alerts" | "cron" | "errors" | "links" | "payouts";
  mention?: boolean;
}) => {
  /* Log a message to the console */
  console.log(message);

  const HOOK = logTypeToEnv[type];
  if (!HOOK) return;
  try {
    return await fetch(HOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              // prettier-ignore
              text: `${mention ? "<@U0404G6J3NJ> " : ""}${(type === "alerts" || type === "errors") ? ":alert: " : ""}${message}`,
            },
          },
        ],
      }),
    });
  } catch (e) {
    console.log(`Failed to log to Dub Slack. Error: ${e}`);
  }
};

export const chkoLog = async ({
  message,
  type,
}: {
  message: string;
  type: "signups";
}) => {
  console.log(message);

  const HOOK = chkoLogTypeToEnv[type];
  if (!HOOK) return;
  try {
    return await fetch(HOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `:tada: ${message}`,
            },
          },
        ],
      }),
    });
  } catch (e) {
    console.log(`Failed to log to Checkout Slack. Error: ${e}`);
  }
};
