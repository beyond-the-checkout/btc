import { prisma } from "@dub/prisma";
import { DUB_WORKSPACE_ID, getSearchParams } from "@dub/utils";
import { getSession } from "./utils";

// Internal use only (for admin portal)
interface WithAdminHandler {
  ({
    req,
    params,
    searchParams,
  }: {
    req: Request;
    params: Record<string, string>;
    searchParams: Record<string, string>;
  }): Promise<Response>;
}

export const isDubAdmin = async (userId: string) => {
  console.log("🔍 isDubAdmin called with:", {
    userId,
    DUB_WORKSPACE_ID,
    DUB_WORKSPACE_ID_type: typeof DUB_WORKSPACE_ID,
  });
  
  const response = await prisma.projectUsers.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId: DUB_WORKSPACE_ID as string,
      },
    },
  });
  
  console.log("🔍 Database query result:", {
    found: !!response,
    role: response?.role,
    id: response?.id,
  });
  
  if (!response) {
    return false;
  }
  return true;
};

export const withAdmin =
  (handler: WithAdminHandler) =>
  async (
    req: Request,
    { params: initialParams }: { params: Promise<Record<string, string>> },
  ) => {
    const params = (await initialParams) || {};
    const session = await getSession();
    if (!session?.user) {
      return new Response("Unauthorized: Login required.", { status: 401 });
    }

    const isAdminUser = await isDubAdmin(session.user.id);
    if (!isAdminUser) {
      return new Response("Unauthorized: Not an admin.", { status: 401 });
    }

    const searchParams = getSearchParams(req.url);
    return handler({ req, params, searchParams });
  };
