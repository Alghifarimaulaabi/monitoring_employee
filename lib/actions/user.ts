"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
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
    const headerList = await headers();
    const session = await auth.api.getSession({
      headers: headerList,
    });

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
  const headerList = await headers();
  const session = await auth.api.getSession({
    headers: headerList,
  });

  const isCallerOwner =
    session?.user?.role === "OWNER" || session?.user?.role === "admin";

  if (!isCallerOwner) {
    throw new Error("Unauthorized");
  }

  return await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}
