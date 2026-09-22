"use server";

import { z } from "zod";
import { auth, getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const createUserSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["EMPLOYEE", "OWNER"]).default("EMPLOYEE"),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;

export interface ActionResult {
  success: boolean;
  userId?: string;
  error?: string;
}

export async function createUserAction(data: CreateUserDTO): Promise<ActionResult> {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return { success: false, error: "Silakan login terlebih dahulu" };
    }

    const isCallerOwner =
      session.user.role === "OWNER" || session.user.role === "admin";

    if (!isCallerOwner) {
      return {
        success: false,
        error: "Akses ditolak: Hanya OWNER yang dapat mendaftarkan karyawan",
      };
    }

    const parsed = createUserSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Input tidak valid",
      };
    }

    const { name, email, password, role } = parsed.data;

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return { success: false, error: "Email sudah terdaftar" };
    }

    const created = await auth.api.createUser({
      body: {
        name,
        email,
        password,
        role: role === "OWNER" ? "admin" : "user",
      },
    });

    if (!created || !created.user) {
      return { success: false, error: "Gagal membuat akun" };
    }

    // Persist canonical B-Tracker role ('OWNER' | 'EMPLOYEE') in database
    await prisma.user.update({
      where: { id: created.user.id },
      data: { role },
    });

    revalidatePath("/owner/employees");
    return {
      success: true,
      userId: created.user.id,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan pada server";
    return { success: false, error: msg };
  }
}

export async function getEmployeesAction() {
  const session = await getServerSession();

  const isCallerOwner =
    session?.user?.role === "OWNER" || session?.user?.role === "admin";

  if (!isCallerOwner) {
    throw new Error("Unauthorized");
  }

  return await prisma.user.findMany({
    where: {
      banned: false,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      banned: true,
      createdAt: true,
    },
  });
}

const deleteEmployeeSchema = z.object({
  employeeId: z.string().min(1, "ID karyawan wajib diisi"),
});

export type DeleteEmployeeDTO = z.infer<typeof deleteEmployeeSchema>;

export interface DeleteEmployeeResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Safely deactivates / soft-deletes an employee account.
 * - Restricts action to OWNER / admin only
 * - Prevents deleting self or other OWNER accounts
 * - Sets banned=true and records reason
 * - Invalidates all active sessions atomically via Prisma transaction
 * - Keeps all historical bouquet posts and task records intact
 */
export async function deleteEmployeeAction(
  data: DeleteEmployeeDTO
): Promise<DeleteEmployeeResult> {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return { success: false, error: "Silakan login terlebih dahulu." };
    }

    const isCallerOwner =
      session.user.role === "OWNER" || session.user.role === "admin";

    if (!isCallerOwner) {
      return {
        success: false,
        error: "Akses ditolak: Hanya Owner yang dapat mengelola akun karyawan.",
      };
    }

    const parsed = deleteEmployeeSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "ID karyawan tidak valid.",
      };
    }

    const { employeeId } = parsed.data;

    // Prevent self-deletion
    if (employeeId === session.user.id) {
      return {
        success: false,
        error: "Anda tidak dapat menghapus akun Anda sendiri.",
      };
    }

    // Retrieve target user
    const targetUser = await prisma.user.findUnique({
      where: { id: employeeId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        banned: true,
      },
    });

    if (!targetUser) {
      return {
        success: false,
        error: "Akun karyawan tidak ditemukan.",
      };
    }

    // Prevent deletion of OWNER / Admin accounts
    if (targetUser.role !== "EMPLOYEE") {
      return {
        success: false,
        error: "Hanya akun staf lapangan (karyawan) yang dapat dinonaktifkan.",
      };
    }

    // Idempotent handling: if already deactivated/banned, return cleanly
    if (targetUser.banned) {
      return {
        success: true,
        message: `Akun "${targetUser.name}" sudah dinonaktifkan sebelumnya.`,
      };
    }

    const nowStr = new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Jakarta",
    }).format(new Date());

    // Execute atomic soft-delete transaction: mark banned and revoke all sessions
    await prisma.$transaction(async (tx) => {
      // 1. Soft delete: Mark user as banned and record ban reason
      await tx.user.update({
        where: { id: employeeId },
        data: {
          banned: true,
          banReason: `Dinonaktifkan oleh Owner (${session.user.name}) pada ${nowStr}`,
          updatedAt: new Date(),
        },
      });

      // 2. Revoke and delete all active sessions for this user immediately
      await tx.session.deleteMany({
        where: { userId: employeeId },
      });
    });

    revalidatePath("/owner/employees");
    revalidatePath("/owner/tasks");

    return {
      success: true,
      message: `Akun "${targetUser.name}" berhasil dinonaktifkan.`,
    };
  } catch (err: unknown) {
    console.error("[deleteEmployeeAction] Error:", err);
    const msg =
      err instanceof Error
        ? err.message
        : "Terjadi kesalahan pada server saat menghapus akun.";
    return { success: false, error: msg };
  }
}
