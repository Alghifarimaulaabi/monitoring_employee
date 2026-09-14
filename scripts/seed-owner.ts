import "dotenv/config";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function main() {
  const name = process.env.INITIAL_OWNER_NAME || "Owner Florist";
  const email = process.env.INITIAL_OWNER_EMAIL || "owner@btracker.com";
  const password = process.env.INITIAL_OWNER_PASSWORD || "password123";

  console.log(`[Seed] Checking for initial owner: ${email}...`);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    if (existingUser.role !== "OWNER") {
      await prisma.user.update({
        where: { email },
        data: { role: "OWNER" },
      });
      console.log(`[Seed] Updated existing user ${email} to role OWNER.`);
    } else {
      console.log(`[Seed] Owner ${email} already exists.`);
    }
    return;
  }

  // Create owner account via Better Auth to properly hash password
  const res = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
    },
  });

  if (!res || !res.user) {
    throw new Error(`[Seed] Failed to create owner account via Better Auth: ${JSON.stringify(res)}`);
  }

  // Update role to OWNER
  await prisma.user.update({
    where: { id: res.user.id },
    data: { role: "OWNER" },
  });

  console.log(`[Seed] Successfully seeded owner: ${email} (Name: ${name}, Role: OWNER)`);
}

main()
  .catch((err) => {
    console.error("[Seed] Error seeding owner:", err);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });
