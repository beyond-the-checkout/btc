import { createId } from "@/lib/api/create-id";
import { prisma } from "@dub/prisma";
import { DUB_WORKSPACE_ID } from "@dub/utils";
import "dotenv-flow/config";

async function main() {
  if (!DUB_WORKSPACE_ID) {
    throw new Error("BEYONDTC_WORKSPACE_ID (DUB_WORKSPACE_ID) is not set");
  }
  const integration = await prisma.integration.create({
    data: {
      id: createId({ prefix: "int_" }),
      name: "Hubspot",
      slug: "hubspot",
      description: "Hubspot",
      developer: "Dub",
      website: "https://dub.co",
      verified: true,
      projectId: DUB_WORKSPACE_ID as string,
      category: "",
      guideUrl: "",
    },
  });

  console.log(`${integration.name} integration created`, integration);
}

main();
