import { getQRAsCanvas, getQRAsSVGDataUri, getQRData, DotType } from "@/lib/qr";
import { DOT_TYPES, CORNER_SQUARE_TYPES, CORNER_DOT_TYPES, CornerSquareType, CornerDotType } from "@/lib/qr/constants";
import { generatePath } from "@/lib/qr/utils";
import { generateCornerSquarePath, generateCornerDotPath } from "@/lib/qr/eye-patterns";
import useDomain from "@/lib/swr/use-domain";
import useWorkspace from "@/lib/swr/use-workspace";
import { QRLinkProps } from "@/lib/types";
import { QRCode } from "@/ui/shared/qr-code";
import {
  Button,
  ButtonTooltip,
  IconMenu,
  InfoTooltip,
  Modal,
  Popover,
  ShimmerDots,
  SimpleTooltipContent,
  Switch,
  Tooltip,
  TooltipContent,
  useCopyToClipboard,
  useMediaQuery,
} from "@dub/ui";
import { useLocalStorage } from "@/ui/hooks/use-local-storage";
import {
  Check,
  Check2,
  Copy,
  CrownSmall,
  Download,
  Hyperlink,
  Photo,
} from "@dub/ui/icons";
import { API_DOMAIN, cn, DUB_QR_LOGO, linkConstructor } from "@dub/utils";
import { frameStyleToFrameType } from "@/lib/qr/types";
import { AnimatePresence, motion } from "motion/react";
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import { BaseBadgeTooltip } from "../shared/pro-badge-tooltip";
import type { QRCodeDesign } from "@/ui/modals/link-qr-modal.types";
export type { QRCodeDesign } from "@/ui/modals/link-qr-modal.types";

const DEFAULT_COLORS = [
  "#000000",
  "#C73E33",
  "#DF6547",
  "#F4B3D7",
  "#F6CF54",
  "#49A065",
  "#2146B7",
  "#AE49BF",
];

// Pattern preview using actual QR rendering functions
function PatternPreview({ pattern, color }: { pattern: DotType; color: string }) {
  const size = 32;

  // Create a small module grid with an S-pattern to demonstrate the pattern style
  // X X X
  // X
  //   X
  // X X X
  const modules: boolean[][] = [
    [true,  true,  true],
    [true,  false, false],
    [false, true,  false],
    [true,  true,  true],
  ];

  // Use the actual generatePath function from our QR rendering
  const path = generatePath(modules, 0, pattern);

  const viewBoxSize = 3;
  const viewBoxHeight = 4;
  const padding = 0.2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`${-padding} ${-padding} ${viewBoxSize + padding * 2} ${viewBoxHeight + padding * 2}`}
      fill="none"
      preserveAspectRatio="xMidYMid meet"
    >
      <path d={path} fill={color} />
    </svg>
  );
}

// Corner Square preview (7x7 outer frame)
function CornerSquarePreview({ type, color }: { type: CornerSquareType; color: string }) {
  const size = 32;
  const eyeSize = 7;

  // Mock eye position for preview - use the actual path generation function
  const eye = { x: 0, y: 0, size: eyeSize, corner: "top-left" as const };
  const margin = 0;

  // Use the actual generateCornerSquarePath function
  const path = generateCornerSquarePath(eye, type, margin);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`-0.5 -0.5 ${eyeSize + 1} ${eyeSize + 1}`}
      fill="none"
      preserveAspectRatio="xMidYMid meet"
    >
      <path d={path} fill={color} fillRule="evenodd" shapeRendering="crispEdges" />
    </svg>
  );
}

// Corner Dot preview (3x3 inner dot)
function CornerDotPreview({ type, color }: { type: CornerDotType; color: string }) {
  const size = 32;
  const eyeSize = 7;

  // Mock eye position for preview - use the actual path generation function
  const eye = { x: 0, y: 0, size: eyeSize, corner: "top-left" as const };
  const margin = 0;

  // Use the actual generateCornerDotPath function
  const path = generateCornerDotPath(eye, type, margin);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`-0.5 -0.5 ${eyeSize + 1} ${eyeSize + 1}`}
      fill="none"
      preserveAspectRatio="xMidYMid meet"
    >
      <path d={path} fill={color} />
    </svg>
  );
}

