import "dotenv/config";
import { prisma } from "@/lib/prisma";
import { uploadBouquetPhoto } from "@/lib/storage";

async function runPhase2Verification() {
  console.log("=== [PHASE 2 VERIFICATION START] ===");

  // 1. Verify User exists for submission
  console.log("\n1. Finding or creating employee for test...");
  let user = await prisma.user.findFirst({
    where: { role: "EMPLOYEE" },
  });

  if (!user) {
    user = await prisma.user.findFirst({
      where: { role: "OWNER" },
    });
  }

  if (!user) {
    throw new Error("❌ No user available in database for test!");
  }
  console.log(`   ✓ Using user: ${user.name} (${user.email}) - ID: ${user.id}`);

  // 2. Test Storage Upload
  console.log("\n2. Testing Storage Upload (Supabase / Local Fallback)...");
  // 1x1 transparent WebP image buffer
  const sampleWebpBase64 =
    "UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAQAcJaACdLoB+AA/sAD+/v///9///9////////9//////////w==";
  const sampleBuffer = Buffer.from(sampleWebpBase64, "base64");
  const testStoragePath = `bouquet-photos/2026-09/test-${Date.now()}.webp`;

  const uploadRes = await uploadBouquetPhoto(sampleBuffer, testStoragePath, "image/webp");
  console.log(`   ✓ Image uploaded successfully:`);
  console.log(`     - Image URL: ${uploadRes.imageUrl}`);
  console.log(`     - Storage Path: ${uploadRes.storagePath}`);

  // 3. Test Bouquet Post Persistence
  console.log("\n3. Testing Database Persistence for BouquetPost...");
  const post = await prisma.bouquetPost.create({
    data: {
      userId: user.id,
      imageUrl: uploadRes.imageUrl,
      storagePath: uploadRes.storagePath,
      installDate: new Date("2026-09-14"),
      locationName: "Grand Ballroom Hotel Mulia - Meja Pengantin",
      flowerCount: 24,
    },
  });

  console.log(`   ✓ BouquetPost created in DB with ID: ${post.id}`);
  console.log(`     - Location: ${post.locationName}`);
  console.log(`     - Flowers: ${post.flowerCount} pcs`);
  console.log(`     - Date: ${post.installDate.toISOString().slice(0, 10)}`);

  // 4. Test Employee History Retrieval
  console.log("\n4. Testing Employee Submission History Query...");
  const history = await prisma.bouquetPost.findMany({
    where: {
      userId: user.id,
      isArchived: false,
    },
    orderBy: {
      installDate: "desc",
    },
  });

  const found = history.some((h) => h.id === post.id);
  if (!found) {
    throw new Error("❌ Newly created bouquet post not found in employee history!");
  }
  console.log(`   ✓ History retrieval verified! Total posts for user: ${history.length}`);

  // 5. Clean up test record
  console.log("\n5. Cleaning up test record...");
  await prisma.bouquetPost.delete({ where: { id: post.id } });
  console.log("   ✓ Test bouquet record cleaned up successfully.");

  console.log("\n=== [ALL PHASE 2 VERIFICATIONS PASSED SUCCESSFULLY] ===");
}

runPhase2Verification()
  .catch((err) => {
    console.error("\n❌ Phase 2 Verification Failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });
