"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadBouquetPhoto, deleteBouquetPhoto } from "@/lib/storage";
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

export interface MonthlyStats {
  totalBouquets: number;
  totalFlowers: number;
  totalFlorists: number;
  archivedCount: number;
  activeCount: number;
}

export interface OwnerMonthlyBouquetsResult {
  success: boolean;
  posts: Array<{
    id: string;
    userId: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
    imageUrl: string;
    storagePath: string;
    installDate: string; // ISO string for client serialization
    locationName: string;
    flowerCount: number;
    isArchived: boolean;
    createdAt: string;
  }>;
  stats: MonthlyStats;
  error?: string;
}

/**
 * Retrieves all bouquet submissions for a specific month and year.
 * Restricted to Owner role.
 */
export async function getOwnerMonthlyBouquetsAction(params: {
  month: number;
  year: number;
}): Promise<OwnerMonthlyBouquetsResult> {
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({
      headers: headerList,
    });

    if (!session || !session.user) {
      return {
        success: false,
        posts: [],
        stats: { totalBouquets: 0, totalFlowers: 0, totalFlorists: 0, archivedCount: 0, activeCount: 0 },
        error: "Silakan login terlebih dahulu.",
      };
    }

    const isOwner = session.user.role === "OWNER" || session.user.role === "admin";
    if (!isOwner) {
      return {
        success: false,
        posts: [],
        stats: { totalBouquets: 0, totalFlowers: 0, totalFlorists: 0, archivedCount: 0, activeCount: 0 },
        error: "Akses ditolak: Hanya Owner yang dapat mengakses data ini.",
      };
    }

    const { month, year } = params;
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const posts = await prisma.bouquetPost.findMany({
      where: {
        installDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        installDate: "desc",
      },
    });

    let totalFlowers = 0;
    const floristsSet = new Set<string>();
    let archivedCount = 0;

    const serializedPosts = posts.map((p) => {
      totalFlowers += p.flowerCount;
      floristsSet.add(p.userId);
      if (p.isArchived) archivedCount++;

      return {
        id: p.id,
        userId: p.userId,
        user: p.user,
        imageUrl: p.imageUrl,
        storagePath: p.storagePath,
        installDate: p.installDate.toISOString().split("T")[0],
        locationName: p.locationName,
        flowerCount: p.flowerCount,
        isArchived: p.isArchived,
        createdAt: p.createdAt.toISOString(),
      };
    });

    return {
      success: true,
      posts: serializedPosts,
      stats: {
        totalBouquets: posts.length,
        totalFlowers,
        totalFlorists: floristsSet.size,
        archivedCount,
        activeCount: posts.length - archivedCount,
      },
    };
  } catch (err: unknown) {
    console.error("[getOwnerMonthlyBouquetsAction] Error:", err);
    const msg = err instanceof Error ? err.message : "Gagal memuat galeri buket bulanan.";
    return {
      success: false,
      posts: [],
      stats: { totalBouquets: 0, totalFlowers: 0, totalFlorists: 0, archivedCount: 0, activeCount: 0 },
      error: msg,
    };
  }
}

export interface PurgePhotosResult {
  success: boolean;
  purgedCount?: number;
  error?: string;
}

/**
 * Purges physical photo files for a given month & year to conserve cloud storage.
 * Retains database metadata for reporting while marking isArchived = true and clearing imageUrl.
 * Strictly requires the confirmation token to be 'HAPUS'.
 */
export async function deleteMonthlyPhotosAction(params: {
  month: number;
  year: number;
  confirmToken: string;
}): Promise<PurgePhotosResult> {
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({
      headers: headerList,
    });

    if (!session || !session.user) {
      return { success: false, error: "Silakan login terlebih dahulu." };
    }

    const isOwner = session.user.role === "OWNER" || session.user.role === "admin";
    if (!isOwner) {
      return { success: false, error: "Akses ditolak: Hanya Owner yang dapat melakukan pembersihan storage." };
    }

    if (params.confirmToken.trim() !== "HAPUS") {
      return { success: false, error: "Konfirmasi tidak valid. Harap ketik kata 'HAPUS' dengan benar." };
    }

    const { month, year } = params;
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    // Find all posts in this period that still have active images
    const posts = await prisma.bouquetPost.findMany({
      where: {
        installDate: {
          gte: startDate,
          lte: endDate,
        },
        isArchived: false,
      },
      select: {
        id: true,
        storagePath: true,
      },
    });

    if (posts.length === 0) {
      return {
        success: true,
        purgedCount: 0,
        error: "Tidak ada foto aktif yang perlu dibersihkan pada periode ini.",
      };
    }

    // Attempt physical deletion of each file from cloud/local storage
    await Promise.allSettled(
      posts.map(async (p) => {
        if (p.storagePath) {
          try {
            await deleteBouquetPhoto(p.storagePath);
          } catch (e) {
            console.warn(`[Purge] Failed to delete storage file ${p.storagePath}:`, e);
          }
        }
      })
    );

    // Update records in database to archived state with cleared image url
    await prisma.bouquetPost.updateMany({
      where: {
        id: {
          in: posts.map((p) => p.id),
        },
      },
      data: {
        isArchived: true,
        imageUrl: "",
      },
    });

    revalidatePath("/owner/bouquets");

    return {
      success: true,
      purgedCount: posts.length,
    };
  } catch (err: unknown) {
    console.error("[deleteMonthlyPhotosAction] Error:", err);
    const msg = err instanceof Error ? err.message : "Gagal membersihkan foto penyimpanan.";
    return { success: false, error: msg };
  }
}
