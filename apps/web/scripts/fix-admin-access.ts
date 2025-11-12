/**
 * Fix script to grant admin access to a user
 *
 * This script adds a user to the platform workspace as an owner,
 * allowing them to pass the isDubAdmin check.
 *
 * Usage:
 *   cd apps/web
 *   pnpm script scripts/fix-admin-access.ts <userEmail>
 */

import { prisma } from "@dub/prisma";
import { nanoid } from "@dub/utils";

const userEmail = process.argv[2];

if (!userEmail) {
  console.error("❌ Error: User email is required");
  console.error("Usage: pnpm script scripts/fix-admin-access.ts <userEmail>");
  process.exit(1);
}

async function grantAdminAccess() {
  console.log("🔧 Granting Admin Access");
  console.log("========================\n");

  // 1. Find the workspace
  console.log("1️⃣ Looking up workspace...");
  const workspace = await prisma.project.findUnique({
    where: { slug: "beyond-tc-platform" },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  if (!workspace) {
    console.error("❌ Workspace 'beyond-tc-platform' not found in database");
    console.error("   The workspace must be created first");
    process.exit(1);
  }

  console.log(`✅ Found workspace: ${workspace.name} (${workspace.id})\n`);

  // 2. Find the user
  console.log("2️⃣ Looking up user...");
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!user) {
    console.error(`❌ User not found with email: ${userEmail}`);
    console.error("   Make sure the user has signed up first");
    process.exit(1);
  }

  console.log(`✅ Found user: ${user.name || "No name"} (${user.email})\n`);

  // 3. Check if already exists
  console.log("3️⃣ Checking existing access...");
  const existingProjectUser = await prisma.projectUsers.findUnique({
    where: {
      userId_projectId: {
        userId: user.id,
        projectId: workspace.id,
      },
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (existingProjectUser) {
    console.log(`✅ User already has access!`);
    console.log(`   Role: ${existingProjectUser.role}`);

    if (existingProjectUser.role !== "owner") {
      console.log("\n4️⃣ Upgrading role to owner...");
      await prisma.projectUsers.update({
        where: { id: existingProjectUser.id },
        data: { role: "owner" },
      });
      console.log("✅ Role updated to owner");
    }
  } else {
    console.log("❌ User does not have access\n");

    // 4. Create ProjectUsers entry
    console.log("4️⃣ Creating ProjectUsers entry...");
    const projectUser = await prisma.projectUsers.create({
      data: {
        id: nanoid(),
        userId: user.id,
        projectId: workspace.id,
        role: "owner",
      },
    });

    console.log("✅ ProjectUsers entry created!");
    console.log(`   ID: ${projectUser.id}`);
    console.log(`   Role: ${projectUser.role}`);
  }

  console.log("\n========================");
  console.log("✅ Admin access granted successfully!\n");
  console.log("📋 Next Steps:");
  console.log("1. Verify BEYONDTC_WORKSPACE_ID is set in your environment:");
  console.log(`   BEYONDTC_WORKSPACE_ID=${workspace.id}`);
  console.log(
    "\n2. In Vercel, ensure this environment variable is set for preview deployments",
  );
  console.log("\n3. Test by running the debug script:");
  console.log(`   pnpm script scripts/debug-admin-auth.ts ${userEmail}`);
  console.log();
}

grantAdminAccess()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
