import { FileUpload, InfoTooltip, SimpleTooltipContent, Switch } from "@dub/ui";
import { cn } from "@dub/utils";
import Image from "next/image";
import type { JSX } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";
import { useLinkQRContext } from "../link-qr-modal.context";

export function QRLogoSection(): JSX.Element | null {
  const { draft, setDraft, logo, plan, slug } = useLinkQRContext();
  const [uploading, setUploading] = useState(false);
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);

  // Don't show for landing page (no plan/slug)
  if (!plan && !slug) {
    return null;
  }

  const isFree = plan === "free";
  const currentLogo = uploadedLogo || logo;
  const showLogo = !draft.qrHideLogo;

  const handleLogoUpload = async (src: string) => {
    if (!slug) return;

    setUploading(true);
    try {
      const res = await fetch(`/api/workspaces/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logo: src }),
      });

      if (res.ok) {
        setUploadedLogo(src);
        await Promise.all([
          mutate("/api/workspaces"),
          mutate(`/api/workspaces/${slug}`),
        ]);
        toast.success("Logo updated! It will appear in your QR codes.");
      } else {
        const { error } = await res.json();
        toast.error(error?.message || "Failed to upload logo");
      }
    } catch {
      toast.error("Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm font-medium text-neutral-700">Logo</span>
        <InfoTooltip
          content={
            <SimpleTooltipContent
              title={
                isFree
                  ? "Upgrade to a paid plan to customize your QR code logo."
                  : "Add your brand logo to the center of your QR code."
              }
            />
          }
        />
      </div>

      <div className="flex items-center gap-4">
        {/* Logo Preview/Upload */}
        <div className="relative">
          {isFree ? (
            // Free plan: show default logo, no upload
            <div
              className={cn(
                "flex size-16 items-center justify-center rounded-lg border border-neutral-200 bg-white",
                "cursor-not-allowed opacity-60",
              )}
            >
              {currentLogo && (
                <Image
                  src={currentLogo}
                  alt="QR Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              )}
            </div>
          ) : (
            // Paid plan: allow upload
            <FileUpload
              accept="images"
              className={cn(
                "size-16 rounded-lg border border-neutral-200",
                uploading && "pointer-events-none opacity-60",
              )}
              iconClassName="w-4 h-4"
              variant="plain"
              imageSrc={showLogo ? currentLogo : undefined}
              readFile
              onChange={({ src }) => src && handleLogoUpload(src)}
              content={null}
              maxFileSizeMB={2}
              targetResolution={{ width: 240, height: 240 }}
              disabled={uploading}
            />
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/80">
              <div className="size-5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600" />
            </div>
          )}
        </div>

        {/* Show/Hide Toggle */}
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center justify-between">
            <label htmlFor="qr-show-logo" className="text-sm text-neutral-600">
              {showLogo ? "Logo visible" : "Logo hidden"}
            </label>
            <Switch
              id="qr-show-logo"
              checked={showLogo}
              fn={(checked) =>
                setDraft((d) => ({ ...d, qrHideLogo: !checked }))
              }
              disabled={isFree}
              disabledTooltip={isFree ? "Upgrade to hide the logo" : undefined}
            />
          </div>
          {!isFree && (
            <p className="text-xs text-neutral-400">
              {showLogo
                ? "Click the logo to upload a custom image"
                : "Toggle on to show your logo"}
            </p>
          )}
          {isFree && (
            <p className="text-xs text-neutral-400">
              Upgrade to customize or hide the logo
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
