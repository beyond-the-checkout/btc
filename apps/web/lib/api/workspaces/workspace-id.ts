export const prefixWorkspaceId = (workspaceId?: string) => {
  if (typeof workspaceId !== "string" || workspaceId.length === 0) {
    return "";
  }
  return workspaceId.startsWith("ws_") ? workspaceId : `ws_${workspaceId}`;
};

export const normalizeWorkspaceId = (workspaceId?: string) => {
  if (typeof workspaceId !== "string" || workspaceId.length === 0) {
    return "";
  }
  return workspaceId.startsWith("ws_c")
    ? workspaceId.replace("ws_", "")
    : workspaceId;
};
