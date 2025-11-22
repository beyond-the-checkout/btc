import { Tooltip } from "@dub/ui";
import { Check2 } from "@dub/ui/icons";
import { cn } from "@dub/utils";
import { HexColorInput, HexColorPicker } from "react-colorful";
import type { JSX } from "react";
import { DEFAULT_COLORS } from "../link-qr-modal.constants";
import { useLinkQRContext } from "../link-qr-modal.context";

export function QRColorSection(): JSX.Element {
  const { draft, setDraft } = useLinkQRContext();

  return (
    <>
      {/* Frame Color selector - Always visible, disabled when no frame selected */}
      <div
        className={cn(
          "transition-opacity",
          !draft.qrFrameStyle && "opacity-40",
        )}
      >
        <span className="mb-2 block text-sm font-medium text-neutral-700">
          Frame Color
        </span>
        <div className="flex gap-6">
          <div
            className={cn(
              "relative flex h-9 w-32 shrink-0 rounded-md shadow-sm",
              !draft.qrFrameStyle && "pointer-events-none cursor-not-allowed",
            )}
          >
            <Tooltip
              content={
                draft.qrFrameStyle ? (
                  <div className="flex max-w-xs flex-col items-center space-y-3 p-5 text-center">
                    <HexColorPicker
                      color={draft.qrFrameColor || draft.fgColor}
                      onChange={(color) =>
                        setDraft((d) => ({ ...d, qrFrameColor: color }))
                      }
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
              onChange={(color) =>
                setDraft((d) => ({ ...d, qrFrameColor: color }))
              }
              prefixed
              disabled={!draft.qrFrameStyle}
              style={{ borderColor: draft.qrFrameColor || draft.fgColor }}
              className="block w-full rounded-r-md border-2 border-l-0 pl-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-black disabled:cursor-not-allowed disabled:bg-neutral-50 sm:text-sm"
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
                    onChange={(color) =>
                      setDraft((d) => ({
                        ...d,
                        fgColor: color,
                        qrDotsColor: color,
                        qrCornerSquareColor: color,
                        qrCornerDotColor: color,
                      }))
                    }
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
              onChange={(color) =>
                setDraft((d) => ({
                  ...d,
                  fgColor: color,
                  qrDotsColor: color,
                  qrCornerSquareColor: color,
                  qrCornerDotColor: color,
                }))
              }
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
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      fgColor: color,
                      qrDotsColor: color,
                      qrCornerSquareColor: color,
                      qrCornerDotColor: color,
                    }))
                  }
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
    </>
  );
}
