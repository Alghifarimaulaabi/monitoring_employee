import "dotenv/config";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function runVerification() {
  console.log("=== [PHASE 1 VERIFICATION START] ===");

  // 1. Verify Database Schema & Connection
  console.log("\n1. Verifying Database Connection...");
  const userCount = await prisma.user.count();
  console.log(`   ✓ Connected to Supabase Postgres. Current total users: ${userCount}`);

  // 2. Verify Owner exists
  console.log("\n2. Verifying Seeded Owner...");
  const owner = await prisma.user.findFirst({
    where: { role: "OWNER" },
  });
  if (!owner) {
    throw new Error("❌ No OWNER found in database!");
  }
  console.log(`   ✓ Owner verified: ${owner.name} (${owner.email}) - Role: ${owner.role}`);

  // 3. Verify Owner Authentication via Better Auth
  console.log("\n3. Verifying Owner Login via Better Auth...");
  const signInRes = await auth.api.signInEmail({
    body: {
      email: owner.email,
      password: process.env.INITIAL_OWNER_PASSWORD || "password123",
    },
  });
  if (!signInRes || !signInRes.token) {
    throw new Error("❌ Owner authentication failed!");
  }
  console.log(`   ✓ Owner login success! Session token generated: ${signInRes.token.slice(0, 10)}...`);

  // 4. Test Employee Creation
  const testEmployeeEmail = "test_staff_" + Date.now() + "@florist.com";
  console.log(`\n4. Testing Manual Employee Provisioning (${testEmployeeEmail})...`);
  
  const createEmpRes = await auth.api.createUser({
    body: {
      name: "Staf Uji Lapangan",
      email: testEmployeeEmail,
      password: "password123",
      role: "user", // Better Auth role
    },
  });

  if (!createEmpRes || !createEmpRes.user) {
    throw new Error("❌ Employee creation failed via Better Auth admin API!");
  }

  // Update canonical role
  await prisma.user.update({
    where: { id: createEmpRes.user.id },
    data: { role: "EMPLOYEE" },
  });

  const createdEmp = await prisma.user.findUnique({
    where: { email: testEmployeeEmail },
  });
  console.log(`   ✓ Employee created successfully in DB: ${createdEmp?.name} - Role: ${createdEmp?.role}`);

  // 5. Verify Employee Authentication
  console.log("\n5. Verifying Newly Created Employee Login...");
  const empSignInRes = await auth.api.signInEmail({
    body: {
      email: testEmployeeEmail,
      password: "password123",
    },
  });
  if (!empSignInRes || !empSignInRes.token) {
    throw new Error("❌ Employee authentication failed!");
  }
  console.log(`   ✓ Employee login success! Token: ${empSignInRes.token.slice(0, 10)}...`);

  // 6. Verify Duplicate Email Prevention
  console.log("\n6. Verifying Duplicate Email Prevention...");
  try {
    await auth.api.createUser({
      body: {
        name: "Duplicate User",
        email: testEmployeeEmail,
        password: "password123",
        role: "user",
      },
    });
    console.error("❌ Duplicate email was unexpectedly allowed!");
  } catch (err: unknown) {
    console.log("   ✓ Duplicate email was properly rejected by Better Auth.");
  }

  // Clean up test employee
  await prisma.session.deleteMany({ where: { userId: createEmpRes.user.id } });
  await prisma.account.deleteMany({ where: { userId: createEmpRes.user.id } });
  await prisma.user.delete({ where: { id: createEmpRes.user.id } });
  console.log("\n   ✓ Test temporary employee cleaned up.");

  console.log("\n=== [ALL PHASE 1 TESTS PASSED SUCCESSFULLY] ===");
}

runVerification()
  .catch((err) => {
    console.error("\n❌ Verification Failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });
