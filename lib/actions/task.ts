"use server";

import { z } from "zod";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const createTaskSchema = z.object({
  title: z.string().min(2, "Judul tugas minimal 2 karakter").max(120, "Judul tugas maksimal 120 karakter"),
  description: z.string().max(500, "Deskripsi maksimal 500 karakter").optional(),
  assignedToId: z.string().min(1, "Karyawan wajib dipilih"),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
});

export type CreateTaskDTO = z.infer<typeof createTaskSchema>;

export interface TaskActionResult {
  success: boolean;
  taskId?: string;
  error?: string;
}

/**
 * Server Action for Owner to assign a daily task to an employee.
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

    // Parse dueDate safely in UTC
    const [year, month, day] = dueDate.split("-").map(Number);
    const dateObj = new Date(Date.UTC(year, month - 1, day));

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
 * Server Action to toggle task status between PENDING and COMPLETED.
 * Can be invoked by the assigned employee or an Owner.
 */
export async function toggleTaskStatusAction(
  taskId: string,
  newStatus: "PENDING" | "COMPLETED"
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

    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: newStatus,
        completedAt: newStatus === "COMPLETED" ? new Date() : null,
      },
    });

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
 * Query tasks for Owner dashboard with optional filters.
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (filters?.employeeId && filters.employeeId !== "all") {
    where.assignedToId = filters.employeeId;
  }

  if (filters?.status && filters.status !== "all") {
    where.status = filters.status;
  }

  if (filters?.date) {
    const [year, month, day] = filters.date.split("-").map(Number);
    where.dueDate = new Date(Date.UTC(year, month - 1, day));
  }

  return await prisma.task.findMany({
    where,
    orderBy: [{ dueDate: "desc" }, { createdAt: "desc" }],
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
    },
  });
}

/**
 * Query tasks for Employee for a specific date (defaults to today).
 */
export async function getTodayTasksForEmployeeAction(targetDate?: string) {
  const session = await getServerSession();

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  let dateObj: Date;
  if (targetDate) {
    const [year, month, day] = targetDate.split("-").map(Number);
    dateObj = new Date(Date.UTC(year, month - 1, day));
  } else {
    // Current UTC date
    const now = new Date();
    dateObj = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  }

  return await prisma.task.findMany({
    where: {
      assignedToId: session.user.id,
      dueDate: dateObj,
    },
    orderBy: [
      { status: "asc" }, // PENDING comes before COMPLETED
      { createdAt: "asc" },
    ],
  });
}
