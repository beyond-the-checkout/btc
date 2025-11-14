import { ExpandedLinkProps } from "@/lib/types";
import { LinkFormData } from "@/ui/links/link-builder/link-builder-provider";
import {
  LinkDraft,
  useLinkDrafts,
} from "@/ui/modals/link-builder/use-link-drafts";
import { AnimatedSizeContainer, Button, Popover, useMediaQuery } from "@dub/ui";
import { CircleCheck, CircleInfo, LoadingCircle, Xmark } from "@dub/ui/icons";
import { cn, nanoid, punycode, timeAgo, truncate } from "@dub/utils";
import { ChevronDown } from "lucide-react";
import {
  forwardRef,
  SVGProps,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";

export type DraftControlsHandle = {
  onSubmitSuccessful: () => void;
  onClose: () => void;
};

type DraftControlsProps = {
  props?: ExpandedLinkProps;
  workspaceId: string;
};

export const DraftControls = forwardRef<
  DraftControlsHandle,
  DraftControlsProps
>(({ props, workspaceId }: DraftControlsProps, ref) => {
  const { isMobile } = useMediaQuery();
  const DEBUG_RESTORE = process.env.NODE_ENV === "development";

  const {
    watch,
    getValues,
    setValue,
    formState: { isDirty },
  } = useFormContext<LinkFormData>();

  const [sessionId, setSessionId] = useState(() => nanoid());
  const [isSavePending, setIsSavePending] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [openPopover, setOpenPopover] = useState(false);

  const {
    drafts: allDrafts,
    saveDraft,
    removeDraft,
  } = useLinkDrafts({
    linkId: props?.id,
    workspaceId,
  });

  const latestQrDesignFromDrafts = useCallback(() => {
    // Read directly from localStorage to avoid race conditions with React state
    const storageKey = `link-drafts:${workspaceId}`;
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (!stored) return undefined;

      const allStoredDrafts = JSON.parse(stored) as LinkDraft[];

      // Filter to current link's drafts
      const relevantDrafts = props?.id
        ? allStoredDrafts.filter((d) => d.link.id === props.id)
        : allStoredDrafts.filter((d) => !d.link.id);

      // Find the most recent one with qrDesign
      const sorted = relevantDrafts.sort((a, b) => b.timestamp - a.timestamp);
      return sorted.find((d) => d.qrDesign)?.qrDesign;
    } catch {
      return undefined;
    }
  }, [workspaceId, props?.id]);

  const getLatestDraftFromStorage = useCallback((): LinkDraft | undefined => {
    const storageKey = `link-drafts:${workspaceId}`;
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (!stored) return undefined;

      const allStoredDrafts = JSON.parse(stored) as LinkDraft[];

      // Filter to current link's drafts
      const relevantDrafts = props?.id
        ? allStoredDrafts.filter((d) => d.link.id === props.id)
        : allStoredDrafts.filter((d) => !d.link.id);

      // Return the most recent draft (if any)
      const sorted = relevantDrafts.sort((a, b) => b.timestamp - a.timestamp);
      return sorted[0];
    } catch {
      return undefined;
    }
  }, [workspaceId, props?.id]);

  const drafts = useMemo(() => {
    return allDrafts.filter((draft) => draft.id !== sessionId);
  }, [allDrafts, sessionId]);

  const saveDraftDebounced = useDebouncedCallback(
    (draftId: string, link: Partial<LinkFormData>) => {
      const qrToPersist = latestQrDesignFromDrafts();
      saveDraft(draftId, link, qrToPersist);
      setIsSavePending(false);
      setHasSaved(true);
    },
    1000,
  );

  const restoredRef = useRef(false);

  // Watch for form changes and save draft
  useEffect(() => {
    const { unsubscribe } = watch(() => {
      const [url, key] = getValues(["url", "key"]);
      if ((url || key) && isDirty) {
        setIsSavePending(true);
        const link = getValues();

        // Prefer session draft for "new link"; else latest for existing link
        const preferSessionDraft = !props?.id
          ? allDrafts.find((d) => d.id === sessionId)
          : undefined;
        const latest = preferSessionDraft ?? allDrafts[0];

        const draftId = latest?.id ?? sessionId;

        saveDraftDebounced(draftId, link);
      }
    });
    return () => unsubscribe();
  }, [
    watch,
    isDirty,
    getValues,
    allDrafts,
    sessionId,
    saveDraftDebounced,
    props?.id,
  ]);

  // Restore latest draft on open (new link only) - field-specific restore with early timing
  useLayoutEffect(() => {
    if (DEBUG_RESTORE) {
      try {
        console.log("[restore] start", {
          restored: restoredRef.current,
          hasLinkId: !!props?.id,
          isDirty,
          currentUrl: getValues("url"),
          currentKey: getValues("key"),
          sessionId,
        });
      } catch {}
    }

    if (restoredRef.current) {
      if (DEBUG_RESTORE) console.log("[restore] already restored; skipping");
      return;
    }

    // Only auto-restore for "new link"
    if (props?.id) {
      if (DEBUG_RESTORE)
        console.log("[restore] existing link; skipping auto-restore");
      restoredRef.current = true;
      return;
    }

    const latest = getLatestDraftFromStorage();
    if (!latest) {
      if (DEBUG_RESTORE) console.log("[restore] no latest draft found");
      restoredRef.current = true; // Avoid repeated checks
      return;
    }

    // Adopt the existing draft ID for this session
    if (sessionId !== latest.id) {
      setSessionId(latest.id);
      if (DEBUG_RESTORE) console.log("[restore] adopt sessionId:", latest.id);
    }

    // Hydrate only missing fields without marking dirty or touched
    const url = getValues("url")?.trim();
    const key = getValues("key")?.trim();

    if (!url && latest.link.url) {
      setValue("url", latest.link.url, {
        shouldDirty: false,
        shouldTouch: false,
      });
      if (DEBUG_RESTORE) console.log("[restore] set url:", latest.link.url);
    }

    if (!key && latest.link.key) {
      setValue("key", latest.link.key, {
        shouldDirty: false,
        shouldTouch: false,
      });
      if (DEBUG_RESTORE) console.log("[restore] set key:", latest.link.key);
    }

    restoredRef.current = true;
  }, [
    props?.id,
    isDirty,
    getValues,
    setValue,
    getLatestDraftFromStorage,
    sessionId,
  ]);

  // Debug: watch form changes to trace potential clears/resets
  useEffect(() => {
    if (!DEBUG_RESTORE) return;
    const { unsubscribe } = watch((_, meta) => {
      try {
        console.log("[watch]", meta?.name, {
          url: getValues("url"),
          key: getValues("key"),
          isDirty,
        });
      } catch {}
    });
    return () => unsubscribe();
  }, [watch, getValues, isDirty]);

  useImperativeHandle(
    ref,
    () => {
      return {
        onSubmitSuccessful() {
          // Remove the current draft when it's submitted
          removeDraft(sessionId);
        },
        onClose() {
          // Save draft instantly when the link builder is closed
          const [url, key] = getValues(["url", "key"]);
          if ((url || key) && isDirty) {
            // Flush any pending debounced saves first
            saveDraftDebounced.flush?.();

            const link = getValues();

            // Prefer session draft for "new link"; else latest for existing link
            const preferSessionDraft = !props?.id
              ? allDrafts.find((d) => d.id === sessionId)
              : undefined;
            const latest = preferSessionDraft ?? allDrafts[0];

            const draftId = latest?.id ?? sessionId;

            // Rescue QR design from any draft that has it
            const qrToPersist = latestQrDesignFromDrafts();

            if (DEBUG_RESTORE) {
              console.log("onClose - draftId:", draftId);
              console.log("onClose - rescued qrDesign:", !!qrToPersist);
            }

            saveDraft(draftId, link, qrToPersist);
          }
        },
      };
    },
    [
      sessionId,
      isDirty,
      allDrafts,
      getValues,
      saveDraft,
      removeDraft,
      props?.id,
      saveDraftDebounced,
      latestQrDesignFromDrafts,
    ],
  );

  return (isDirty && hasSaved) || drafts.length > 0 ? (
    <Popover
      content={
        <div className="w-full min-w-36 px-1 py-1 sm:w-auto">
          {drafts.length > 0 ? (
            <span className="block pb-2 pl-2.5 pt-2 text-xs font-medium text-neutral-500">
              Restore drafts
            </span>
          ) : (
            <span className="flex gap-1 px-2.5 pb-2 pt-2 text-xs text-neutral-500">
              <CircleInfo className="size-3.5" />
              Your drafts will appear here
            </span>
          )}
          {drafts.length > 0 && (
            <AnimatedSizeContainer width={!isMobile} height>
              <ul className="scrollbar-hide grid max-h-40 overflow-y-auto">
                {drafts.map((draft) => (
                  <DraftOption
                    key={draft.id}
                    draft={draft}
                    onSelect={() => {
                      setSessionId(draft.id);
                      setOpenPopover(false);
                      Object.entries(draft.link).forEach(([key, value]) => {
                        setValue(key as any, value, { shouldDirty: true });
                      });
                      toast.success("Draft restored!");
                    }}
                    onDelete={() => removeDraft(draft.id)}
                  />
                ))}
              </ul>
            </AnimatedSizeContainer>
          )}
        </div>
      }
      align="end"
      onWheel={(e) => {
        // Allows scrolling to work when the popover's in a modal
        e.stopPropagation();
      }}
      openPopover={openPopover}
      setOpenPopover={setOpenPopover}
    >
      <Button
        type="button"
        variant="outline"
        className={cn(
          "animate-fade-in group h-7 w-fit text-sm transition-colors data-[state=open]:bg-neutral-100",
          isDirty && hasSaved
            ? "pl-3 pr-4 text-neutral-400 hover:text-neutral-600"
            : "pl-4 pr-3 text-neutral-500 hover:text-neutral-700",
        )}
        text={
          isDirty && hasSaved ? (
            <div className="flex items-center justify-end gap-2">
              {isSavePending ? (
                <LoadingCircle className="size-3.5" />
              ) : (
                <CircleCheck className="size-3.5" />
              )}
              {isSavePending ? "Saving..." : "Draft saved"}
            </div>
          ) : drafts.length > 0 ? (
            <div className="flex items-center justify-end gap-1">
              Drafts
              <ChevronDown className="size-3.5 transition-transform duration-75 group-data-[state=open]:rotate-180" />
            </div>
          ) : null
        }
      />
    </Popover>
  ) : null;
});

