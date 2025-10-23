import { getQRAsCanvas, getQRAsSVGDataUri, getQRData, DotType } from "@/lib/qr";
import { DOT_TYPES, CORNER_SQUARE_TYPES, CORNER_DOT_TYPES, FRAME_TYPES, CornerSquareType, CornerDotType, FrameType } from "@/lib/qr/constants";
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
  useLocalStorage,
  useMediaQuery,
} from "@dub/ui";
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
import { AnimatePresence, motion } from "motion/react";
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import { ProBadgeTooltip } from "../shared/pro-badge-tooltip";

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
  const eye = { x: 0, y: 0, size: eyeSize };
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
  const eye = { x: 0, y: 0, size: eyeSize };
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

// Frame preview component
function FramePreview({ type, color }: { type: FrameType; color: string }) {
  const size = 32;
  const viewBoxSize = 24;
  const padding = 2;
  const innerSize = viewBoxSize - padding * 2;
  const borderWidth = 1.5;

  if (type === "none") {
    // Show a simple square with an X through it to indicate "no frame"
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        fill="none"
      >
        <rect
          x={padding}
          y={padding}
          width={innerSize}
          height={innerSize}
          fill="#f5f5f5"
          stroke={color}
          strokeWidth={borderWidth}
          opacity={0.5}
        />
        <line
          x1={padding}
          y1={padding}
          x2={viewBoxSize - padding}
          y2={viewBoxSize - padding}
          stroke={color}
          strokeWidth={borderWidth}
          opacity={0.5}
        />
        <line
          x1={viewBoxSize - padding}
          y1={padding}
          x2={padding}
          y2={viewBoxSize - padding}
          stroke={color}
          strokeWidth={borderWidth}
          opacity={0.5}
        />
      </svg>
    );
  }

  // Create a small QR-like pattern in the center
  const qrSize = innerSize - 4;
  const qrX = padding + 2;
  const qrY = padding + 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      fill="none"
    >
      {/* Inner QR pattern */}
      <rect
        x={qrX}
        y={qrY}
        width={qrSize}
        height={qrSize}
        fill="#f5f5f5"
      />

      {/* Frame based on type */}
      {type === "square" && (
        <rect
          x={padding}
          y={padding}
          width={innerSize}
          height={innerSize}
          fill="none"
          stroke={color}
          strokeWidth={borderWidth}
        />
      )}

      {type === "rounded-square" && (
        <rect
          x={padding}
          y={padding}
          width={innerSize}
          height={innerSize}
          rx={3}
          ry={3}
          fill="none"
          stroke={color}
          strokeWidth={borderWidth}
        />
      )}

      {type === "circle" && (
        <circle
          cx={viewBoxSize / 2}
          cy={viewBoxSize / 2}
          r={(innerSize / 2) * 0.9}
          fill="none"
          stroke={color}
          strokeWidth={borderWidth}
        />
      )}

      {type === "dots-circle" && (
        <>
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i / 16) * Math.PI * 2;
            const circleCenterRadius = (innerSize / 2) * 0.9;
            const dotRadius = 0.8;
            // Match the outer extent of the solid circle: adjust dot centers
            const dotCenterRadius = circleCenterRadius - (dotRadius - borderWidth / 2);
            const cx = viewBoxSize / 2 + Math.cos(angle) * dotCenterRadius;
            const cy = viewBoxSize / 2 + Math.sin(angle) * dotCenterRadius;
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={dotRadius}
                fill={color}
              />
            );
          })}
        </>
      )}
    </svg>
  );
}

