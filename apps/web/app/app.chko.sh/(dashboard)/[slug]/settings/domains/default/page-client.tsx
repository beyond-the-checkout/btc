"use client";

import { clientAccessCheck } from "@/lib/api/tokens/permissions";
import useDefaultDomains from "@/lib/swr/use-default-domains";
import useWorkspace from "@/lib/swr/use-workspace";
import { DomainCardTitleColumn } from "@/ui/domains/domain-card-title-column";
import { UpgradeRequiredToast } from "@/ui/shared/upgrade-required-toast";
import { Badge, InfoTooltip, Logo, Switch } from "@dub/ui";
import { QRCode } from "@dub/ui/icons";
import {
  CHECKOUT_HELP_BASE,
  DUB_DOMAINS,
  LEGACY_SHORT_DOMAIN,
  SHORT_DOMAIN,
} from "@dub/utils";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function DubDomainsIcon(domain: string) {
  // Use constants for environment-driven domain matching
  if (domain === SHORT_DOMAIN) {
    return QRCode; // Primary domain icon
  }
  if (domain === LEGACY_SHORT_DOMAIN) {
    return Logo; // Legacy domain icon
  }
  return Logo;
}

// Returns additional label/badge info for domains
function getDomainBadge(domain: string): {
  label: string;
  variant: "neutral" | "success" | "warning" | "new";
  tooltip?: string;
} | null {
  // Use constants for environment-driven domain matching
  if (domain === SHORT_DOMAIN) {
    return {
      label: "Primary",
      variant: "success",
      tooltip: "The default domain for all new links",
    };
  }
  if (domain === LEGACY_SHORT_DOMAIN) {
    return {
      label: "Legacy",
      variant: "neutral",
      tooltip: `Existing links continue to work. New links should use ${SHORT_DOMAIN}.`,
    };
  }
  return null;
}

export function DefaultDomains() {
  const { id, role } = useWorkspace();
  const [submitting, setSubmitting] = useState(false);
  const [defaultDomains, setDefaultDomains] = useState<string[]>([]);
  const { defaultDomains: initialDefaultDomains, mutate } = useDefaultDomains();

  const permissionsError = clientAccessCheck({
    action: "domains.write",
    role,
    customPermissionDescription: "manage default domains",
  }).error;

  useEffect(() => {
    if (initialDefaultDomains) {
      setDefaultDomains(initialDefaultDomains);
    }
  }, [initialDefaultDomains]);

  return (
    <div className="grid gap-5">
      <div className="rounded-lg bg-neutral-100 p-4">
        <p className="text-sm text-neutral-500">
          Choose which default domains appear in your link creation dropdown.{" "}
          <Link
            href={`${CHECKOUT_HELP_BASE}/article/default-domains`}
            target="_blank"
            className="underline transition-colors hover:text-neutral-800"
          >
            Learn more.
          </Link>
        </p>
      </div>

      <div className="mt-2 grid grid-cols-1 gap-3">
        {DUB_DOMAINS.map(({ slug, description }) => {
          const badge = getDomainBadge(slug);

          return (
            <div
              key={slug}
              className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-white p-5"
            >
              <div className="flex items-center gap-4">
                <DomainCardTitleColumn
                  domain={slug}
                  icon={DubDomainsIcon(slug)}
                  description={description}
                  defaultDomain
                />
                {badge && (
                  <div className="flex items-center gap-1">
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                    {badge.tooltip && <InfoTooltip content={badge.tooltip} />}
                  </div>
                )}
              </div>
              <Switch
                disabled={submitting}
                disabledTooltip={permissionsError}
                checked={defaultDomains?.includes(slug)}
                fn={() => {
                  const oldDefaultDomains = defaultDomains.slice();
                  const newDefaultDomains = defaultDomains.includes(slug)
                    ? defaultDomains.filter((d) => d !== slug)
                    : [...defaultDomains, slug];

                  setDefaultDomains(newDefaultDomains);
                  setSubmitting(true);
                  fetch(`/api/domains/default?workspaceId=${id}`, {
                    method: "PATCH",
                    body: JSON.stringify({
                      defaultDomains: newDefaultDomains.filter(
                        (d) => d !== null,
                      ),
                    }),
                  })
                    .then(async (res) => {
                      if (res.ok) {
                        toast.success(
                          `${slug} ${newDefaultDomains.includes(slug) ? "added to" : "removed from"} default domains.`,
                        );
                        await mutate();
                      } else {
                        const { error } = await res.json();
                        if (error.message.includes("Upgrade to Pro")) {
                          toast.custom(() => (
                            <UpgradeRequiredToast
                              title="You've discovered a Pro feature!"
                              message={error.message}
                            />
                          ));
                        } else {
                          toast.error(error.message);
                        }
                        setDefaultDomains(oldDefaultDomains);
                      }
                    })
                    .finally(() => setSubmitting(false));
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
