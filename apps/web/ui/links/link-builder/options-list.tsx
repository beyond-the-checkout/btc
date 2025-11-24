import {
  MOBILE_MORE_ITEMS,
  MORE_ITEMS,
} from "@/ui/links/link-builder/constants";
import { LinkFormData } from "@/ui/links/link-builder/link-builder-provider";
import { X } from "@/ui/shared/icons";
import { useMediaQuery } from "@dub/ui";
import { AnimatePresence, motion } from "motion/react";
import { ReactNode, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";

const TOGGLES = MORE_ITEMS.filter(({ type }) => type === "boolean");

export function OptionsList() {
  const { isMobile } = useMediaQuery();

  const { control, setValue } = useFormContext<LinkFormData>();
  const data = useWatch({ control });

  const enabledToggles = useMemo(
    () =>
      TOGGLES.filter(({ key, enabled }) =>
        // @ts-ignore - useWatch returns a deep partial, should be fixed in a future react-hook-form release
        enabled ? enabled(data) : data[key],
      ),
    [data],
  );

  const enabledItems = useMemo(
    () => [
      ...enabledToggles,
      ...(isMobile
        ? // @ts-ignore - useWatch returns a deep partial, should be fixed in a future react-hook-form release
          MOBILE_MORE_ITEMS.filter(({ enabled }) => enabled?.(data)).map(
            (item) => ({
              ...item,
              // @ts-ignore - useWatch returns a deep partial, should be fixed in a future react-hook-form release
              label: item.badgeLabel?.(data) || item.label,
            }),
          )
        : []),
    ],
    [enabledToggles, isMobile, data],
  );

  return enabledItems.length ? (
    <div className="flex flex-wrap gap-2">
      <AnimatePresence>
        {enabledItems.map((item) => {
          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.1 }}
            >
              <ToggleBadge
                toggle={item}
                {...("enabled" in item &&
                  typeof item.enabled === "function" &&
                  // @ts-ignore - useWatch returns a deep partial, should be fixed in a future react-hook-form release
                  item.enabled(data) && {
                    icon: <item.icon className="size-3.5 text-blue-500" />,
                  })}
                onRemove={() =>
                  "remove" in item && typeof item.remove === "function"
                    ? item.remove(setValue)
                    : setValue(item.key as any, false, { shouldDirty: true })
                }
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  ) : null;
}

function ToggleBadge({
  toggle,
  onRemove,
  icon,
}: {
  toggle: (typeof TOGGLES)[number];
  onRemove: () => void;
  icon?: ReactNode;
}) {
  return (
    <span className="group flex cursor-default items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-50 pl-1.5 text-xs text-neutral-600">
      {icon}
      {toggle.label}
      <button
        type="button"
        onClick={onRemove}
        className="-ml-1 p-1 text-neutral-400 hover:text-neutral-500"
      >
        <X className="size-3.5" />
      </button>
    </span>
  );
}
