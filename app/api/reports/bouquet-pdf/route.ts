import React from "react";
import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import {
  BouquetReportDocument,
  PdfBouquetItem,
} from "@/components/reports/bouquet-pdf-document";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

export const dynamic = "force-dynamic";

const MONTH_NAMES = [
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

/**
 * Safely converts an image (from Data URL, local file, or remote URL) to a JPEG Data URL
 * using sharp. This is essential because @react-pdf/renderer only supports PNG and JPEG,
 * and fails with "Base64 image invalid format: webp" when provided with WebP images.
 */
async function resolveImageToJpegDataUri(
  imageUrl?: string | null,
  storagePath?: string | null
): Promise<string | null> {
  const toJpegBuffer = async (buffer: Buffer): Promise<string | null> => {
    try {
      const converted = await sharp(buffer)
        .rotate()
        .jpeg({ quality: 85 })
        .toBuffer();
      return `data:image/jpeg;base64,${converted.toString("base64")}`;
    } catch (err) {
      console.warn("[bouquet-pdf] Sharp conversion failed:", err);
      return null;
    }
  };

  try {
    // 1. If it's a Data URL
    if (imageUrl && imageUrl.startsWith("data:")) {
      const commaIndex = imageUrl.indexOf(",");
      if (commaIndex !== -1) {
        const rawBuf = Buffer.from(imageUrl.slice(commaIndex + 1), "base64");
        return await toJpegBuffer(rawBuf);
      }
    }

    // 2. Check local disk candidates
    const localCandidates: string[] = [];

    if (imageUrl && (imageUrl.startsWith("/") || !imageUrl.startsWith("http"))) {
      localCandidates.push(
        path.join(process.cwd(), "public", imageUrl.replace(/^\//, ""))
      );
    }
    if (storagePath) {
      localCandidates.push(
        path.join(process.cwd(), "public", "uploads", storagePath)
      );
      localCandidates.push(
        path.join(process.cwd(), "public", storagePath)
      );
      localCandidates.push(
        path.join(process.cwd(), "public", "uploads", "bouquet-photos", storagePath)
      );
    }
    if (imageUrl && imageUrl.includes("bouquet-photos")) {
      const parts = imageUrl.split("bouquet-photos");
      if (parts[1]) {
        localCandidates.push(
          path.join(
            process.cwd(),
            "public",
            "uploads",
            "bouquet-photos",
            parts[1].replace(/^\//, "")
          )
        );
      }
    }

    for (const candidate of localCandidates) {
      if (fs.existsSync(candidate)) {
        try {
          const fileBuf = fs.readFileSync(candidate);
          const converted = await toJpegBuffer(fileBuf);
          if (converted) return converted;
        } catch {
          // continue checking next candidate
        }
      }
    }

    // 3. Remote URL (Supabase Storage or CDN)
    if (imageUrl && (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))) {
      try {
        const res = await fetch(imageUrl, {
          signal: AbortSignal.timeout(6000),
        });
        if (res.ok) {
          const arrayBuf = await res.arrayBuffer();
          const converted = await toJpegBuffer(Buffer.from(arrayBuf));
          if (converted) return converted;
        }
      } catch (e) {
        console.warn(`[bouquet-pdf] Remote fetch failed for ${imageUrl}:`, e);
      }
    }

    return null;
  } catch (err) {
    console.error("[bouquet-pdf] Error resolving image:", err);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({
      headers: headerList,
    });

    if (!session || !session.user) {
      return new Response(
        JSON.stringify({ error: "Silakan login terlebih dahulu." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const isOwner =
      session.user.role === "OWNER" || session.user.role === "admin";
    if (!isOwner) {
      return new Response(
        JSON.stringify({ error: "Akses ditolak: Hanya Owner yang dapat mengunduh laporan PDF." }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const { searchParams } = new URL(request.url);
    const periodId = searchParams.get("periodId");
    const monthRaw = searchParams.get("month");
    const yearRaw = searchParams.get("year");

    let posts;
    let periodLabel: string;
    let filenameSuffix: string;

    if (periodId) {
      // Query specific bouquet period
      const period = await prisma.bouquetPeriod.findUnique({
        where: { id: periodId },
      });

      if (!period) {
        return new Response(
          JSON.stringify({ error: "Kartu periode buket tidak ditemukan." }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      posts = await prisma.bouquetPost.findMany({
        where: {
          OR: [
            { periodId: period.id },
            {
              installDate: {
                gte: period.startDate,
                lte: period.endDate,
              },
            },
          ],
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          installDate: "asc",
        },
      });

      periodLabel = period.title;
      filenameSuffix = `periode-${period.startDate.toISOString().slice(0, 10)}`;
    } else {
      const month = parseInt(monthRaw || "", 10);
      const year = parseInt(yearRaw || "", 10);

      if (isNaN(month) || isNaN(year) || month < 1 || month > 12 || year < 2000) {
        return new Response(
          JSON.stringify({
            error: "Parameter query bulan (1-12) dan tahun (YYYY) atau periodId wajib diisi dengan benar.",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Query bouquet posts for the selected month in chronological order
      const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
      const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

      posts = await prisma.bouquetPost.findMany({
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
            },
          },
        },
        orderBy: {
          installDate: "asc",
        },
      });

      periodLabel = `${MONTH_NAMES[month - 1]} ${year}`;
      const paddedMonth = String(month).padStart(2, "0");
      filenameSuffix = `${year}-${paddedMonth}`;
    }

    if (posts.length === 0) {
      return new Response(
        JSON.stringify({
          error: `Tidak ada data pemasangan buket yang ditemukan untuk ${periodLabel}.`,
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Process image sources safely for @react-pdf/renderer using Sharp conversion
    const pdfItems: PdfBouquetItem[] = await Promise.all(
      posts.map(async (post) => {
        let imageSrc: string | null = null;

        if (!post.isArchived) {
          imageSrc = await resolveImageToJpegDataUri(post.imageUrl, post.storagePath);
        }

        const dateStr = post.installDate.toISOString().split("T")[0];
        const [y, m, d] = dateStr.split("-");
        const formattedDate = `${d} ${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`;

        return {
          id: post.id,
          installDate: formattedDate,
          locationName: post.locationName,
          flowerCount: post.flowerCount,
          packageType: post.packageType,
          staffName: post.user.name,
          imageSrc,
          isArchived: post.isArchived,
          createdAt: post.createdAt.toISOString(),
        };
      })
    );

    const totalFlowers = posts.reduce((sum, p) => sum + p.flowerCount, 0);

    const now = new Date();
    const printedAt = now.toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Jakarta",
    });

    // Render React-PDF to buffer
    const pdfDoc = React.createElement(BouquetReportDocument, {
      periodLabel,
      printedAt,
      totalItems: posts.length,
      totalFlowers,
      items: pdfItems,
    }) as unknown as Parameters<typeof renderToBuffer>[0];

    const pdfBuffer = await renderToBuffer(pdfDoc);
    const filename = `laporan-buket-${filenameSuffix}.pdf`;

    return new Response(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (err: unknown) {
    console.error("[GET /api/reports/bouquet-pdf] Error:", err);
    const msg =
      err instanceof Error
        ? err.message
        : "Terjadi kegagalan server saat membuat dokumen PDF.";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
