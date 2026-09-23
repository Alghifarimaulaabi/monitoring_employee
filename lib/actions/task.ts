"use server";

import { z } from "zod";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAppDateString, parseDateToUtc } from "@/lib/date";

const createTaskSchema = z.object({
  title: z
    .string()
    .min(2, "Judul tugas minimal 2 karakter")
    .max(120, "Judul tugas maksimal 120 karakter"),
  description: z.string().max(500, "Deskripsi maksimal 500 karakter").optional(),
  assignedToId: z.string().min(1, "Karyawan wajib dipilih"),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD")
    .optional(),
});

export type CreateTaskDTO = z.infer<typeof createTaskSchema>;

const updateTaskSchema = z.object({
  taskId: z.string().min(1, "ID tugas wajib diisi"),
  title: z
    .string()
    .min(2, "Judul tugas minimal 2 karakter")
    .max(120, "Judul tugas maksimal 120 karakter"),
  description: z.string().max(500, "Deskripsi maksimal 500 karakter").optional(),
  assignedToId: z.string().min(1, "Karyawan wajib dipilih"),
});

export type UpdateTaskDTO = z.infer<typeof updateTaskSchema>;

export interface TaskActionResult {
  success: boolean;
  taskId?: string;
  error?: string;
}

/**
 * Server Action for Owner to assign a recurring daily task to an employee.
 * The task is created once and automatically available every day.
 */
export async function createTaskAction(data: CreateTaskDTO): Promise<TaskActionResult> {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return { success: false, error: "Silakan login terlebih dahulu." };
    }

    const isOwner =
      session.user.role === "OWNER" || session.user.role === "admin";

    if (!isOwner) {
      return { success: false, error: "Akses ditolak: Hanya Owner yang dapat membuat tugas." };
    }

    const parsed = createTaskSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Input penugasan tidak valid.",
      };
    }

    const { title, description, assignedToId, dueDate } = parsed.data;

    // Verify assigned employee exists
    const employee = await prisma.user.findUnique({
      where: { id: assignedToId },
    });

    if (!employee) {
      return { success: false, error: "Karyawan yang dipilih tidak ditemukan." };
    }

    if (employee.banned) {
      return {
        success: false,
        error: "Karyawan ini telah dinonaktifkan dan tidak dapat diberikan tugas baru.",
      };
    }

    // Determine start date (Asia/Jakarta)
    const effectiveDateStr = dueDate || getAppDateString();
    const dateObj = parseDateToUtc(effectiveDateStr);

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        assignedToId,
        createdById: session.user.id,
        dueDate: dateObj,
        status: "PENDING",
      },
    });

    revalidatePath("/owner/tasks");
    revalidatePath("/employee/tasks");

    return {
      success: true,
      taskId: task.id,
    };
  } catch (err: unknown) {
    console.error("[createTaskAction] Error:", err);
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat membuat tugas.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action for Owner to update an existing recurring task.
 */
export async function updateTaskAction(data: UpdateTaskDTO): Promise<TaskActionResult> {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return { success: false, error: "Silakan login terlebih dahulu." };
    }

    const isOwner =
      session.user.role === "OWNER" || session.user.role === "admin";

    if (!isOwner) {
      return { success: false, error: "Akses ditolak: Hanya Owner yang dapat mengedit tugas." };
    }

    const parsed = updateTaskSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Input update tugas tidak valid.",
      };
    }

    const { taskId, title, description, assignedToId } = parsed.data;

    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return { success: false, error: "Tugas tidak ditemukan." };
    }

    // Verify employee
    const employee = await prisma.user.findUnique({
      where: { id: assignedToId },
    });

    if (!employee) {
      return { success: false, error: "Karyawan yang dipilih tidak ditemukan." };
    }

    if (employee.banned) {
      return {
        success: false,
        error: "Karyawan ini telah dinonaktifkan dan tidak dapat diberikan tugas.",
      };
    }

    await prisma.task.update({
      where: { id: taskId },
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        assignedToId,
      },
    });

    revalidatePath("/owner/tasks");
    revalidatePath("/employee/tasks");

    return { success: true, taskId };
  } catch (err: unknown) {
    console.error("[updateTaskAction] Error:", err);
    const msg = err instanceof Error ? err.message : "Gagal memperbarui tugas.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action to toggle task status between PENDING and COMPLETED for a specific date.
 * Strictly verifies authorization on the server and prevents duplicate completions.
 */
export async function toggleTaskStatusAction(
  taskId: string,
  newStatus: "PENDING" | "COMPLETED",
  date?: string
): Promise<TaskActionResult> {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return { success: false, error: "Silakan login terlebih dahulu." };
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return { success: false, error: "Tugas tidak ditemukan." };
    }

    const isOwner =
      session.user.role === "OWNER" || session.user.role === "admin";
    const isAssignedEmployee = task.assignedToId === session.user.id;

    if (!isOwner && !isAssignedEmployee) {
      return { success: false, error: "Akses ditolak: Anda tidak berhak mengubah tugas ini." };
    }

    // Determine target user id (never trust client-supplied userId)
    const targetUserId = isOwner ? task.assignedToId : session.user.id;

    // Determine target date in Asia/Jakarta timezone
    const targetDateStr = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : getAppDateString();
    const targetDateObj = parseDateToUtc(targetDateStr);

    if (newStatus === "COMPLETED") {
      // Upsert to ensure no duplicate completion
      await prisma.taskCompletion.upsert({
        where: {
          taskId_userId_date: {
            taskId,
            userId: targetUserId,
            date: targetDateObj,
          },
        },
        create: {
          taskId,
          userId: targetUserId,
          date: targetDateObj,
          completedAt: new Date(),
        },
        update: {
          completedAt: new Date(),
        },
      });
    } else {
      // Remove completion record for this date
      await prisma.taskCompletion.deleteMany({
        where: {
          taskId,
          userId: targetUserId,
          date: targetDateObj,
        },
      });
    }

    revalidatePath("/employee/tasks");
    revalidatePath("/owner/tasks");

    return { success: true, taskId };
  } catch (err: unknown) {
    console.error("[toggleTaskStatusAction] Error:", err);
    const msg = err instanceof Error ? err.message : "Gagal memperbarui status tugas.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action for Owner to delete a task.
 * Cascades to delete all historical task completions.
 */
export async function deleteTaskAction(taskId: string): Promise<TaskActionResult> {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return { success: false, error: "Silakan login terlebih dahulu." };
    }

    const isOwner =
      session.user.role === "OWNER" || session.user.role === "admin";

    if (!isOwner) {
      return { success: false, error: "Akses ditolak: Hanya Owner yang dapat menghapus tugas." };
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    revalidatePath("/owner/tasks");
    revalidatePath("/employee/tasks");

    return { success: true, taskId };
  } catch (err: unknown) {
    console.error("[deleteTaskAction] Error:", err);
    const msg = err instanceof Error ? err.message : "Gagal menghapus tugas.";
    return { success: false, error: msg };
  }
}

