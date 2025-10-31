import { Tooltip } from "@dub/ui";
import { cn } from "@dub/utils";
import { HexColorInput, HexColorPicker } from "react-colorful";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  disabled?: boolean;
  disabledTooltip?: string;
}

export function ColorPicker({
  value,
  onChange,
  label = "Color",
  disabled = false,
  disabledTooltip,
}: ColorPickerProps) {
  return (
    <div className={cn("transition-opacity", disabled && "opacity-40")}>
      <span className="mb-2 block text-sm font-medium text-neutral-700">
        {label}
      </span>
      <div className="flex gap-6">
        <div className={cn(
          "relative flex h-9 w-32 shrink-0 rounded-md shadow-sm",
          disabled && "pointer-events-none cursor-not-allowed"
        )}>
          <Tooltip
            content={
              !disabled ? (
                <div className="flex max-w-xs flex-col items-center space-y-3 p-5 text-center">
                  <HexColorPicker
                    color={value}
                    onChange={onChange}
                  />
                </div>
              ) : (
                disabledTooltip || "Disabled"
              )
            }
          >
            <div
              className="h-full w-12 rounded-l-md border"
              style={{
                backgroundColor: value,
                borderColor: value,
              }}
            />
          </Tooltip>
          <HexColorInput
            color={value}
            onChange={onChange}
            prefixed
            disabled={disabled}
            style={{ borderColor: value }}
            className="block w-full rounded-r-md border-2 border-l-0 pl-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-black sm:text-sm disabled:cursor-not-allowed disabled:bg-neutral-50"
          />
        </div>
      </div>
    </div>
  );
}
