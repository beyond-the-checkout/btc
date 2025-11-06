import { WorkspaceProps } from "@/lib/types";

// Get the capabilities of a workspace based on the plan
export const getPlanCapabilities = (
  plan: WorkspaceProps["plan"] | undefined | string,
) => {
  return {
    canAddFolder: !!plan && !["free"].includes(plan),
    canManageFolderPermissions: !!plan && !["free", "base", "pro"].includes(plan), // default access level is write
    canManageCustomers: !!plan && !["free", "base", "pro"].includes(plan),
    canCreateWebhooks: !!plan && !["free", "base", "pro"].includes(plan),
    canManageProgram: !!plan && !["free", "base", "pro"].includes(plan),
    canTrackConversions: !!plan && !["free", "base", "pro"].includes(plan),
    canExportAuditLogs: !!plan && ["enterprise"].includes(plan),
    canUseAdvancedRewardLogic:
      !!plan && ["enterprise", "advanced"].includes(plan),
    canMessagePartners: !!plan && ["enterprise", "advanced"].includes(plan),
    canDiscoverPartners: !!plan && ["enterprise"].includes(plan),
  };
};
