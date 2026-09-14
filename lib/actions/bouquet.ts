"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadBouquetPhoto } from "@/lib/storage";
import { revalidatePath } from "next/cache";
import crypto from "node:crypto";

const bouquetSchema = z.object({
  install_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  location_name: z.string().min(3, "Nama lokasi minimal 3 karakter"),
  flower_count: z.number().int().positive("Jumlah bunga harus lebih dari 0"),
});

export interface CreateBouquetResult {
  success: boolean;
  postId?: string;
  imageUrl?: string;
  error?: string;
}

/**
 * Server Action to submit bouquet installation proof from field staff.
 * Handles authentication, payload validation, cloud/local storage upload, and DB persistence.
 */
export async function createBouquetPostAction(formData: FormData): Promise<CreateBouquetResult> {
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({
      headers: headerList,
    });

    if (!session || !session.user) {
      return { success: false, error: "Silakan login terlebih dahulu." };
    }

    const file = formData.get("file") as File | null;
    const installDateStr = formData.get("install_date") as string | null;
    const locationName = formData.get("location_name") as string | null;
    const flowerCountRaw = formData.get("flower_count") as string | null;

    if (!file || !(file instanceof Blob) || file.size === 0) {
      return { success: false, error: "File foto bukti pemasangan wajib dilampirkan." };
    }

    const parsedCount = parseInt(flowerCountRaw || "0", 10);

    const validation = bouquetSchema.safeParse({
      install_date: installDateStr,
      location_name: locationName,
      flower_count: parsedCount,
    });

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || "Data input tidak valid.",
      };
    }

    const { install_date, location_name, flower_count } = validation.data;

    // Generate deterministic storage path: bouquet-photos/YYYY-MM/UUID.webp
    const dateObj = new Date(install_date);
    const yearMonth = install_date.slice(0, 7); // e.g. "2026-09"
    const fileId = crypto.randomUUID();
    const ext = file.type.includes("webp") ? "webp" : "jpg";
    const storagePath = `bouquet-photos/${yearMonth}/${fileId}.${ext}`;

    // Read binary buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage (or local storage fallback)
    const { imageUrl } = await uploadBouquetPhoto(
      buffer,
      storagePath,
      file.type || "image/webp"
    );

    // Save record to database
    const post = await prisma.bouquetPost.create({
      data: {
        userId: session.user.id,
        imageUrl,
        storagePath,
        installDate: dateObj,
        locationName: location_name,
        flowerCount: flower_count,
      },
    });

    revalidatePath("/employee/history");
    revalidatePath("/owner/bouquets");

    return {
      success: true,
      postId: post.id,
      imageUrl: post.imageUrl,
    };
  } catch (err: unknown) {
    console.error("[createBouquetPostAction] Error:", err);
    const msg = err instanceof Error ? err.message : "Gagal menyimpan laporan pemasangan buket.";
    return { success: false, error: msg };
  }
}

/**
 * Retrieves the bouquet submission history for the logged-in employee.
 */
export async function getEmployeeBouquetHistoryAction() {
  const headerList = await headers();
  const session = await auth.api.getSession({
    headers: headerList,
  });

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  return await prisma.bouquetPost.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      installDate: "desc",
    },
  });
}
