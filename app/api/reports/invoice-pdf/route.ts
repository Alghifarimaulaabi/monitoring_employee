import React from "react";
import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePdfDocument } from "@/components/reports/invoice-pdf-document";
import { InvoiceData, createDefaultInvoiceData } from "@/lib/constants/invoice";
import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

function getLogoBase64(): string | null {
  try {
    const logoPath = path.join(process.cwd(), "public", "assets", "logo.jpeg");
    if (fs.existsSync(logoPath)) {
      const buffer = fs.readFileSync(logoPath);
      return `data:image/jpeg;base64,${buffer.toString("base64")}`;
    }
  } catch (err) {
    console.warn("[invoice-pdf] Failed to read logo file:", err);
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({
      headers: headerList,
    });

    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: "Silakan login terlebih dahulu." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const isOwner =
      session.user.role === "OWNER" || session.user.role === "admin";
    if (!isOwner) {
      return new Response(
        JSON.stringify({ error: "Akses ditolak: Hanya Owner yang dapat mengunduh tagihan." }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await request.json().catch(() => ({}));
    const data: InvoiceData = body.invoiceData || createDefaultInvoiceData({});

    const logoBase64 = getLogoBase64();

    // Render React-PDF document to buffer
    const pdfDoc = React.createElement(InvoicePdfDocument, {
      data,
      logoBase64,
    }) as unknown as Parameters<typeof renderToBuffer>[0];

    const pdfBuffer = await renderToBuffer(pdfDoc);

    const safeNumber = (data.letterNumber || "tagihan")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const filename = `surat-tagihan-${safeNumber}.pdf`;

    return new Response(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (err: unknown) {
    console.error("[invoice-pdf] Error generating PDF:", err);
    const msg = err instanceof Error ? err.message : "Gagal membuat dokumen PDF tagihan.";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
