"use server";

import { cache } from "react";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createDefaultInvoiceData,
  formatDateIndoLong,
  InvoiceData,
} from "@/lib/constants/invoice";

export interface SerializedInvoicePeriod {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  formattedRange: string;
  totalPosts: number;
  totalFlowers: number;
  totalAmount: number;
  creatorName: string;
  createdAt: string;
}

const cachedGetInvoicePeriods = cache(async (): Promise<{
  success: boolean;
  periods: SerializedInvoicePeriod[];
  error?: string;
}> => {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return { success: false, periods: [], error: "Silakan login terlebih dahulu." };
    }

    const isOwner =
      session.user.role === "OWNER" || session.user.role === "admin";
    if (!isOwner) {
      return {
        success: false,
        periods: [],
        error: "Akses ditolak: Hanya Owner yang dapat mengakses menu tagihan.",
      };
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
          select: {
            id: true,
            flowerCount: true,
            packagePrice: true,
          },
        },
      },
    });

    const serialized: SerializedInvoicePeriod[] = periods.map((p) => {
      const sStr = p.startDate.toISOString().split("T")[0];
      const eStr = p.endDate.toISOString().split("T")[0];
      const totalFlowers = p.posts.reduce(
        (sum, post) => sum + post.flowerCount,
        0
      );
      const totalAmount = p.posts.reduce(
        (sum, post) => sum + (post.packagePrice || 10000),
        0
      );

      return {
        id: p.id,
        title: p.title,
        startDate: sStr,
        endDate: eStr,
        formattedRange: `${formatDateIndoLong(p.startDate)} - ${formatDateIndoLong(
          p.endDate
        )}`,
        totalPosts: p.posts.length,
        totalFlowers,
        totalAmount,
        creatorName: p.createdBy.name,
        createdAt: p.createdAt.toISOString(),
      };
    });

    return { success: true, periods: serialized };
  } catch (err: unknown) {
    console.error("[getInvoicePeriodsAction] Error:", err);
    return {
      success: false,
      periods: [],
      error: "Gagal mengambil daftar periode tagihan.",
    };
  }
});

export async function getInvoicePeriodsAction(): Promise<{
  success: boolean;
  periods: SerializedInvoicePeriod[];
  error?: string;
}> {
  return cachedGetInvoicePeriods();
}

const cachedGetInvoicePeriodDetail = cache(
  async (
    periodId: string
  ): Promise<{
    success: boolean;
    period?: SerializedInvoicePeriod;
    initialInvoiceData?: InvoiceData;
    error?: string;
  }> => {
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
          error: "Akses ditolak: Hanya Owner yang dapat mengakses menu tagihan.",
        };
      }

      const period = await prisma.bouquetPeriod.findUnique({
        where: { id: periodId },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
          posts: {
            select: {
              id: true,
              flowerCount: true,
              packagePrice: true,
            },
          },
        },
      });

      if (!period) {
        return { success: false, error: "Periode kartu tidak ditemukan." };
      }

      const sStr = period.startDate.toISOString().split("T")[0];
      const eStr = period.endDate.toISOString().split("T")[0];
      const totalFlowers = period.posts.reduce(
        (sum, post) => sum + post.flowerCount,
        0
      );
      const totalAmount = period.posts.reduce(
        (sum, post) => sum + (post.packagePrice || 10000),
        0
      );

      const serializedPeriod: SerializedInvoicePeriod = {
        id: period.id,
        title: period.title,
        startDate: sStr,
        endDate: eStr,
        formattedRange: `${formatDateIndoLong(period.startDate)} - ${formatDateIndoLong(
          period.endDate
        )}`,
        totalPosts: period.posts.length,
        totalFlowers,
        totalAmount,
        creatorName: period.createdBy.name,
        createdAt: period.createdAt.toISOString(),
      };

      const initialInvoiceData = createDefaultInvoiceData({
        periodTitle: period.title,
        startDate: period.startDate,
        endDate: period.endDate,
        totalAmount: totalAmount > 0 ? totalAmount : undefined,
      });

      return {
        success: true,
        period: serializedPeriod,
        initialInvoiceData,
      };
    } catch (err: unknown) {
      console.error("[getInvoicePeriodDetailAction] Error:", err);
      return {
        success: false,
        error: "Gagal mengambil data tagihan periode.",
      };
    }
  }
);

export async function getInvoicePeriodDetailAction(periodId: string) {
  return cachedGetInvoicePeriodDetail(periodId);
}