/**
 * Query recurring tasks for Owner dashboard evaluated against a target date.
 */
export async function getTasksForOwnerAction(filters?: {
  date?: string;
  employeeId?: string;
  status?: string;
}) {
  const session = await getServerSession();

  const isOwner =
    session?.user?.role === "OWNER" || session?.user?.role === "admin";

  if (!isOwner) {
    throw new Error("Unauthorized");
  }

  const targetDateStr = filters?.date || getAppDateString();
  const targetDateObj = parseDateToUtc(targetDateStr);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    OR: [{ dueDate: null }, { dueDate: { lte: targetDateObj } }],
  };

  if (filters?.employeeId && filters.employeeId !== "all") {
    where.assignedToId = filters.employeeId;
  }

  const rawTasks = await prisma.task.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
      completions: {
        where: {
          date: targetDateObj,
        },
        select: {
          id: true,
          date: true,
          completedAt: true,
          userId: true,
        },
      },
    },
  });

  const evaluatedTasks = rawTasks.map((task) => {
    const completion = task.completions.find((c) => c.userId === task.assignedToId);
    const isCompleted = Boolean(completion);
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      status: isCompleted ? "COMPLETED" : "PENDING",
      completedAt: completion?.completedAt || null,
      createdAt: task.createdAt,
      assignedTo: task.assignedTo,
      createdBy: task.createdBy,
      completions: task.completions,
    };
  });

  if (filters?.status && filters.status !== "all") {
    return evaluatedTasks.filter((t) => t.status === filters.status);
  }

  return evaluatedTasks;
}

/**
 * Query recurring tasks for Employee for a specific date (defaults to today in Asia/Jakarta).
 */
export async function getTodayTasksForEmployeeAction(targetDate?: string) {
  const session = await getServerSession();

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const dateStr = targetDate || getAppDateString();
  const dateObj = parseDateToUtc(dateStr);

  const tasks = await prisma.task.findMany({
    where: {
      assignedToId: session.user.id,
      OR: [{ dueDate: null }, { dueDate: { lte: dateObj } }],
    },
    include: {
      completions: {
        where: {
          userId: session.user.id,
          date: dateObj,
        },
      },
    },
    orderBy: [{ createdAt: "asc" }],
  });

  return tasks.map((task) => {
    const isCompleted = task.completions.length > 0;
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate || task.createdAt,
      status: isCompleted ? "COMPLETED" : "PENDING",
      completedAt: isCompleted ? task.completions[0].completedAt : null,
      createdAt: task.createdAt,
    };
  });
}
