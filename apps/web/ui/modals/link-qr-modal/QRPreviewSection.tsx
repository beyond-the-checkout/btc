import { QRCode } from "@/ui/shared/qr-code";
import {
  ButtonTooltip,
  InfoTooltip,
  ShimmerDots,
  SimpleTooltipContent,
} from "@dub/ui";
import { Copy, Download } from "@dub/ui/icons";
import { AnimatePresence, motion } from "motion/react";
import type { JSX } from "react";
import { CopyPopover, DownloadPopover } from "../link-qr-modal";
import { useLinkQRContext } from "../link-qr-modal.context";

export function QRPreviewSection(): JSX.Element {
  const {
    url,
    draft,
    logo,
    frameOptions,
    isMobile,
    qrDataForActions,
    linkProps,
  } = useLinkQRContext();

  return (
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
            <DownloadPopover qrData={qrDataForActions} props={linkProps}>
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
            <CopyPopover qrData={qrDataForActions} props={linkProps}>
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
                (draft.qrFrameStyle || "") +
                (draft.qrFrameColor || "") +
                (draft.qrDotsColor || "") +
                (draft.qrCornerSquareColor || "") +
                (draft.qrCornerDotColor || "")
              }
              initial={{ filter: "blur(2px)", opacity: 0.4 }}
              animate={{ filter: "blur(0px)", opacity: 1 }}
              exit={{ filter: "blur(2px)", opacity: 0.4 }}
              transition={{ duration: 0.1 }}
              className="relative flex size-full items-center justify-center"
            >
              <QRCode
                url={url}
                fgColor={draft.qrDotsColor || draft.fgColor}
                hideLogo={draft.qrHideLogo}
                logo={logo}
                scale={1}
                qrShape={draft.qrShape}
                dotsOptions={{
                  type: draft.qrDotType,
                  color: draft.qrDotsColor || draft.fgColor,
                }}
                eyeOptions={{
                  cornerSquare: {
                    type: draft.qrCornerSquareType,
                    color: draft.qrCornerSquareColor || draft.fgColor,
                  },
                  cornerDot: {
                    type: draft.qrCornerDotType,
                    color: draft.qrCornerDotColor || draft.fgColor,
                  },
                }}
                frameOptions={frameOptions}
              />
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
