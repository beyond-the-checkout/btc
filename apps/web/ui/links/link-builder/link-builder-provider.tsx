import { getQROnboardingSource, isQROnboarding } from "@/lib/onboarding/qr";
import { readQROnboardingSeedCookie } from "@/lib/onboarding/qr/cookie";
import type { QROnboardingSeedDetail } from "@/lib/onboarding/qr/events";
import { QROnboardingSeedEvent } from "@/lib/onboarding/qr/events";
import { ExpandedLinkProps } from "@/lib/types";
import {
  migrateQRCodeDesign,
  QRCodeDesign,
} from "@/ui/modals/link-qr-modal.types";
import { DEFAULT_LINK_PROPS, PLANS } from "@dub/utils";
import { useSearchParams } from "next/navigation";
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
import { FormProvider, useForm, useFormContext } from "react-hook-form";

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
  listenForSeedEvents?: boolean;
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

  const searchParams = useSearchParams();
  const hasSeededRef = useRef(false);

  function applySeed(detail: { url?: string; qrDesign?: QRCodeDesign }) {
    const { url, qrDesign } = detail || {};
    if (typeof url === "string" && url.length > 0) {
      form.setValue("url", url, { shouldDirty: true, shouldValidate: true });
    }
    if (qrDesign) {
      setQrDraftDesign(qrDesign);
    }
  }

  // Seed from QR onboarding cookie on mount (QR flow, modal mode, explicit opt-in)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!(rest.modal && rest.listenForSeedEvents === true)) return;

    const source = getQROnboardingSource(searchParams);
    if (!isQROnboarding(source)) return;

    const seed = readQROnboardingSeedCookie();
    if (seed && !hasSeededRef.current) {
      applySeed({ url: seed.url, qrDesign: seed.qrDesign });
      hasSeededRef.current = true;
    }
  }, [rest.modal, rest.listenForSeedEvents, searchParams]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const shouldListen = rest.listenForSeedEvents === true || !rest.modal;
    if (!shouldListen) return;

    const handler = (evt: Event) => {
      const { detail } = evt as CustomEvent<QROnboardingSeedDetail>;
      if (!detail) return;
      applySeed({ url: detail.url, qrDesign: detail.qrDesign });
      hasSeededRef.current = true;
    };

    window.addEventListener(QROnboardingSeedEvent, handler as EventListener);
    return () => {
      window.removeEventListener(
        QROnboardingSeedEvent,
        handler as EventListener,
      );
    };
  }, [form, rest.modal, rest.listenForSeedEvents, setQrDraftDesign]);

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

/**
 * Controls for seeding the link builder from external components.
 * - openWithSeed(url, design) sets the URL field and QR design draft.
 */
export function useLinkBuilderControls() {
  const form = useFormContext<LinkFormData>();
  const { setQrDraftDesign } = useLinkBuilderContext();

  const openWithSeed = (url?: string, qrDesign?: QRCodeDesign) => {
    if (typeof url === "string" && url.length > 0) {
      form.setValue("url", url, { shouldDirty: true, shouldValidate: true });
    }
    if (qrDesign) {
      setQrDraftDesign(qrDesign);
    }
  };

  return { openWithSeed };
}
