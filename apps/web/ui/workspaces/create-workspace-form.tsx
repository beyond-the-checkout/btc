"use client";

import { isGenericEmail } from "@/lib/is-generic-email";
import { generateRandomName } from "@/lib/names";
import {
  Button,
  ButtonTooltip,
  buttonVariants,
  FileUpload,
  useMediaQuery,
} from "@dub/ui";
import { Shuffle } from "@dub/ui/icons";
import { cn } from "@dub/utils";
import slugify from "@sindresorhus/slugify";
import { useSession } from "next-auth/react";
import { usePlausible } from "next-plausible";
import posthog from "posthog-js";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { mutate } from "swr";

type FormData = {
  name: string;
  slug: string;
  logo?: string;
};

export function CreateWorkspaceForm({
  onSuccess,
  className,
}: {
  onSuccess?: (data: FormData) => void;
  className?: string;
}) {
  const { data: session, update } = useSession();
  const plausible = usePlausible();

  const generatedName = useMemo(() => generateRandomName(), []);
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    control,
    formState: { isSubmitting, isSubmitSuccessful, errors },
  } = useForm<FormData>({
    defaultValues: {
      name: generatedName,
      slug: slugify(generatedName),
    },
  });

  useEffect(() => {
    if (session?.user?.email && !isGenericEmail(session.user.email)) {
      const emailDomain = session.user.email.split("@")[1];

      // Check if favicon exists using our API endpoint
      fetch(`/api/misc/check-favicon?domain=${emailDomain}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.exists) {
            console.log("Logo URL is valid:", data.url);
            setValue("logo", data.url);
          } else {
            // Don't set the logo if it returns an error
            console.log("Logo URL returned error:", data.status, data.url);
          }
        })
        .catch((error) => {
          // Don't set the logo if fetch fails
          console.log("Failed to check favicon:", error);
        });
    } else if (session?.user?.image) {
      setValue("logo", session.user.image);
    }
  }, [session?.user]);

  const { isMobile } = useMediaQuery();

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        try {
          const res = await fetch("/api/workspaces", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });

          if (res.ok) {
            const { id: workspaceId } = await res.json();
            plausible("Created Workspace");
            // track workspace creation event
            posthog.capture("workspace_created", {
              workspace_id: workspaceId,
              workspace_name: data.name,
              workspace_slug: data.slug,
              source: "manual_form",
            });
            await Promise.all([mutate("/api/workspaces"), update()]);
            onSuccess?.(data);
          } else {
            const { error } = await res.json();
            const message = error.message;

            if (message.toLowerCase().includes("slug")) {
              return setError("slug", { message });
            }

            toast.error(error.message);
            setError("root.serverError", { message: error.message });
          }
        } catch (e) {
          toast.error("Failed to create workspace.");
          console.error("Failed to create workspace", e);
          setError("root.serverError", {
            message: "Failed to create workspace",
          });
        }
      })}
      className={cn("flex flex-col space-y-6 text-left", className)}
    >
      <div>
        <label htmlFor="name" className="flex items-center space-x-2">
          <p className="block text-sm font-medium text-neutral-700">
            Workspace name
          </p>
        </label>
        <div className="mt-2 flex items-center gap-2">
          <input
            id="name"
            type="text"
            autoFocus={!isMobile}
            autoComplete="off"
            className="block w-full rounded-md border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-neutral-500 sm:text-sm"
            placeholder={generatedName}
            {...register("name", {
              required: true,
              onChange: (e) => setValue("slug", slugify(e.target.value)),
            })}
          />
          <ButtonTooltip
            tooltipProps={{
              content: "Generate a new workspace name",
            }}
            aria-label="Generate new workspace name"
            onClick={() => {
              const next = generateRandomName();
              setValue("name", next, {
                shouldDirty: true,
                shouldValidate: true,
              });
              setValue("slug", slugify(next));
            }}
          >
            <Shuffle className="size-4" />
          </ButtonTooltip>
        </div>
      </div>
      <input type="hidden" {...register("slug", { required: true })} />

      <div>
        <label>
          <p className="block text-sm font-medium text-neutral-700">
            Workspace logo
          </p>
          <div className="mt-1.5 flex items-center gap-5">
            <Controller
              control={control}
              name="logo"
              render={({ field }) => (
                <FileUpload
                  accept="images"
                  className={cn(
                    "size-20 rounded-full border border-neutral-300",
                    errors.logo && "border-0 ring-2 ring-red-500",
                  )}
                  iconClassName="size-5"
                  previewClassName="size-10 rounded-full"
                  variant="plain"
                  imageSrc={field.value}
                  readFile
                  onChange={({ src }) => field.onChange(src)}
                  content={null}
                  maxFileSizeMB={2}
                  targetResolution={{ width: 160, height: 160 }}
                />
              )}
            />
            <div>
              <div
                className={cn(
                  buttonVariants({ variant: "secondary" }),
                  "flex h-7 w-fit cursor-pointer items-center rounded-md border px-2 text-xs",
                )}
              >
                Upload image
              </div>
              <p className="mt-1.5 text-xs text-neutral-500">
                Recommended size: 160x160px
              </p>
            </div>
          </div>
        </label>
      </div>

      <Button
        loading={isSubmitting || isSubmitSuccessful}
        text="Create workspace"
      />
    </form>
  );
}