// Using shared QRCodeDesign from link-qr-modal.types

type LinkQRModalProps = {
  props: QRLinkProps;
  onSave?: (data: QRCodeDesign) => void;
};

function LinkQRModal(
  props: {
    showLinkQRModal: boolean;
    setShowLinkQRModal: Dispatch<SetStateAction<boolean>>;
  } & LinkQRModalProps,
) {
  return (
    <Modal
      showModal={props.showLinkQRModal}
      setShowModal={props.setShowLinkQRModal}
      className="max-w-[500px]"
    >
      <LinkQRModalInner {...props} />
    </Modal>
  );
}

function LinkQRModalInner({
  props,
  onSave,
  showLinkQRModal,
  setShowLinkQRModal,
}: {
  showLinkQRModal: boolean;
  setShowLinkQRModal: Dispatch<SetStateAction<boolean>>;
} & LinkQRModalProps) {
  const { id: workspaceId, slug, plan, logo: workspaceLogo } = useWorkspace();
  const id = useId();
  const { isMobile } = useMediaQuery();
  const { logo: domainLogo } = useDomain({
    slug: props.domain,
    enabled: showLinkQRModal,
  });

  const url = useMemo(() => {
    return props.key && props.domain
      ? linkConstructor({ key: props.key, domain: props.domain })
      : undefined;
  }, [props.key, props.domain]);

  // Use per-link localStorage key instead of workspace-level
  // This ensures each link has its own QR customization
  const localStorageKey = props.domain && props.key
    ? `qr-code-design-${props.domain}-${props.key}`
    : `qr-code-design-new-link`; // Fallback for links being created

  const [rawData, setData] = useLocalStorage<QRCodeDesign>(
    localStorageKey,
    {
      fgColor: "#000000",
      qrHideLogo: false,
      qrDotType: "square",
      qrCornerSquareType: "square",
      qrCornerDotType: "square",
      qrShape: "square",
      hasFrame: false,
      qrFrameStyle: undefined,
      qrFrameColor: undefined,
      qrDotsColor: undefined,
      qrCornerSquareColor: undefined,
      qrCornerDotColor: undefined,
    },
  );

  // Migrate any legacy keys and provide defaults for missing fields
  const baseDesign = useMemo(() => {
    const d = rawData || ({} as Partial<QRCodeDesign>);
    const migrated: QRCodeDesign = {
      fgColor: d.fgColor ?? "#000000",
      qrHideLogo: d.qrHideLogo ?? (d as any).hideLogo ?? false,
      qrDotType: d.qrDotType ?? (d as any).dotType ?? "square",
      qrCornerSquareType: d.qrCornerSquareType ?? (d as any).cornerSquareType ?? "square",
      qrCornerDotType: d.qrCornerDotType ?? (d as any).cornerDotType ?? "square",
      qrShape: d.qrShape ?? "square",
      hasFrame: Boolean(d.qrFrameStyle ?? (d as any).frameStyle),
      qrFrameStyle:
        (d.qrFrameStyle ?? ((d as any).frameStyle === "none" ? undefined : (d as any).frameStyle)) ?? undefined,
      qrFrameColor: d.qrFrameColor ?? (d as any).frameColor ?? undefined,
      qrDotsColor: d.qrDotsColor ?? (d as any).dotsColor ?? undefined,
      qrCornerSquareColor: d.qrCornerSquareColor ?? (d as any).cornerSquareColor ?? undefined,
      qrCornerDotColor: d.qrCornerDotColor ?? (d as any).cornerDotColor ?? undefined,
    };
    return migrated;
  }, [rawData]);

  // Local draft state: edits apply here and only persist on Save
  const [draft, setDraft] = useState<QRCodeDesign>(baseDesign);

  // Reset draft when opening the modal to the latest persisted design
  useEffect(() => {
    if (showLinkQRModal) {
      setDraft(baseDesign);
    }
  }, [showLinkQRModal, baseDesign]);

  const frameOptions = useMemo(() => {
    const type = frameStyleToFrameType(draft.qrFrameStyle as any);
    return type
      ? {
          type,
          color: draft.qrFrameColor || draft.fgColor,
        }
      : undefined;
  }, [draft.qrFrameStyle, draft.qrFrameColor, draft.fgColor]);

  const hideLogo = draft.qrHideLogo && plan !== "free";
  const logo =
    plan === "free" ? DUB_QR_LOGO : domainLogo || workspaceLogo || DUB_QR_LOGO;

  const qrData = useMemo(
    () =>
      url
        ? getQRData({
            url,
            fgColor: draft.qrDotsColor || draft.fgColor,
            hideLogo,
            logo,
            qrShape: draft.qrShape,
            dotsOptions: {
              type: draft.qrDotType,
              color: draft.qrDotsColor || draft.fgColor,
            },
            eyeOptions: {
              cornerSquare: {
                type: draft.qrCornerSquareType,
                color: draft.qrCornerSquareColor || draft.fgColor,
              },
              cornerDot: {
                type: draft.qrCornerDotType,
                color: draft.qrCornerDotColor || draft.fgColor,
              },
            },
            frameOptions,
          })
        : null,
    [
      url,
      draft.fgColor,
      draft.qrDotsColor,
      draft.qrCornerSquareColor,
      draft.qrCornerDotColor,
      draft.qrShape,
      draft.qrDotType,
      draft.qrCornerSquareType,
      draft.qrCornerDotType,
      hideLogo,
      logo,
      frameOptions,
    ],
  );

  const qrDataForActions = useMemo(
    () => (qrData ? { ...qrData, frameOptions } : null),
    [qrData, frameOptions],
  );

  const onColorChange = useDebouncedCallback(
    (color: string) =>
      setDraft((d) => ({
        ...d,
        fgColor: color,
        qrDotsColor: color,
        qrCornerSquareColor: color,
        qrCornerDotColor: color,
      })),
    500,
  );

  const onFrameColorChange = useDebouncedCallback(
    (color: string) => setDraft((d) => ({ ...d, qrFrameColor: color })),
    500,
  );

  return (
    <form
      className="flex flex-col gap-6 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        // Flush any pending debounced updates before closing
        // @ts-ignore - flush is provided by use-debounce
        onColorChange.flush?.();
        // @ts-ignore - flush is provided by use-debounce
        onFrameColorChange.flush?.();
        // Persist final draft state to localStorage
        setData(draft);
        setShowLinkQRModal(false);
        onSave?.(draft);
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">QR Code</h3>
          <BaseBadgeTooltip
            content={
              <SimpleTooltipContent
                title="Set a custom QR code design to improve click-through rates."
                cta="Learn more."
                href="https://dub.co/help/article/custom-qr-codes"
              />
            }
          />
        </div>
        <div className="max-md:hidden">
          <Tooltip
            content={
              <div className="px-2 py-1 text-xs text-neutral-700">
                Press{" "}
                <strong className="font-medium text-neutral-950">Q</strong> to
                open this quickly
              </div>
            }
            side="right"
          >
            <kbd className="flex size-6 cursor-default items-center justify-center rounded-md border border-neutral-200 font-sans text-xs text-neutral-950">
              Q
            </kbd>
          </Tooltip>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-700">
              QR Code Preview
            </span>
            <InfoTooltip
              content={
                <SimpleTooltipContent
                  title="Customize your QR code to fit your brand."
                  cta="Learn more."
                  href="https://dub.co/help/article/custom-qr-codes"
                />
              }
            />
          </div>
          {url && qrDataForActions && (
            <div className="flex items-center gap-2">
              <DownloadPopover qrData={qrDataForActions} props={props}>
                <div>
                  <ButtonTooltip
                    tooltipProps={{
                      content: "Download QR code",
                    }}
                  >
                    <Download className="h-4 w-4 text-neutral-500" />
                  </ButtonTooltip>
                </div>
              </DownloadPopover>
              <CopyPopover qrData={qrDataForActions} props={props}>
                <div>
                  <ButtonTooltip
                    tooltipProps={{
                      content: "Copy QR code",
                    }}
                  >
                    <Copy className="h-4 w-4 text-neutral-500" />
                  </ButtonTooltip>
                </div>
              </CopyPopover>
            </div>
          )}
        </div>
        <div className="relative mt-2 flex h-52 items-center justify-center overflow-hidden rounded-md border border-neutral-300">
          {!isMobile && (
            <ShimmerDots className="opacity-30 [mask-image:radial-gradient(40%_80%,transparent_50%,black)]" />
          )}
          {url && (
            <AnimatePresence mode="wait">
              <motion.div
                key={
                  draft.fgColor +
                  draft.qrHideLogo +
                  draft.qrDotType +
                  draft.qrCornerSquareType +
                  draft.qrCornerDotType +
                  draft.qrShape +
                  draft.hasFrame +
                  draft.qrFrameStyle +
                  draft.qrFrameColor
                }
                initial={{ filter: "blur(2px)", opacity: 0.4 }}
                animate={{ filter: "blur(0px)", opacity: 1 }}
                exit={{ filter: "blur(2px)", opacity: 0.4 }}
                transition={{ duration: 0.1 }}
                className="relative flex size-full items-center justify-center"
              >
                <QRCode
                  url={url}
                  fgColor={draft.fgColor}
                  hideLogo={draft.qrHideLogo}
                  logo={logo}
                  scale={1}
                  qrShape={draft.qrShape}
                  dotsOptions={{
                    type: draft.qrDotType,
                    color: draft.fgColor,
                  }}
                  eyeOptions={{
                    cornerSquare: {
                      type: draft.qrCornerSquareType,
                      color: draft.fgColor,
                    },
                    cornerDot: {
                      type: draft.qrCornerDotType,
                      color: draft.fgColor,
                    },
                  }}
                  frameOptions={frameOptions}
                />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Logo toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label
            className="text-sm font-medium text-neutral-700"
            htmlFor={`${id}-show-logo`}
          >
            Logo
          </label>
          <InfoTooltip
            content={
              <SimpleTooltipContent
                title="Display your logo in the center of the QR code."
                cta="Learn more."
                href="https://dub.co/help/article/custom-qr-codes"
              />
            }
          />
        </div>
        <Switch
          id={`${id}-hide-logo`}
          checked={!draft.qrHideLogo}
          fn={() => {
            setDraft((d) => ({ ...d, qrHideLogo: !d.qrHideLogo }));
          }}
          disabledTooltip={
            !plan || plan === "free" ? (
              <TooltipContent
                title="You need to be on the Base plan and above to customize your QR Code logo."
                cta="Upgrade to Base"
                href={slug ? `/${slug}/upgrade` : "https://dub.co/pricing"}
                target="_blank"
              />
            ) : undefined
          }
          thumbIcon={
            !plan || plan === "free" ? (
              <CrownSmall className="size-full text-neutral-500" />
            ) : undefined
          }
        />
      </div>

      {/* Dot Pattern selector */}
      <div>
        <span className="mb-2 block text-sm font-medium text-neutral-700">
          Dot Pattern
        </span>
        <div className="flex flex-wrap items-center gap-3">
          {DOT_TYPES.map((pattern) => {
            const isSelected = draft.qrDotType === pattern;
            const patternLabels: Record<DotType, string> = {
              square: "Square",
              rounded: "Rounded",
              dots: "Dots",
              classy: "Classy",
              "extra-rounded": "Extra Rounded",
            };
            return (
              <Tooltip
                key={pattern}
                content={patternLabels[pattern]}
              >
                <button
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={`Select ${patternLabels[pattern]} pattern`}
                  onClick={() => setDraft((d) => ({ ...d, qrDotType: pattern }))}
                  className={cn(
                    "flex size-12 items-center justify-center rounded-md border transition-all",
                    isSelected
                      ? "border-black bg-neutral-50 ring-1 ring-black"
                      : "border-neutral-200 hover:border-border-emphasis hover:bg-neutral-50",
                  )}
                >
                  <PatternPreview
                    pattern={pattern}
                    color={draft.fgColor}
                  />
                </button>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* Eye Pattern selectors */}
      <div>
        <span className="block text-sm font-medium text-neutral-700">
          Corner Eyes
        </span>
        <div className="mt-3 space-y-3">
          {/* Outer Frame (Corner Square) */}
          <div>
            <label className="mb-2 block text-xs font-medium text-neutral-600">
              Outer Frame
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {CORNER_SQUARE_TYPES.map((type) => {
                const isSelected = draft.qrCornerSquareType === type;
                const typeLabels: Record<CornerSquareType, string> = {
                  square: "Square",
                  rounded: "Rounded",
                  dots: "Circle",
                  "extra-rounded": "Extra Rounded",
                  leaf: "Leaf",
                };
                return (
                  <Tooltip
                    key={type}
                    content={typeLabels[type]}
                  >
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      aria-label={`Select ${typeLabels[type]} outer frame`}
                      onClick={() => setDraft((d) => ({ ...d, qrCornerSquareType: type }))}
                      className={cn(
                        "flex size-12 items-center justify-center rounded-md border transition-all",
                        isSelected
                          ? "border-black bg-neutral-50 ring-1 ring-black"
                          : "border-neutral-200 hover:border-border-emphasis hover:bg-neutral-50",
                      )}
                    >
                      <CornerSquarePreview
                        type={type}
                        color={draft.fgColor}
                      />
                    </button>
                  </Tooltip>
                );
              })}
            </div>
          </div>

          {/* Inner Dot (Corner Dot) */}
          <div>
            <label className="mb-2 block text-xs font-medium text-neutral-600">
              Inner Dot
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {CORNER_DOT_TYPES.map((type) => {
                const isSelected = draft.qrCornerDotType === type;
                const typeLabels: Record<CornerDotType, string> = {
                  square: "Square",
                  dots: "Circle",
                  rounded: "Rounded",
                };
                return (
                  <Tooltip
                    key={type}
                    content={typeLabels[type]}
                  >
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      aria-label={`Select ${typeLabels[type]} inner dot`}
                      onClick={() => setDraft((d) => ({ ...d, qrCornerDotType: type }))}
                      className={cn(
                        "flex size-12 items-center justify-center rounded-md border transition-all",
                        isSelected
                          ? "border-black bg-neutral-50 ring-1 ring-black"
                          : "border-neutral-200 hover:border-border-emphasis hover:bg-neutral-50",
                      )}
                    >
                      <CornerDotPreview
                        type={type}
                        color={draft.fgColor}
                      />
                    </button>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* QR Shape selector */}
      <div>
        <span className="mb-2 block text-sm font-medium text-neutral-700">
          QR Code Shape
        </span>
        <div className="flex items-center gap-3">
          <Tooltip content="Square">
            <button
              type="button"
              aria-pressed={draft.qrShape === "square"}
              aria-label="Select square shape"
              onClick={() => setDraft((d) => {
                // Auto-convert circle frames to square frames when switching shape
                const newFrameStyle = d.qrFrameStyle
                  ? (d.qrFrameStyle === "solid-circle" || d.qrFrameStyle === "dotted-circle")
                    ? "square"
                    : d.qrFrameStyle
                  : undefined;
                return { ...d, qrShape: "square", qrFrameStyle: newFrameStyle };
              })}
              className={cn(
                "flex size-12 items-center justify-center rounded-md border transition-all",
                draft.qrShape === "square"
                  ? "border-black bg-neutral-50 ring-1 ring-black"
                  : "border-neutral-200 hover:border-border-emphasis hover:bg-neutral-50",
              )}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="6" y="6" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </button>
          </Tooltip>
          <Tooltip content="Circle">
            <button
              type="button"
              aria-pressed={draft.qrShape === "circle"}
              aria-label="Select circle shape"
              onClick={() => setDraft((d) => {
                // Auto-convert square frames to circle frames when switching shape
                const newFrameStyle = d.qrFrameStyle
                  ? (d.qrFrameStyle === "square" || d.qrFrameStyle === "rounded")
                    ? "solid-circle"
                    : d.qrFrameStyle
                  : undefined;
                return { ...d, qrShape: "circle", qrFrameStyle: newFrameStyle };
              })}
              className={cn(
                "flex size-12 items-center justify-center rounded-md border transition-all",
                draft.qrShape === "circle"
                  ? "border-black bg-neutral-50 ring-1 ring-black"
                  : "border-neutral-200 hover:border-border-emphasis hover:bg-neutral-50",
              )}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Frame style selector - Always visible with "No Frame" option */}
      <div>
        <span className="mb-2 block text-sm font-medium text-neutral-700">
          Frame Style
        </span>
        <div className="flex items-center gap-3">
          {/* No Frame option - always available */}
          <Tooltip content="No Frame">
            <button
              type="button"
              aria-pressed={draft.qrFrameStyle === undefined}
              aria-label="No frame"
              onClick={() => setDraft((d) => ({ ...d, qrFrameStyle: undefined }))}
              className={cn(
                "flex size-12 items-center justify-center rounded-md border transition-all",
                draft.qrFrameStyle === undefined
                  ? "border-black bg-neutral-50 ring-1 ring-black"
                  : "border-neutral-200 hover:border-border-emphasis hover:bg-neutral-50",
              )}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <line x1="4" y1="20" x2="20" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </Tooltip>
          {draft.qrShape === "square" ? (
            <>
              <Tooltip content="Square">
                <button
                  type="button"
                  aria-pressed={draft.qrFrameStyle === "square"}
                  aria-label="Select square frame"
                  onClick={() => setDraft((d) => ({ ...d, qrFrameStyle: "square" }))}
                  className={cn(
                    "flex size-12 items-center justify-center rounded-md border transition-all",
                    draft.qrFrameStyle === "square"
                      ? "border-black bg-neutral-50 ring-1 ring-black"
                      : "border-neutral-200 hover:border-border-emphasis hover:bg-neutral-50",
                  )}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="6" y="6" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                </button>
              </Tooltip>
              <Tooltip content="Rounded">
                <button
                  type="button"
                  aria-pressed={draft.qrFrameStyle === "rounded"}
                  aria-label="Select rounded frame"
                  onClick={() => setDraft((d) => ({ ...d, qrFrameStyle: "rounded" }))}
                  className={cn(
                    "flex size-12 items-center justify-center rounded-md border transition-all",
                    draft.qrFrameStyle === "rounded"
                      ? "border-black bg-neutral-50 ring-1 ring-black"
                      : "border-neutral-200 hover:border-border-emphasis hover:bg-neutral-50",
                  )}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                </button>
              </Tooltip>
            </>
          ) : (
            <>
              <Tooltip content="Solid Circle">
                <button
                  type="button"
                  aria-pressed={draft.qrFrameStyle === "solid-circle"}
                  aria-label="Select solid circle frame"
                  onClick={() => setDraft((d) => ({ ...d, qrFrameStyle: "solid-circle" }))}
                  className={cn(
                    "flex size-12 items-center justify-center rounded-md border transition-all",
                    draft.qrFrameStyle === "solid-circle"
                      ? "border-black bg-neutral-50 ring-1 ring-black"
                      : "border-neutral-200 hover:border-border-emphasis hover:bg-neutral-50",
                  )}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                </button>
              </Tooltip>
              <Tooltip content="Dotted Circle">
                <button
                  type="button"
                  aria-pressed={draft.qrFrameStyle === "dotted-circle"}
                  aria-label="Select dotted circle frame"
                  onClick={() => setDraft((d) => ({ ...d, qrFrameStyle: "dotted-circle" }))}
                  className={cn(
                    "flex size-12 items-center justify-center rounded-md border transition-all",
                    draft.qrFrameStyle === "dotted-circle"
                      ? "border-black bg-neutral-50 ring-1 ring-black"
                      : "border-neutral-200 hover:border-border-emphasis hover:bg-neutral-50",
                  )}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" fill="none" />
                  </svg>
                </button>
              </Tooltip>
            </>
          )}
        </div>
      </div>

      {/* Frame Color selector - Always visible, disabled when no frame selected */}
      <div className={cn("transition-opacity", !draft.qrFrameStyle && "opacity-40")}>
        <span className="mb-2 block text-sm font-medium text-neutral-700">
          Frame Color
        </span>
        <div className="flex gap-6">
          <div className={cn(
            "relative flex h-9 w-32 shrink-0 rounded-md shadow-sm",
            !draft.qrFrameStyle && "pointer-events-none cursor-not-allowed"
          )}>
            <Tooltip
              content={
                draft.qrFrameStyle ? (
                  <div className="flex max-w-xs flex-col items-center space-y-3 p-5 text-center">
                    <HexColorPicker
                      color={draft.qrFrameColor || draft.fgColor}
                      onChange={onFrameColorChange}
                    />
                  </div>
                ) : (
                  "Select a frame style to customize color"
                )
              }
            >
              <div
                className="h-full w-12 rounded-l-md border"
                style={{
                  backgroundColor: draft.qrFrameColor || draft.fgColor,
                  borderColor: draft.qrFrameColor || draft.fgColor,
                }}
              />
            </Tooltip>
            <HexColorInput
              color={draft.qrFrameColor || draft.fgColor}
              onChange={onFrameColorChange}
              prefixed
              disabled={!draft.qrFrameStyle}
              style={{ borderColor: draft.qrFrameColor || draft.fgColor }}
              className="block w-full rounded-r-md border-2 border-l-0 pl-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-black sm:text-sm disabled:cursor-not-allowed disabled:bg-neutral-50"
            />
          </div>
        </div>
      </div>

      {/* Color selector */}
      <div>
        <span className="block text-sm font-medium text-neutral-700">
          Dots Color
        </span>
        <div className="mt-2 flex gap-6">
          <div className="relative flex h-9 w-32 shrink-0 rounded-md shadow-sm">
            <Tooltip
              content={
                <div className="flex max-w-xs flex-col items-center space-y-3 p-5 text-center">
                  <HexColorPicker
                    color={draft.fgColor}
                    onChange={onColorChange}
                  />
                </div>
              }
            >
              <div
                className="h-full w-12 rounded-l-md border"
                style={{
                  backgroundColor: draft.fgColor,
                  borderColor: draft.fgColor,
                }}
              />
            </Tooltip>
            <HexColorInput
              id="color"
              name="color"
              color={draft.fgColor}
              onChange={onColorChange}
              prefixed
              style={{ borderColor: draft.fgColor }}
              className="block w-full rounded-r-md border-2 border-l-0 pl-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-black sm:text-sm"
            />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            {DEFAULT_COLORS.map((color) => {
              const isSelected = draft.fgColor === color;
              return (
                <button
                  key={color}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setDraft((d) => ({ ...d, fgColor: color }))}
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full transition-all",
                    isSelected
                      ? "ring-1 ring-black ring-offset-[3px]"
                      : "ring-black/10 hover:ring-4",
                  )}
                  style={{ backgroundColor: color }}
                >
                  {isSelected && <Check2 className="size-4 text-white" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          text="Cancel"
          className="h-9 w-fit"
          onClick={() => {
            setShowLinkQRModal(false);
          }}
        />
        <Button
          type="submit"
          variant="primary"
          text="Save changes"
          className="h-9 w-fit"
        />
      </div>
    </form>
  );
}

function DownloadPopover({
  qrData,
  props,
  children,
}: PropsWithChildren<{
  qrData: ReturnType<typeof getQRData>;
  props: QRLinkProps;
}>) {
  const anchorRef = useRef<HTMLAnchorElement>(null);

  function download(url: string, extension: string) {
    if (!anchorRef.current) return;
    anchorRef.current.href = url;
    anchorRef.current.download = `${props.key}-qrcode.${extension}`;
    anchorRef.current.click();
    setOpenPopover(false);
  }

  const [openPopover, setOpenPopover] = useState(false);

  return (
    <div>
      <Popover
        content={
          <div className="grid p-1 sm:min-w-48">
            <button
              type="button"
              onClick={async () => {
                download(await getQRAsSVGDataUri(qrData), "svg");
              }}
              className="rounded-md p-2 text-left text-sm font-medium text-neutral-500 transition-all duration-75 hover:bg-neutral-100"
            >
              <IconMenu
                text="Download SVG"
                icon={<Photo className="h-4 w-4" />}
              />
            </button>
            <button
              type="button"
              onClick={async () => {
                download(
                  (await getQRAsCanvas(qrData, "image/png")) as string,
                  "png",
                );
              }}
              className="rounded-md p-2 text-left text-sm font-medium text-neutral-500 transition-all duration-75 hover:bg-neutral-100"
            >
              <IconMenu
                text="Download PNG"
                icon={<Photo className="h-4 w-4" />}
              />
            </button>
            <button
              type="button"
              onClick={async () => {
                download(
                  (await getQRAsCanvas(qrData, "image/jpeg")) as string,
                  "jpg",
                );
              }}
              className="rounded-md p-2 text-left text-sm font-medium text-neutral-500 transition-all duration-75 hover:bg-neutral-100"
            >
              <IconMenu
                text="Download JPEG"
                icon={<Photo className="h-4 w-4" />}
              />
            </button>
          </div>
        }
        openPopover={openPopover}
        setOpenPopover={setOpenPopover}
      >
        {children}
      </Popover>
      {/* This will be used to prompt downloads. */}
      <a
        className="hidden"
        download={`${props.key}-qrcode.svg`}
        ref={anchorRef}
      />
    </div>
  );
}

function CopyPopover({
  qrData,
  props,
  children,
}: PropsWithChildren<{
  qrData: ReturnType<typeof getQRData>;
  props: QRLinkProps;
}>) {
  const [openPopover, setOpenPopover] = useState(false);
  const [copiedURL, copyUrlToClipboard] = useCopyToClipboard(2000);
  const [copiedImage, copyImageToClipboard] = useCopyToClipboard(2000);

  const copyToClipboard = async () => {
    try {
      const canvas = await getQRAsCanvas(qrData, "image/png", true);
      (canvas as HTMLCanvasElement).toBlob(async function (blob) {
        // @ts-ignore
        const item = new ClipboardItem({ "image/png": blob });
        await copyImageToClipboard(item);
        setOpenPopover(false);
      });
    } catch (e) {
      throw e;
    }
  };

  return (
    <Popover
      content={
        <div className="grid p-1 sm:min-w-48">
          <button
            type="button"
            onClick={async () => {
              toast.promise(copyToClipboard, {
                loading: "Copying QR code to clipboard...",
                success: "Copied QR code to clipboard!",
                error: "Failed to copy",
              });
            }}
            className="rounded-md p-2 text-left text-sm font-medium text-neutral-500 transition-all duration-75 hover:bg-neutral-100"
          >
            <IconMenu
              text="Copy Image"
              icon={
                copiedImage ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Photo className="h-4 w-4" />
                )
              }
            />
          </button>
          <button
            type="button"
            onClick={() => {
              const url = `${API_DOMAIN}/qr?url=${linkConstructor({
                key: props.key,
                domain: props.domain,
                searchParams: {
                  qr: "1",
                },
              })}${qrData.hideLogo ? "&hideLogo=true" : ""}`;
              toast.promise(copyUrlToClipboard(url), {
                success: "Copied QR code URL to clipboard!",
              });
              setOpenPopover(false);
            }}
            className="rounded-md p-2 text-left text-sm font-medium text-neutral-500 transition-all duration-75 hover:bg-neutral-100"
          >
            <IconMenu
              text="Copy URL"
              icon={
                copiedURL ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Hyperlink className="h-4 w-4" />
                )
              }
            />
          </button>
        </div>
      }
      openPopover={openPopover}
      setOpenPopover={setOpenPopover}
    >
      {children}
    </Popover>
  );
}

export function useLinkQRModal(props: LinkQRModalProps) {
  const [showLinkQRModal, setShowLinkQRModal] = useState(false);

  const LinkQRModalCallback = useCallback(() => {
    return (
      <LinkQRModal
        showLinkQRModal={showLinkQRModal}
        setShowLinkQRModal={setShowLinkQRModal}
        {...props}
      />
    );
  }, [showLinkQRModal, setShowLinkQRModal]);

  return useMemo(
    () => ({
      setShowLinkQRModal,
      LinkQRModal: LinkQRModalCallback,
    }),
    [setShowLinkQRModal, LinkQRModalCallback],
  );
}