export type QRCodeDesign = {
  fgColor: string;
  hideLogo: boolean;
  dotType: DotType;
  cornerSquareType: CornerSquareType;
  cornerDotType: CornerDotType;
  qrShape: "square" | "circle";
  hasFrame: boolean;
  frameStyle?: "square" | "rounded" | "solid-circle" | "dotted-circle";
  frameColor?: string;
};

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

  const [dataPersisted, setDataPersisted] = useLocalStorage<any>(
    `qr-code-design-${workspaceId}`,
    {
      fgColor: "#000000",
      hideLogo: false,
      dotType: "square",
      cornerSquareType: "square",
      cornerDotType: "square",
      qrShape: "square",
      frameStyle: undefined, // undefined = no frame
      frameColor: undefined,
    },
  );

  // Migrate old frameType data to new structure
  const [data, setData] = useState<QRCodeDesign>(() => {
    const persisted = dataPersisted;

    // Migration: convert old frameType to new qrShape + frameStyle
    if ('frameType' in persisted && !('qrShape' in persisted)) {
      const oldFrameType = persisted.frameType;
      const migrated: QRCodeDesign = {
        ...persisted,
        qrShape: (oldFrameType === "circle" || oldFrameType === "dots-circle") ? "circle" : "square",
        frameStyle: oldFrameType === "none" ? undefined :
                   oldFrameType === "square" ? "square" :
                   oldFrameType === "rounded-square" ? "rounded" :
                   oldFrameType === "circle" ? "solid-circle" :
                   oldFrameType === "dots-circle" ? "dotted-circle" : undefined,
      };
      delete (migrated as any).frameType;
      delete (migrated as any).hasFrame; // Remove old hasFrame if exists
      return migrated;
    }

    // Remove hasFrame from persisted data if it exists (legacy cleanup)
    const cleanedData = { ...persisted };
    delete (cleanedData as any).hasFrame;

    return {
      ...cleanedData,
      qrShape: persisted.qrShape ?? "square",
      frameStyle: persisted.frameStyle ?? undefined, // undefined = no frame by default
    };
  }));

  const frameOptions = useMemo(
    () =>
      data.frameStyle
        ? {
            type: data.frameStyle,
            shape: data.qrShape,
            color: data.frameColor || data.fgColor,
          }
        : undefined,
    [data.frameStyle, data.qrShape, data.frameColor, data.fgColor],
  );

  const hideLogo = data.hideLogo && plan !== "free";
  const logo =
    plan === "free" ? DUB_QR_LOGO : domainLogo || workspaceLogo || DUB_QR_LOGO;

  const qrData = useMemo(
    () =>
      url
        ? getQRData({
            url,
            fgColor: data.fgColor,
            hideLogo,
            logo,
            qrShape: data.qrShape,
            dotsOptions: {
              type: data.dotType,
              color: data.fgColor,
            },
            eyeOptions: {
              cornerSquare: {
                type: data.cornerSquareType,
                color: data.fgColor,
              },
              cornerDot: {
                type: data.cornerDotType,
                color: data.fgColor,
              },
            },
            frameOptions,
          })
        : null,
    [
      url,
      data.fgColor,
      data.qrShape,
      data.dotType,
      data.cornerSquareType,
      data.cornerDotType,
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
    (color: string) => setData((d) => ({ ...d, fgColor: color })),
    500,
  );

  const onFrameColorChange = useDebouncedCallback(
    (color: string) => setData((d) => ({ ...d, frameColor: color })),
    500,
  );

  return (
    <form
      className="flex flex-col gap-6 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowLinkQRModal(false);

        setDataPersisted(data);
        onSave?.(data);
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">QR Code</h3>
          <ProBadgeTooltip
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
        <div className="relative mt-2 flex h-44 items-center justify-center overflow-hidden rounded-md border border-neutral-300">
          {!isMobile && (
            <ShimmerDots className="opacity-30 [mask-image:radial-gradient(40%_80%,transparent_50%,black)]" />
          )}
          {url && (
            <AnimatePresence mode="wait">
              <motion.div
                key={
                  data.fgColor +
                  data.hideLogo +
                  data.dotType +
                  data.cornerSquareType +
                  data.cornerDotType +
                  data.qrShape +
                  data.hasFrame +
                  data.frameStyle +
                  data.frameColor
                }
                initial={{ filter: "blur(2px)", opacity: 0.4 }}
                animate={{ filter: "blur(0px)", opacity: 1 }}
                exit={{ filter: "blur(2px)", opacity: 0.4 }}
                transition={{ duration: 0.1 }}
                className="relative flex size-full items-center justify-center"
              >
                <QRCode
                  url={url}
                  fgColor={data.fgColor}
                  hideLogo={data.hideLogo}
                  logo={logo}
                  scale={1}
                  qrShape={data.qrShape}
                  dotsOptions={{
                    type: data.dotType,
                    color: data.fgColor,
                  }}
                  eyeOptions={{
                    cornerSquare: {
                      type: data.cornerSquareType,
                      color: data.fgColor,
                    },
                    cornerDot: {
                      type: data.cornerDotType,
                      color: data.fgColor,
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
          checked={!data.hideLogo}
          fn={() => {
            setData((d) => ({ ...d, hideLogo: !d.hideLogo }));
          }}
          disabledTooltip={
            !plan || plan === "free" ? (
              <TooltipContent
                title="You need to be on the Pro plan and above to customize your QR Code logo."
                cta="Upgrade to Pro"
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
            const isSelected = data.dotType === pattern;
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
                  onClick={() => setData((d) => ({ ...d, dotType: pattern }))}
                  className={cn(
                    "flex size-12 items-center justify-center rounded-md border transition-all",
                    isSelected
                      ? "border-black bg-neutral-50 ring-1 ring-black"
                      : "border-neutral-200 hover:border-border-emphasis hover:bg-neutral-50",
                  )}
                >
                  <PatternPreview
                    pattern={pattern}
                    color={data.fgColor}
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
                const isSelected = data.cornerSquareType === type;
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
                      onClick={() => setData((d) => ({ ...d, cornerSquareType: type }))}
                      className={cn(
                        "flex size-12 items-center justify-center rounded-md border transition-all",
                        isSelected
                          ? "border-black bg-neutral-50 ring-1 ring-black"
                          : "border-neutral-200 hover:border-border-emphasis hover:bg-neutral-50",
                      )}
                    >
                      <CornerSquarePreview
                        type={type}
                        color={data.fgColor}
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
                const isSelected = data.cornerDotType === type;
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
                      onClick={() => setData((d) => ({ ...d, cornerDotType: type }))}
                      className={cn(
                        "flex size-12 items-center justify-center rounded-md border transition-all",
                        isSelected
                          ? "border-black bg-neutral-50 ring-1 ring-black"
                          : "border-neutral-200 hover:border-border-emphasis hover:bg-neutral-50",
                      )}
                    >
                      <CornerDotPreview
                        type={type}
                        color={data.fgColor}
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
              aria-pressed={data.qrShape === "square"}
              aria-label="Select square shape"
              onClick={() => setData((d) => {
                // Auto-convert circle frames to square frames when switching shape
                const newFrameStyle = d.frameStyle
                  ? (d.frameStyle === "solid-circle" || d.frameStyle === "dotted-circle")
                    ? "square" // Convert circle frame to default square frame
                    : d.frameStyle // Keep existing square frame (square/rounded)
                  : undefined; // Keep no frame
                return { ...d, qrShape: "square", frameStyle: newFrameStyle };
              })}
              className={cn(
                "flex size-12 items-center justify-center rounded-md border transition-all",
                data.qrShape === "square"
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
              aria-pressed={data.qrShape === "circle"}
              aria-label="Select circle shape"
              onClick={() => setData((d) => {
                // Auto-convert square frames to circle frames when switching shape
                const newFrameStyle = d.frameStyle
                  ? (d.frameStyle === "square" || d.frameStyle === "rounded")
                    ? "solid-circle" // Convert square frame to default circle frame
                    : d.frameStyle // Keep existing circle frame (solid-circle/dotted-circle)
                  : undefined; // Keep no frame
                return { ...d, qrShape: "circle", frameStyle: newFrameStyle };
              })}
              className={cn(
                "flex size-12 items-center justify-center rounded-md border transition-all",
                data.qrShape === "circle"
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
                aria-pressed={data.frameStyle === undefined}
                aria-label="No frame"
                onClick={() => setData((d) => ({ ...d, frameStyle: undefined }))}
                className={cn(
                  "flex size-12 items-center justify-center rounded-md border transition-all",
                  data.frameStyle === undefined
                    ? "border-black bg-neutral-50 ring-1 ring-black"
                    : "border-neutral-200 hover:border-border-emphasis hover:bg-neutral-50",
                )}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <line x1="4" y1="20" x2="20" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </Tooltip>
            {data.qrShape === "square" ? (
              <>
                <Tooltip content="Square">
                  <button
                    type="button"
                    aria-pressed={data.frameStyle === "square"}
                    aria-label="Select square frame"
                    onClick={() => setData((d) => ({ ...d, frameStyle: "square" }))}
                    className={cn(
                      "flex size-12 items-center justify-center rounded-md border transition-all",
                      data.frameStyle === "square"
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
                    aria-pressed={data.frameStyle === "rounded"}
                    aria-label="Select rounded frame"
                    onClick={() => setData((d) => ({ ...d, frameStyle: "rounded" }))}
                    className={cn(
                      "flex size-12 items-center justify-center rounded-md border transition-all",
                      data.frameStyle === "rounded"
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
                    aria-pressed={data.frameStyle === "solid-circle"}
                    aria-label="Select solid circle frame"
                    onClick={() => setData((d) => ({ ...d, frameStyle: "solid-circle" }))}
                    className={cn(
                      "flex size-12 items-center justify-center rounded-md border transition-all",
                      data.frameStyle === "solid-circle"
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
                    aria-pressed={data.frameStyle === "dotted-circle"}
                    aria-label="Select dotted circle frame"
                    onClick={() => setData((d) => ({ ...d, frameStyle: "dotted-circle" }))}
                    className={cn(
                      "flex size-12 items-center justify-center rounded-md border transition-all",
                      data.frameStyle === "dotted-circle"
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
      <div className={cn("transition-opacity", !data.frameStyle && "opacity-40")}>
        <span className="mb-2 block text-sm font-medium text-neutral-700">
          Frame Color
        </span>
        <div className="flex gap-6">
          <div className={cn(
            "relative flex h-9 w-32 shrink-0 rounded-md shadow-sm",
            !data.frameStyle && "pointer-events-none cursor-not-allowed"
          )}>
            <Tooltip
              content={
                data.frameStyle ? (
                  <div className="flex max-w-xs flex-col items-center space-y-3 p-5 text-center">
                    <HexColorPicker
                      color={data.frameColor || data.fgColor}
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
                  backgroundColor: data.frameColor || data.fgColor,
                  borderColor: data.frameColor || data.fgColor,
                }}
              />
            </Tooltip>
            <HexColorInput
              color={data.frameColor || data.fgColor}
              onChange={onFrameColorChange}
              prefixed
              disabled={!data.frameStyle}
              style={{ borderColor: data.frameColor || data.fgColor }}
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
                    color={data.fgColor}
                    onChange={onColorChange}
                  />
                </div>
              }
            >
              <div
                className="h-full w-12 rounded-l-md border"
                style={{
                  backgroundColor: data.fgColor,
                  borderColor: data.fgColor,
                }}
              />
            </Tooltip>
            <HexColorInput
              id="color"
              name="color"
              color={data.fgColor}
              onChange={onColorChange}
              prefixed
              style={{ borderColor: data.fgColor }}
              className="block w-full rounded-r-md border-2 border-l-0 pl-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-black sm:text-sm"
            />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            {DEFAULT_COLORS.map((color) => {
              const isSelected = data.fgColor === color;
              return (
                <button
                  key={color}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setData((d) => ({ ...d, fgColor: color }))}
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
