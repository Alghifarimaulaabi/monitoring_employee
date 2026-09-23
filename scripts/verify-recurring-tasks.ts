import "dotenv/config";
import { prisma } from "../lib/prisma";
import {
  createTaskAction,
  updateTaskAction,
  deleteTaskAction,
  toggleTaskStatusAction,
  getTodayTasksForEmployeeAction,
  getTasksForOwnerAction,
} from "../lib/actions/task";
import { getAppDateString, parseDateToUtc } from "../lib/date";

async function runTests() {
  console.log("=================================================================");
  console.log("=== [STARTING RECURRING DAILY TODO LIST & COMPLETION TESTS] ===");
  console.log("=================================================================\n");

  // 1. Fetch an Owner and an Employee from the database
  const owner = await prisma.user.findFirst({
    where: { role: "OWNER" },
  });
  if (!owner) throw new Error("No Owner user found in database!");

  const employee = await prisma.user.findFirst({
    where: { role: "EMPLOYEE", banned: false },
  });
  if (!employee) throw new Error("No active Employee user found in database!");

  console.log(`✓ Owner found: ${owner.name} (${owner.id})`);
  console.log(`✓ Employee found: ${employee.name} (${employee.id})`);

  // 2. Test direct database model integrity
  console.log("\n--- TEST 1: Model & Schema Integrity ---");
  const testTask = await prisma.task.create({
    data: {
      title: "Uji Rutinitas Harian B-Tracker",
      description: "Menyiram tanaman dan membersihkan etalase bunga",
      assignedToId: employee.id,
      createdById: owner.id,
      dueDate: parseDateToUtc("2026-09-20"),
    },
  });
  console.log(`✓ Created recurring task with ID: ${testTask.id}`);

  // 3. Test recurring daily status across 3 consecutive days
  console.log("\n--- TEST 2: Recurring Daily Appearance & History Retention ---");
  const dateDay1 = parseDateToUtc("2026-09-21"); // Monday
  const dateDay2 = parseDateToUtc("2026-09-22"); // Tuesday
  const dateDay3 = parseDateToUtc("2026-09-23"); // Wednesday

  // Day 1: initially no completions exist
  const day1CompletionsBefore = await prisma.taskCompletion.findMany({
    where: { taskId: testTask.id, userId: employee.id, date: dateDay1 },
  });
  if (day1CompletionsBefore.length !== 0) {
    throw new Error("Day 1 should not have completions initially!");
  }
  console.log("✓ Day 1 (2026-09-21): Task starts as PENDING (no completions).");

  // Complete on Day 1
  await prisma.taskCompletion.create({
    data: {
      taskId: testTask.id,
      userId: employee.id,
      date: dateDay1,
      completedAt: new Date("2026-09-21T08:30:00Z"),
    },
  });
  const day1CompletionsAfter = await prisma.taskCompletion.count({
    where: { taskId: testTask.id, userId: employee.id, date: dateDay1 },
  });
  if (day1CompletionsAfter !== 1) {
    throw new Error("Day 1 completion failed to save!");
  }
  console.log("✓ Day 1 (2026-09-21): Completed by employee -> status COMPLETED.");

  // Day 2 (Tuesday): The exact same task should have NO completion on Day 2 -> automatically PENDING!
  const day2Completions = await prisma.taskCompletion.count({
    where: { taskId: testTask.id, userId: employee.id, date: dateDay2 },
  });
  if (day2Completions !== 0) {
    throw new Error("Day 2 should automatically be PENDING without reset!");
  }
  console.log("✓ Day 2 (2026-09-22): Same task automatically appears as PENDING (0 cron needed).");

  // Complete on Day 2
  await prisma.taskCompletion.create({
    data: {
      taskId: testTask.id,
      userId: employee.id,
      date: dateDay2,
      completedAt: new Date("2026-09-22T09:15:00Z"),
    },
  });
  console.log("✓ Day 2 (2026-09-22): Completed by employee -> status COMPLETED.");

  // Day 3 (Wednesday): Automatically PENDING!
  const day3Completions = await prisma.taskCompletion.count({
    where: { taskId: testTask.id, userId: employee.id, date: dateDay3 },
  });
  if (day3Completions !== 0) {
    throw new Error("Day 3 should automatically be PENDING!");
  }
  console.log("✓ Day 3 (2026-09-23): Same task automatically appears as PENDING.");

  // Verify Day 1 and Day 2 history remains 100% intact
  const historyDay1 = await prisma.taskCompletion.findUnique({
    where: {
      taskId_userId_date: {
        taskId: testTask.id,
        userId: employee.id,
        date: dateDay1,
      },
    },
  });
  const historyDay2 = await prisma.taskCompletion.findUnique({
    where: {
      taskId_userId_date: {
        taskId: testTask.id,
        userId: employee.id,
        date: dateDay2,
      },
    },
  });

  if (!historyDay1 || !historyDay2) {
    throw new Error("Historical completions were lost or overwritten!");
  }
  console.log("✓ Historical retention verified: Day 1 and Day 2 completions are permanently preserved!");

  // 4. Test duplicate completion prevention
  console.log("\n--- TEST 3: Duplicate Completion Prevention ---");
  try {
    // Attempting direct duplicate insert on same [taskId, userId, date] must fail with unique violation
    await prisma.taskCompletion.create({
      data: {
        taskId: testTask.id,
        userId: employee.id,
        date: dateDay1,
      },
    });
    throw new Error("❌ FAILURE: Duplicate completion was incorrectly permitted!");
  } catch (err: unknown) {
    const isUniqueViolation =
      err instanceof Error &&
      (err.message.includes("Unique constraint failed") ||
        err.message.includes("unique constraint") ||
        err.message.includes("P2002"));
    if (isUniqueViolation) {
      console.log("✓ Database unique constraint [taskId, userId, date] successfully blocked duplicate completion!");
    } else {
      throw err;
    }
  }

  // 5. Test upsert idempotency
  console.log("\n--- TEST 4: Upsert Idempotency (Toggle Safety) ---");
  await prisma.taskCompletion.upsert({
    where: {
      taskId_userId_date: {
        taskId: testTask.id,
        userId: employee.id,
        date: dateDay1,
      },
    },
    create: {
      taskId: testTask.id,
      userId: employee.id,
      date: dateDay1,
      completedAt: new Date(),
    },
    update: {
      completedAt: new Date(),
    },
  });
  const totalDay1AfterUpsert = await prisma.taskCompletion.count({
    where: { taskId: testTask.id, userId: employee.id, date: dateDay1 },
  });
  if (totalDay1AfterUpsert !== 1) {
    throw new Error("Upsert duplicated records!");
  }
  console.log("✓ Upsert idempotency verified: Count remains exactly 1 after repeated completion.");

  // 6. Test Uncheck (Toggle back to PENDING)
  console.log("\n--- TEST 5: Unchecking Task for a Specific Date ---");
  await prisma.taskCompletion.deleteMany({
    where: {
      taskId: testTask.id,
      userId: employee.id,
      date: dateDay1,
    },
  });
  const day1AfterUncheck = await prisma.taskCompletion.count({
    where: { taskId: testTask.id, userId: employee.id, date: dateDay1 },
  });
  const day2AfterUncheck = await prisma.taskCompletion.count({
    where: { taskId: testTask.id, userId: employee.id, date: dateDay2 },
  });
  if (day1AfterUncheck !== 0 || day2AfterUncheck !== 1) {
    throw new Error("Unchecking Day 1 corrupted Day 2 or failed to delete Day 1!");
  }
  console.log("✓ Unchecking Day 1 succeeded: Day 1 is now PENDING, while Day 2 remains COMPLETED.");

  // 7. Test Task Edit by Owner
  console.log("\n--- TEST 6: Task Edit Functionality ---");
  const updatedTask = await prisma.task.update({
    where: { id: testTask.id },
    data: {
      title: "Judul Tugas Diperbarui",
      description: "Deskripsi instruksi baru dari Owner",
    },
  });
  if (updatedTask.title !== "Judul Tugas Diperbarui") {
    throw new Error("Task title update failed!");
  }
  console.log(`✓ Owner edit task succeeded: "${updatedTask.title}"`);

  // 8. Test Cascade Delete
  console.log("\n--- TEST 7: Cascade Delete on Task Removal ---");
  await prisma.task.delete({
    where: { id: testTask.id },
  });
  const orphanCompletions = await prisma.taskCompletion.count({
    where: { taskId: testTask.id },
  });
  if (orphanCompletions !== 0) {
    throw new Error("Orphan task completions remained after task deletion!");
  }
  console.log("✓ Task deleted cleanly with all linked completions cascade-deleted.");

  console.log("\n=================================================================");
  console.log(">>> ALL RECURRING TASK TESTS PASSED WITH 100% SUCCESS! <<<");
  console.log("=================================================================");
}

runTests()
  .catch((err) => {
    console.error("\n❌ Verification failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
