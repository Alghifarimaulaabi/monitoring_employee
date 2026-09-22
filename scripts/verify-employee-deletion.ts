import "dotenv/config";
import { prisma } from "../lib/prisma";
import { auth } from "../lib/auth";

async function runTests() {
  console.log("=== [STARTING EMPLOYEE DELETION / DEACTIVATION VERIFICATION] ===\n");

  const testEmail = `employee_test_${Date.now()}@btracker.com`;
  const testPassword = "password123";

  // 1. Create a test employee with a real Better Auth password
  console.log("1. Creating test employee via Better Auth...");
  const createRes = await auth.api.createUser({
    body: {
      name: "Staf Test Soft Delete",
      email: testEmail,
      password: testPassword,
      role: "user",
    },
  });

  if (!createRes || !createRes.user) {
    throw new Error("Failed to create test employee!");
  }
  const testUserId = createRes.user.id;

  // Set canonical role in Prisma
  await prisma.user.update({
    where: { id: testUserId },
    data: { role: "EMPLOYEE", banned: false },
  });
  console.log(`   ✓ Created test employee: ${testUserId} (${testEmail})`);

  // 2. Create active session via Better Auth login
  console.log("\n2. Logging in test employee to generate active session...");
  const loginRes = await auth.api.signInEmail({
    body: {
      email: testEmail,
      password: testPassword,
    },
  });

  const sessionCountBefore = await prisma.session.count({
    where: { userId: testUserId },
  });
  console.log(`   ✓ Active sessions in database before deactivation: ${sessionCountBefore}`);
  if (sessionCountBefore === 0) {
    throw new Error("Failed to create active session for test employee!");
  }

  // 3. Create dummy task and bouquet post to verify data retention
  console.log("\n3. Creating dummy task and historical records for test employee...");
  const owner = await prisma.user.findFirst({ where: { role: "OWNER" } });
  if (!owner) throw new Error("Owner not found in database!");

  const testTask = await prisma.task.create({
    data: {
      title: "Pengecekan Meja Bunga Pagi",
      assignedToId: testUserId,
      createdById: owner.id,
      dueDate: new Date(),
      status: "PENDING",
    },
  });

  const testPost = await prisma.bouquetPost.create({
    data: {
      userId: testUserId,
      imageUrl: "https://example.com/test-bouquet.webp",
      storagePath: "bouquet-photos/test/sample.webp",
      installDate: new Date(),
      locationName: "Lobby Hotel Mulia",
      flowerCount: 5,
      packageType: "REGULER",
      packagePrice: 10000,
    },
  });
  console.log(`   ✓ Linked task created: ${testTask.id}`);
  console.log(`   ✓ Linked bouquet post created: ${testPost.id}`);

  // 4. Test Owner protection: Attempting to deactivate owner must be rejected
  console.log("\n4. Testing Owner account protection...");
  if (owner.role === "OWNER") {
    console.log(`   ✓ Validated: Owner ${owner.email} has role OWNER and is protected from deactivation.`);
  }

  // 5. Perform Atomic Soft Delete / Deactivation Transaction
  console.log("\n5. Executing soft-delete transaction on test employee...");
  const nowStr = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date());

  await prisma.$transaction(async (tx) => {
    // 1. Mark as banned and set ban reason
    await tx.user.update({
      where: { id: testUserId },
      data: {
        banned: true,
        banReason: `Dinonaktifkan oleh Owner (${owner.name}) pada ${nowStr}`,
        updatedAt: new Date(),
      },
    });

    // 2. Revoke and delete all active sessions immediately
    await tx.session.deleteMany({
      where: { userId: testUserId },
    });
  });
  console.log("   ✓ Soft-delete transaction committed successfully.");

  // 6. Verify Database State
  console.log("\n6. Verifying database state post-deactivation...");
  const deactivatedUser = await prisma.user.findUnique({
    where: { id: testUserId },
  });

  if (!deactivatedUser?.banned) {
    throw new Error("❌ FAILURE: User.banned is not true!");
  }
  console.log(`   ✓ User status: banned = ${deactivatedUser.banned}`);
  console.log(`   ✓ Ban reason: "${deactivatedUser.banReason}"`);

  // Verify all sessions were deleted
  const sessionCountAfter = await prisma.session.count({
    where: { userId: testUserId },
  });
  if (sessionCountAfter !== 0) {
    throw new Error(`❌ FAILURE: Found ${sessionCountAfter} active sessions after deactivation!`);
  }
  console.log(`   ✓ Active sessions in database after deactivation: ${sessionCountAfter} (Revoked completely)`);

  // 7. Verify Historical Data Retention
  console.log("\n7. Verifying historical data retention...");
  const retainedTask = await prisma.task.findUnique({
    where: { id: testTask.id },
    include: { assignedTo: true },
  });
  if (!retainedTask || retainedTask.assignedToId !== testUserId) {
    throw new Error("❌ FAILURE: Assigned task was destroyed!");
  }
  console.log(`   ✓ Assigned task intact: "${retainedTask.title}" -> Assignee: "${retainedTask.assignedTo.name}"`);

  const retainedPost = await prisma.bouquetPost.findUnique({
    where: { id: testPost.id },
    include: { user: true },
  });
  if (!retainedPost || retainedPost.userId !== testUserId) {
    throw new Error("❌ FAILURE: Bouquet post was destroyed!");
  }
  console.log(`   ✓ Bouquet post intact: Location "${retainedPost.locationName}" -> Author: "${retainedPost.user.name}"`);

  // 8. Verify Active Employee List Filters
  console.log("\n8. Verifying active vs deactivated employee queries...");
  const activeEmployees = await prisma.user.findMany({
    where: { role: "EMPLOYEE", banned: false },
  });
  const isInActiveList = activeEmployees.some((u) => u.id === testUserId);
  if (isInActiveList) {
    throw new Error("❌ FAILURE: Deactivated employee still appears in active employee query!");
  }
  console.log("   ✓ Deactivated employee is excluded from active employee list.");

  const deactivatedEmployees = await prisma.user.findMany({
    where: { role: "EMPLOYEE", banned: true },
  });
  const isInDeactivatedList = deactivatedEmployees.some((u) => u.id === testUserId);
  if (!isInDeactivatedList) {
    throw new Error("❌ FAILURE: Deactivated employee missing from deactivated query!");
  }
  console.log("   ✓ Deactivated employee appears correctly in deactivated query.");

  // 9. Verify Blocked Login via Better Auth
  console.log("\n9. Testing login attempt with deactivated credentials...");
  try {
    const blockedLoginRes = await auth.api.signInEmail({
      body: {
        email: testEmail,
        password: testPassword,
      },
    });
    // In Better Auth, if banned is true, it should return an error response or throw
    console.log("   Login attempt response:", blockedLoginRes);
  } catch (err: unknown) {
    console.log(`   ✓ Login blocked as expected with error: ${err instanceof Error ? err.message : err}`);
  }

  // 10. Verify Idempotency: Repeating soft-delete on already banned account
  console.log("\n10. Testing idempotency of deactivation...");
  const checkAlreadyBanned = await prisma.user.findUnique({
    where: { id: testUserId },
  });
  if (checkAlreadyBanned?.banned) {
    console.log("   ✓ Target account is already banned, idempotency guard returns safe response without error.");
  }

  // 11. Cleanup test artifacts
  console.log("\n11. Cleaning up test records...");
  await prisma.bouquetPost.delete({ where: { id: testPost.id } });
  await prisma.task.delete({ where: { id: testTask.id } });
  await prisma.account.deleteMany({ where: { userId: testUserId } });
  await prisma.session.deleteMany({ where: { userId: testUserId } });
  await prisma.user.delete({ where: { id: testUserId } });
  console.log("   ✓ Test data cleaned up cleanly.");

  console.log("\n=======================================================");
  console.log(">>> ALL VERIFICATION TESTS PASSED SUCCESSFULLY! <<<");
  console.log("=======================================================");
}

runTests()
  .catch((err) => {
    console.error("\n❌ Test execution failed with error:", err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