function DraftOption({
  draft,
  onSelect,
  onDelete,
}: {
  draft: LinkDraft;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const { isMobile } = useMediaQuery();

  // Memoize time so it doesn't change on rerender
  const time = useMemo(
    () => timeAgo(new Date(draft.timestamp), { withAgo: !isMobile }),
    [draft.timestamp, isMobile],
  );

  return (
    <li
      key={draft.id}
      role="button"
      className="group flex items-center justify-between gap-2 overflow-hidden rounded py-1.5 pl-2 pr-1.5 text-sm transition-colors hover:bg-neutral-100 sm:gap-1"
      onClick={() => {
        onSelect();
      }}
    >
      <div className="flex min-w-0 grow items-center justify-between gap-4 sm:gap-8">
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2.5">
          <RestoreDraftIcon className="size-3.5 shrink-0 text-neutral-400" />
          <span className="min-w-0 max-w-40 truncate text-neutral-800">
            {truncate(punycode(draft.link.domain), 16)}/
            {draft.link.key ? (
              punycode(draft.link.key)
            ) : (
              <span className="text-neutral-400">(link)</span>
            )}
          </span>
        </div>
        <span className="whitespace-nowrap text-xs text-neutral-500">
          {time}
        </span>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          window.confirm("Are you sure you want to delete this draft?") &&
            onDelete();
        }}
        className="p-1 text-neutral-400 transition-colors hover:text-neutral-500"
        title="Delete draft"
      >
        <Xmark className="size-3.5" />
      </button>
    </li>
  );
}

function RestoreDraftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      height="18"
      width="18"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g fill="currentColor">
        <polyline
          fill="none"
          points="9 4.75 9 9 12.25 11.25"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
        <g className="origin-center group-hover:rotate-[360deg] group-hover:transition-transform group-hover:duration-500">
          <polyline
            fill="none"
            points="1.88 14.695 2.288 11.75 5.232 12.157"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d="M1.75,9C1.75,4.996,4.996,1.75,9,1.75s7.25,3.246,7.25,7.25-3.246,7.25-7.25,7.25c-3.031,0-5.627-1.86-6.71-4.5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </g>
    </svg>
  );
}
