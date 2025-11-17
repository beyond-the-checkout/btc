import { ExpandedLinkProps } from "@/lib/types";
import {
  migrateQRCodeDesign,
  QRCodeDesign,
} from "@/ui/modals/link-qr-modal.types";
import { DEFAULT_LINK_PROPS, PLANS } from "@dub/utils";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { FormProvider, useForm } from "react-hook-form";

export type LinkFormData = ExpandedLinkProps;

export type LinkBuilderProps = {
  props?: ExpandedLinkProps;
  duplicateProps?: ExpandedLinkProps;
  workspace: {
    id?: string;
    slug?: string;
    plan?: string;
    nextPlan?: (typeof PLANS)[number];
    conversionEnabled?: boolean;
    defaultProgramId?: string | null;
  };
  modal: boolean;
  initialValues?: Partial<LinkFormData>;
  initialQrDraftDesign?: QRCodeDesign;
};

const LinkBuilderContext = createContext<
  | (LinkBuilderProps & {
      generatingMetatags: boolean;
      setGeneratingMetatags: Dispatch<SetStateAction<boolean>>;
      qrDraftDesign?: QRCodeDesign;
      setQrDraftDesign: Dispatch<SetStateAction<QRCodeDesign | undefined>>;
    })
  | null
>(null);

export function useLinkBuilderContext() {
  const context = useContext(LinkBuilderContext);
  if (!context)
    throw new Error(
      "useLinkBuilderContext must be used within a LinkBuilderProvider",
    );

  return context;
}

export function LinkBuilderProvider({
  children,
  ...rest
}: PropsWithChildren<LinkBuilderProps>) {
  const { plan, conversionEnabled } = rest.workspace || {};

  const [generatingMetatags, setGeneratingMetatags] = useState(
    Boolean(rest.props),
  );

  // Shared QR draft design state
  const [qrDraftDesign, setQrDraftDesign] = useState<QRCodeDesign | undefined>(
    rest.initialQrDraftDesign ?? undefined,
  );

  // Legacy migration: migrate per-link QR design from localStorage when editing an existing link
  const migratedStorageKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const linkId = rest.props?.id;
    const domain = rest.props?.domain;
    const key = rest.props?.key;
    if (!linkId || !domain || !key) return; // only migrate for existing links

    const storageKey = `qr-code-design-${domain}-${key}`;
    if (migratedStorageKeyRef.current === storageKey) return;

    migratedStorageKeyRef.current = storageKey;

    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const migrated = migrateQRCodeDesign(JSON.parse(raw));
        setQrDraftDesign(migrated);
        // Clean up the legacy key after successful migration
        window.localStorage.removeItem(storageKey);
      } else {
        // No legacy state for this link; ensure we don't carry previous session state
        setQrDraftDesign(undefined);
      }
    } catch {
      // no-op on parse or access errors
    }
  }, [rest.props?.id, rest.props?.domain, rest.props?.key]);

  // Reset QR design for new sessions (no existing link id)
  useEffect(() => {
    if (!rest.props?.id) {
      setQrDraftDesign(rest.initialQrDraftDesign ?? undefined);
      migratedStorageKeyRef.current = null; // allow fresh migration on next edit session
    }
  }, [rest.props?.id, rest.initialQrDraftDesign]);

  const form = useForm<LinkFormData>({
    defaultValues: rest.props ||
      rest.duplicateProps || {
        ...DEFAULT_LINK_PROPS,
        trackConversion:
          (plan && plan !== "free" && plan !== "pro" && conversionEnabled) ||
          false,
        ...(rest.initialValues ?? {}),
      },
  });

  return (
    <LinkBuilderContext.Provider
      value={{
        ...rest,
        generatingMetatags,
        setGeneratingMetatags,
        qrDraftDesign,
        setQrDraftDesign,
      }}
    >
      <FormProvider {...form}>{children}</FormProvider>
    </LinkBuilderContext.Provider>
  );
}
