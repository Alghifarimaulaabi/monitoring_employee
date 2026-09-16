"use server";

import { z } from "zod";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadBouquetPhoto, deleteBouquetPhoto, deleteBouquetPhotosBatch } from "@/lib/storage";
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
    const session = await getServerSession();

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

    const periodIdRaw = formData.get("period_id") as string | null;

    // Save record to database
    const post = await prisma.bouquetPost.create({
      data: {
        userId: session.user.id,
        periodId: periodIdRaw || undefined,
        imageUrl,
        storagePath,
        installDate: dateObj,
        locationName: location_name,
        flowerCount: flower_count,
      },
    });

    revalidatePath("/employee/history");
    revalidatePath("/employee/submit");
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
  const session = await getServerSession();

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
    const session = await getServerSession();

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
    const session = await getServerSession();

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
        imageUrl: true,
      },
    });

    if (posts.length === 0) {
      return {
        success: true,
        purgedCount: 0,
        error: "Tidak ada foto aktif yang perlu dibersihkan pada periode ini.",
      };
    }

    // Attempt batch physical deletion from cloud/local storage
    await deleteBouquetPhotosBatch(
      posts.map((p) => ({ storagePath: p.storagePath, imageUrl: p.imageUrl }))
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

const MONTH_NAMES_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function formatDateIndo(date: Date): string {
  const d = String(date.getUTCDate()).padStart(2, "0");
  const m = MONTH_NAMES_ID[date.getUTCMonth()];
  const y = date.getUTCFullYear();
  return `${d} ${m} ${y}`;
}

export interface CreatePeriodResult {
  success: boolean;
  periodId?: string;
  error?: string;
}

/**
 * Creates a new bouquet period based on date range from the employee popup.
 */
export async function createBouquetPeriodAction(params: {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  title?: string;
}): Promise<CreatePeriodResult> {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return { success: false, error: "Silakan login terlebih dahulu." };
    }

    const { startDate, endDate, title } = params;
    if (!startDate || !endDate) {
      return { success: false, error: "Tanggal mulai dan tanggal selesai wajib diisi." };
    }

    const [sy, sm, sd] = startDate.split("-").map(Number);
    const [ey, em, ed] = endDate.split("-").map(Number);

    const startObj = new Date(Date.UTC(sy, sm - 1, sd, 0, 0, 0, 0));
    const endObj = new Date(Date.UTC(ey, em - 1, ed, 23, 59, 59, 999));

    if (startObj > endObj) {
      return {
        success: false,
        error: "Tanggal mulai tidak boleh lebih besar dari tanggal selesai.",
      };
    }

    const computedTitle =
      title?.trim() ||
      `Foto Buket Tanggal ${formatDateIndo(startObj)} - ${formatDateIndo(endObj)}`;

    const period = await prisma.bouquetPeriod.create({
      data: {
        title: computedTitle,
        startDate: startObj,
        endDate: endObj,
        createdById: session.user.id,
      },
    });

    // Automatically link unassigned posts falling into this date range
    await prisma.bouquetPost.updateMany({
      where: {
        installDate: {
          gte: startObj,
          lte: endObj,
        },
        periodId: null,
      },
      data: {
        periodId: period.id,
      },
    });

    revalidatePath("/employee/submit");
    revalidatePath("/owner/bouquets");

    return { success: true, periodId: period.id };
  } catch (err: unknown) {
    console.error("[createBouquetPeriodAction] Error:", err);
    const msg =
      err instanceof Error ? err.message : "Gagal membuat kartu buket bulan ini.";
    return { success: false, error: msg };
  }
}

export interface SerializedBouquetPeriod {
  id: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  formattedRange: string;
  createdById: string;
  creatorName: string;
  totalPosts: number;
  totalFlowers: number;
  isArchived: boolean;
  createdAt: string;
  posts: Array<{
    id: string;
    imageUrl: string;
    locationName: string;
    flowerCount: number;
    installDate: string;
    staffName: string;
    isArchived: boolean;
  }>;
}

/**
 * Retrieves all bouquet periods along with their photos for employee and owner views.
 */
