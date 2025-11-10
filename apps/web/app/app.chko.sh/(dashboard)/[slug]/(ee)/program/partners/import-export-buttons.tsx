"use client";

import useWorkspace from "@/lib/swr/use-workspace";
import { useExportPartnersModal } from "@/ui/modals/export-partners-modal";
import { Download, ThreeDots, UploadCloud } from "@/ui/shared/icons";
import { Button, IconMenu, Popover } from "@dub/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ImportExportButtons() {
  const router = useRouter();
  const { slug } = useWorkspace();
  const [openPopover, setOpenPopover] = useState(false);

  const { ExportPartnersModal, setShowExportPartnersModal } =
    useExportPartnersModal();

  return (
    <>
      <ExportPartnersModal />
      <Popover
        content={
          <div className="w-full md:w-[16rem]">
            <div className="grid gap-px p-2">
              <p className="mb-1.5 mt-1 flex items-center gap-2 px-1 text-xs font-medium text-neutral-500">
                Import Partners
              </p>
              <button
                onClick={() => {
                  setOpenPopover(false);
                  router.push(`/${slug}/program/partners?import=csv`);
                }}
                className="w-full rounded-md p-2 hover:bg-neutral-100 active:bg-neutral-200"
              >
                <IconMenu
                  text="Import from CSV"
                  icon={<UploadCloud className="h-4 w-4" />}
                />
              </button>
            </div>

            <div className="border-t border-neutral-200" />

            <div className="grid gap-px p-2">
              <p className="mb-1.5 mt-1 flex items-center gap-2 px-1 text-xs font-medium text-neutral-500">
                Export Partners
              </p>
              <button
                onClick={() => {
                  setOpenPopover(false);
                  setShowExportPartnersModal(true);
                }}
                className="w-full rounded-md p-2 hover:bg-neutral-100 active:bg-neutral-200"
              >
                <IconMenu
                  text="Export as CSV"
                  icon={<Download className="h-4 w-4" />}
                />
              </button>
            </div>
          </div>
        }
        openPopover={openPopover}
        setOpenPopover={setOpenPopover}
        align="end"
      >
        <Button
          onClick={() => setOpenPopover(!openPopover)}
          variant="secondary"
          className="h-8 w-auto px-1.5 sm:h-9"
          icon={<ThreeDots className="size-4 text-neutral-500" />}
        />
      </Popover>
    </>
  );
}

