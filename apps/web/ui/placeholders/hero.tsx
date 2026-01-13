import { Grid } from "@dub/ui";
import { PropsWithChildren } from "react";

export function Hero({ children }: PropsWithChildren) {
  return (
    <div className="relative mx-auto mt-4 w-full max-w-screen-lg overflow-hidden rounded-2xl bg-neutral-50 p-6 text-center sm:p-20 sm:px-0">
      <Grid
        cellSize={80}
        patternOffset={[1, -58]}
        className="inset-[unset] left-1/2 top-0 w-[1200px] -translate-x-1/2 text-neutral-300 [mask-image:linear-gradient(transparent,black_70%)]"
      />
      {/* REPOMARK:SCOPE: 2 - Keep hero content unchanged after removing gradient constant */}
      {children}
    </div>
  );
}
