import useDomain from "@/lib/swr/use-domain";
import useWorkspace from "@/lib/swr/use-workspace";
import { LinkFormData } from "@/ui/links/link-builder/link-builder-provider";
import { QRCode } from "@/ui/shared/qr-code";
import {
  Button,
  InfoTooltip,
  ShimmerDots,
  SimpleTooltipContent,
  useInViewport,
  useMediaQuery,
} from "@dub/ui";
import { useLocalStorage } from "@/ui/hooks/use-local-storage";
import { Pen2, QRCode as QRCodeIcon } from "@dub/ui/icons";
import { DUB_QR_LOGO, linkConstructor } from "@dub/utils";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useDebounce } from "use-debounce";
import { QRCodeDesign, useLinkQRModal } from "../../modals/link-qr-modal";
import { useEffect } from "react";
import { useLinkBuilderKeyboardShortcut } from "./use-link-builder-keyboard-shortcut";

export function QRCodePreview() {
  const { isMobile } = useMediaQuery();
  const {
    id: workspaceId,
    logo: workspaceLogo,
    plan: workspacePlan,
  } = useWorkspace();

  const { control } = useFormContext<LinkFormData>();
  const [rawKey, rawDomain] = useWatch({ control, name: ["key", "domain"] });
  const [key] = useDebounce(rawKey, 500);
  const [domain] = useDebounce(rawDomain, 500);

  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useInViewport(ref);

  const { logo: domainLogo } = useDomain({
    slug: rawDomain,
    enabled: isVisible,
  });

  // Use per-link localStorage key to match the modal
  // This ensures each link shows its own QR customization
  const localStorageKey = domain && key
    ? `qr-code-design-${domain}-${key}`
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

  // Migrate any legacy schema to the new qr* fields
  function migrateQRCodeDesign(d: any): QRCodeDesign {
    if (!d || typeof d !== "object") {
      return {
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
      } as QRCodeDesign;
    }

    const migrated: QRCodeDesign = {
      fgColor: d.fgColor ?? "#000000",
      qrHideLogo: d.qrHideLogo ?? d.hideLogo ?? false,
      qrDotType: d.qrDotType ?? d.dotType ?? "square",
      qrCornerSquareType: d.qrCornerSquareType ?? d.cornerSquareType ?? "square",
      qrCornerDotType: d.qrCornerDotType ?? d.cornerDotType ?? "square",
      qrShape: d.qrShape ?? "square",
      hasFrame: Boolean(d.qrFrameStyle ?? d.frameStyle),
      qrFrameStyle:
        (d.qrFrameStyle ?? (d.frameStyle === "none" ? undefined : d.frameStyle)) ??
        undefined,
      qrFrameColor: d.qrFrameColor ?? d.frameColor ?? undefined,
      qrDotsColor: d.qrDotsColor ?? d.dotsColor ?? undefined,
      qrCornerSquareColor:
        d.qrCornerSquareColor ?? d.cornerSquareColor ?? undefined,
      qrCornerDotColor: d.qrCornerDotColor ?? d.cornerDotColor ?? undefined,
    };

    return migrated;
  }

  const data = migrateQRCodeDesign(rawData);

  // If migration changed structure, persist the new version once
  useEffect(() => {
    if (!rawData) return;
    const hasLegacyFields =
      (rawData as any).hideLogo !== undefined ||
      (rawData as any).dotType !== undefined ||
      (rawData as any).cornerSquareType !== undefined ||
      (rawData as any).cornerDotType !== undefined ||
      (rawData as any).frameStyle !== undefined ||
      (rawData as any).frameColor !== undefined ||
      (rawData as any).dotsColor !== undefined ||
      (rawData as any).cornerSquareColor !== undefined ||
      (rawData as any).cornerDotColor !== undefined;
    if (hasLegacyFields) {
      setData(data);
    }
  }, [rawData, setData, data]);

  const shortLinkUrl = useMemo(() => {
    return key && domain ? linkConstructor({ key, domain }) : undefined;
  }, [key, domain]);

  const hideLogo = data.qrHideLogo && workspacePlan !== "free";
  const logo =
    workspacePlan === "free"
      ? DUB_QR_LOGO
      : domainLogo || workspaceLogo || DUB_QR_LOGO;

  // Construct frame options from current data structure
  const frameOptions = data.qrFrameStyle
    ? {
        type:
          (data.qrFrameStyle === "rounded"
            ? "rounded-square"
            : data.qrFrameStyle === "solid-circle"
              ? "circle"
              : data.qrFrameStyle === "dotted-circle"
                ? "dots-circle"
                : data.qrFrameStyle) as any,
        color: data.qrFrameColor || data.qrDotsColor || data.fgColor,
      }
    : undefined;

  const { LinkQRModal, setShowLinkQRModal } = useLinkQRModal({
    props: {
      domain: rawDomain,
      key: rawKey,
    },
    onSave: (data) => setData(data),
  });

  useLinkBuilderKeyboardShortcut("q", () => setShowLinkQRModal(true), {
    enabled: Boolean(shortLinkUrl),
  });

  return (
    <div ref={ref}>
      <LinkQRModal />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-neutral-700">QR Code</h2>
          <InfoTooltip
            content={
              <SimpleTooltipContent
                title="Set a custom QR code design to improve click-through rates."
                cta="Learn more."
                href="https://dub.co/help/article/custom-qr-codes"
              />
            }
          />
        </div>
      </div>
      <div className="relative z-0 mt-2 h-24 overflow-hidden rounded-md border border-neutral-300">
        <Button
          type="button"
          variant="secondary"
          icon={<Pen2 className="mx-px size-4" />}
          className="absolute right-2 top-2 z-10 h-8 w-fit bg-white px-1.5"
          onClick={() => setShowLinkQRModal(true)}
        />
        {!isMobile && (
          <ShimmerDots className="opacity-30 [mask-image:radial-gradient(40%_80%,transparent_50%,black)]" />
        )}
        {shortLinkUrl ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={shortLinkUrl}
              initial={{ filter: "blur(2px)", opacity: 0.4 }}
              animate={{ filter: "blur(0px)", opacity: 1 }}
              exit={{ filter: "blur(2px)", opacity: 0.4 }}
              transition={{ duration: 0.1 }}
              className="relative flex size-full items-center justify-center"
            >
              <QRCode
                url={shortLinkUrl}
                fgColor={data.qrDotsColor || data.fgColor}
                hideLogo={hideLogo}
                logo={logo}
                scale={0.5}
                qrShape={data.qrShape}
                dotsOptions={{
                  type: data.qrDotType,
                  color: data.qrDotsColor || data.fgColor,
                }}
                eyeOptions={{
                  cornerSquare: {
                    type: data.qrCornerSquareType,
                    color: data.qrCornerSquareColor || data.fgColor,
                  },
                  cornerDot: {
                    type: data.qrCornerDotType,
                    color: data.qrCornerDotColor || data.fgColor,
                  },
                }}
                frameOptions={frameOptions}
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2">
            <QRCodeIcon className="size-5 text-neutral-700" />
            <p className="max-w-32 text-center text-xs text-neutral-700">
              Enter a short link to generate a QR code
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
