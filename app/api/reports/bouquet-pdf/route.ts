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
    const monthRaw = searchParams.get("month");
    const yearRaw = searchParams.get("year");

    const month = parseInt(monthRaw || "", 10);
    const year = parseInt(yearRaw || "", 10);

    if (isNaN(month) || isNaN(year) || month < 1 || month > 12 || year < 2000) {
      return new Response(
        JSON.stringify({
          error: "Parameter query bulan (1-12) dan tahun (YYYY) wajib diisi dengan benar.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Query bouquet posts for the selected month in chronological order
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
          },
        },
      },
      orderBy: {
        installDate: "asc",
      },
    });

    if (posts.length === 0) {
      return new Response(
        JSON.stringify({
          error: `Tidak ada data pemasangan buket yang ditemukan untuk periode ${MONTH_NAMES[month - 1]} ${year}.`,
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Process image sources safely for @react-pdf/renderer
    const pdfItems: PdfBouquetItem[] = await Promise.all(
      posts.map(async (post) => {
        let imageSrc: string | null = null;

        if (!post.isArchived && post.imageUrl) {
          if (post.imageUrl.startsWith("data:")) {
            imageSrc = post.imageUrl;
          } else if (post.imageUrl.startsWith("/uploads/")) {
            // Local filesystem fallback: check public directory
            const localPath = path.join(
              process.cwd(),
              "public",
              post.imageUrl.replace(/^\//, "")
            );
            if (fs.existsSync(localPath)) {
              try {
                const fileBuf = fs.readFileSync(localPath);
                const b64 = fileBuf.toString("base64");
                const ext = path.extname(localPath).toLowerCase().replace(".", "");
                const mime = ext === "webp" ? "image/webp" : "image/jpeg";
                imageSrc = `data:${mime};base64,${b64}`;
              } catch {
                imageSrc = null;
              }
            }
          } else if (
            post.imageUrl.startsWith("http://") ||
            post.imageUrl.startsWith("https://")
          ) {
            // Fetch remote image with timeout
            try {
              const res = await fetch(post.imageUrl, {
                signal: AbortSignal.timeout(4000),
              });
              if (res.ok) {
                const arrayBuf = await res.arrayBuffer();
                const b64 = Buffer.from(arrayBuf).toString("base64");
                const mime = res.headers.get("content-type") || "image/jpeg";
                imageSrc = `data:${mime};base64,${b64}`;
              }
            } catch {
              imageSrc = null;
            }
          }
        }

        const dateStr = post.installDate.toISOString().split("T")[0];
        const [y, m, d] = dateStr.split("-");
        const formattedDate = `${d} ${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`;

        return {
          id: post.id,
          installDate: formattedDate,
          locationName: post.locationName,
          flowerCount: post.flowerCount,
          staffName: post.user.name,
          imageSrc,
          isArchived: post.isArchived,
          createdAt: post.createdAt.toISOString(),
        };
      })
    );

    const periodLabel = `${MONTH_NAMES[month - 1]} ${year}`;
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

    const paddedMonth = String(month).padStart(2, "0");
    const filename = `laporan-buket-${year}-${paddedMonth}.pdf`;

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