export async function getBouquetPeriodsAction(): Promise<{
  success: boolean;
  periods: SerializedBouquetPeriod[];
  error?: string;
}> {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return { success: false, periods: [], error: "Silakan login terlebih dahulu." };
    }

    const periods = await prisma.bouquetPeriod.findMany({
      orderBy: {
        startDate: "desc",
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        posts: {
          orderBy: {
            installDate: "desc",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const serialized: SerializedBouquetPeriod[] = periods.map((p) => {
      const sStr = p.startDate.toISOString().split("T")[0];
      const eStr = p.endDate.toISOString().split("T")[0];
      const totalFlowers = p.posts.reduce(
        (sum, post) => sum + post.flowerCount,
        0
      );

      return {
        id: p.id,
        title: p.title,
        startDate: sStr,
        endDate: eStr,
        formattedRange: `${formatDateIndo(p.startDate)} - ${formatDateIndo(
          p.endDate
        )}`,
        createdById: p.createdById,
        creatorName: p.createdBy.name,
        totalPosts: p.posts.length,
        totalFlowers,
        isArchived: p.isArchived,
        createdAt: p.createdAt.toISOString(),
        posts: p.posts.map((post) => ({
          id: post.id,
          imageUrl: post.imageUrl,
          locationName: post.locationName,
          flowerCount: post.flowerCount,
          installDate: post.installDate.toISOString().split("T")[0],
          staffName: post.user.name,
          isArchived: post.isArchived,
        })),
      };
    });

    return { success: true, periods: serialized };
  } catch (err: unknown) {
    console.error("[getBouquetPeriodsAction] Error:", err);
    return {
      success: false,
      periods: [],
      error: "Gagal mengambil daftar periode buket.",
    };
  }
}

/**
 * Retrieves a single bouquet period by ID along with all its uploaded photos.
 */
export async function getBouquetPeriodDetailAction(periodId: string): Promise<{
  success: boolean;
  period?: SerializedBouquetPeriod;
  error?: string;
}> {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return { success: false, error: "Silakan login terlebih dahulu." };
    }

    const period = await prisma.bouquetPeriod.findUnique({
      where: { id: periodId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        posts: {
          orderBy: {
            installDate: "desc",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!period) {
      return { success: false, error: "Periode buket tidak ditemukan." };
    }

    const sStr = period.startDate.toISOString().split("T")[0];
    const eStr = period.endDate.toISOString().split("T")[0];
    const totalFlowers = period.posts.reduce(
      (sum, post) => sum + post.flowerCount,
      0
    );

    const serialized: SerializedBouquetPeriod = {
      id: period.id,
      title: period.title,
      startDate: sStr,
      endDate: eStr,
      formattedRange: `${formatDateIndo(period.startDate)} - ${formatDateIndo(
        period.endDate
      )}`,
      createdById: period.createdById,
      creatorName: period.createdBy.name,
      totalPosts: period.posts.length,
      totalFlowers,
      isArchived: period.isArchived,
      createdAt: period.createdAt.toISOString(),
      posts: period.posts.map((post) => ({
        id: post.id,
        imageUrl: post.imageUrl,
        locationName: post.locationName,
        flowerCount: post.flowerCount,
        installDate: post.installDate.toISOString().split("T")[0],
        staffName: post.user.name,
        isArchived: post.isArchived,
      })),
    };

    return { success: true, period: serialized };
  } catch (err: unknown) {
    console.error("[getBouquetPeriodDetailAction] Error:", err);
    const msg =
      err instanceof Error ? err.message : "Gagal mengambil detail periode buket.";
    return { success: false, error: msg };
  }
}

/**
 * Deletes all photos in a specific bouquet period.
 * Restricted to Owner role.
 */
export async function deletePeriodPhotosAction(periodId: string): Promise<{
  success: boolean;
  deletedCount?: number;
  error?: string;
}> {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return { success: false, error: "Silakan login terlebih dahulu." };
    }

    const isOwner =
      session.user.role === "OWNER" || session.user.role === "admin";
    if (!isOwner) {
      return {
        success: false,
        error: "Akses ditolak: Hanya Owner yang dapat menghapus foto.",
      };
    }

    const period = await prisma.bouquetPeriod.findUnique({
      where: { id: periodId },
    });

    if (!period) {
      return { success: false, error: "Periode buket tidak ditemukan." };
    }

    // Find all posts linked to this period OR with installDate in period's date range
    const allPosts = await prisma.bouquetPost.findMany({
      where: {
        OR: [
          { periodId },
          {
            installDate: {
              gte: period.startDate,
              lte: period.endDate,
            },
          },
        ],
      },
      select: {
        id: true,
        storagePath: true,
        imageUrl: true,
      },
    });

    // Batch physically delete all files from cloud storage and local disk
    await deleteBouquetPhotosBatch(
      allPosts.map((p) => ({ storagePath: p.storagePath, imageUrl: p.imageUrl }))
    );

    // Delete all matching post records from database
    const postIds = allPosts.map((p) => p.id);
    if (postIds.length > 0) {
      await prisma.bouquetPost.deleteMany({
        where: { id: { in: postIds } },
      });
    }

    // Delete the period card record
    await prisma.bouquetPeriod.delete({
      where: { id: periodId },
    });

    revalidatePath("/owner/bouquets");
    revalidatePath("/employee/submit");

    return { success: true, deletedCount: allPosts.length };
  } catch (err: unknown) {
    console.error("[deletePeriodPhotosAction] Error:", err);
    const msg =
      err instanceof Error
        ? err.message
        : "Gagal menghapus foto pada periode ini.";
    return { success: false, error: msg };
  }
}
