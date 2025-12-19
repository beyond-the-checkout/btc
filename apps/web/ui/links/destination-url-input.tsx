"use client";

import { DomainProps } from "@/lib/types";
import {
  InfoTooltip,
  SimpleTooltipContent,
  useMediaQuery,
  UTM_PARAMETERS,
} from "@dub/ui";
import { getParamsFromURL, getUrlFromString } from "@dub/utils";
import { forwardRef, HTMLProps, ReactNode, useId } from "react";
import { useFormContext } from "react-hook-form";
import { AlertCircleFill } from "../shared/icons";
import { BaseBadgeTooltip } from "../shared/pro-badge-tooltip";
import { LinkFormData } from "./link-builder/link-builder-provider";

type DestinationUrlInputProps = {
  _key?: string;
  domain?: string;
  domains: DomainProps[];
  error?: string;
  right?: ReactNode;
} & HTMLProps<HTMLInputElement>;

export const DestinationUrlInput = forwardRef<
  HTMLInputElement,
  DestinationUrlInputProps
>(
  (
    {
      _key: key,
      domain,
      domains,
      error,
      right,
      // explicitly extracted so spread cannot override value/handlers
      value: valueProp,
      defaultValue: defaultValueProp,
      onChange: onChangeProp,
      onBlur: onBlurProp,
      ...restInputProps
    }: DestinationUrlInputProps,
    ref,
  ) => {
    const inputId = useId();
    const { isMobile } = useMediaQuery();

    const formContext = useFormContext<LinkFormData>();
    const watchedUrl = formContext?.watch?.("url");

    const hasExplicitValue = valueProp !== undefined;
    const isControlled = hasExplicitValue || !!formContext;

    // Smart value resolution:
    // - If valueProp is provided and non-empty, use it
    // - If valueProp === "", prefer watchedUrl (restored draft) over empty
    // - If no valueProp but RHF present, use watchedUrl
    // - Otherwise undefined (uncontrolled)
    const inputValue = hasExplicitValue
      ? typeof valueProp === "string" && valueProp === ""
        ? watchedUrl ?? ""
        : (valueProp as string)
      : formContext
        ? watchedUrl ?? ""
        : undefined;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const url = e.target.value;

      // Call parent (Controller/register) first so RHF updates state
      if (typeof onChangeProp === "function") {
        onChangeProp(e);
      } else if (formContext) {
        // Only set here if no parent onChange handled it
        formContext.setValue("url", url);
      }

      // Sync UTM params derived from the URL
      if (formContext) {
        const parentParams = getParamsFromURL(url);
        UTM_PARAMETERS.filter((p) => p.key !== "ref").forEach((p) =>
          formContext.setValue(p.key as any, parentParams?.[p.key], {
            shouldDirty: true,
          }),
        );
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Keep RHF touched state in sync
      if (typeof onBlurProp === "function") {
        onBlurProp(e);
      }

      // Normalize URL (ensure scheme, strip trailing slash)
      const url = getUrlFromString(e.target.value);
      if (url && formContext) {
        formContext.setValue("url", url.replace(/\/$/, ""));
      }
    };

    return (
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label
              htmlFor={inputId}
              className="block text-sm font-medium text-neutral-700"
            >
              Destination URL
            </label>
            {key === "_root" ? (
              <BaseBadgeTooltip
                content={
                  <SimpleTooltipContent title="The URL your users will get redirected to when they visit your root domain link." />
                }
              />
            ) : (
              <InfoTooltip
                content={
                  <SimpleTooltipContent title="The URL your users will get redirected to when they visit your short link." />
                }
              />
            )}
          </div>
          {right}
        </div>
        <div className="relative mt-2 flex rounded-md shadow-sm">
          <input
            ref={ref}
            name={restInputProps.name ?? "url"}
            id={inputId}
            placeholder={
              domains?.find(({ slug }) => slug === domain)?.placeholder ||
              "https://your-destination.com"
            }
            autoFocus={!key && !isMobile}
            autoComplete="off"
            className={`${
              error
                ? "border-red-300 pr-10 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-neutral-500 focus:ring-neutral-500"
            } block w-full rounded-md focus:outline-none sm:text-sm`}
            aria-invalid={Boolean(error)}
            {...restInputProps}
            {
              ...(isControlled
                ? { value: inputValue ?? "" } // controlled
                : { defaultValue: defaultValueProp }) // uncontrolled
            }
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {error && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <AlertCircleFill
                className="h-5 w-5 text-red-500"
                aria-hidden="true"
              />
            </div>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600" id="key-error">
            {error}
          </p>
        )}
      </div>
    );
  },
);
