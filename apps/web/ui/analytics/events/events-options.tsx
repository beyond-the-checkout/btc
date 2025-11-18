import { Button, Popover } from "@dub/ui";
import { useContext, useState } from "react";
import { ThreeDots } from "../../shared/icons";
import ExportButton from "../export-button";
import { EventsContext } from "./events-provider";

export default function EventsOptions() {
  const [openPopover, setOpenPopover] = useState(false);
  const { exportQueryString } = useContext(EventsContext);

  return (
    <Popover
      align="end"
      content={
        <div className="grid w-screen gap-px p-2 sm:w-48">
          <ExportButton setOpenPopover={setOpenPopover} />
        </div>
      }
      openPopover={openPopover}
      setOpenPopover={setOpenPopover}
    >
      <Button
        onClick={() => setOpenPopover(!openPopover)}
        variant="secondary"
        className="w-auto px-1.5"
        disabled={!exportQueryString}
        icon={<ThreeDots className="h-5 w-5 text-neutral-500" />}
      />
    </Popover>
  );
}
