"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Download,
  Printer,
  RotateCcw,
  Loader2,
  FileText,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
} from "lucide-react";
import InvoiceSheetPreview from "./invoice-sheet-preview";
import {
  InvoiceData,
  terbilang,
  createDefaultInvoiceData,
} from "@/lib/constants/invoice";
import { SerializedInvoicePeriod } from "@/lib/actions/invoice";

interface InvoiceEditorViewProps {
  period: SerializedInvoicePeriod;
  initialInvoiceData: InvoiceData;
}

export default function InvoiceEditorView({
  period,
  initialInvoiceData,
}: InvoiceEditorViewProps) {
  const [formData, setFormData] = useState<InvoiceData>(initialInvoiceData);
  const [isEditing, setIsEditing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Direct in-place field change
  const handleFieldChange = (field: keyof InvoiceData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Direct amount change (auto-updates terbilang)
  const handleAmountChange = (rawAmountStr: string) => {
    const cleanNum = parseInt(rawAmountStr.replace(/\D/g, ""), 10) || 0;
    setFormData((prev) => ({
      ...prev,
      totalAmount: cleanNum,
      terbilangAmount: `${terbilang(cleanNum)} Rupiah`,
    }));
  };

  // Reset to default template
  const handleReset = () => {
    const defaults = createDefaultInvoiceData({
      periodTitle: period.title,
      startDate: period.startDate,
      endDate: period.endDate,
      totalAmount: period.totalAmount > 0 ? period.totalAmount : undefined,
    });
    setFormData(defaults);
    setErrorMessage(null);
    setSuccessToast("Format surat berhasil dikembalikan ke template awal.");
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Toggle edit mode
  const handleToggleEdit = () => {
    setIsEditing((prev) => {
      const next = !prev;
      if (!next) {
        setSuccessToast("Perubahan teks surat berhasil disimpan.");
        setTimeout(() => setSuccessToast(null), 3000);
      }
      return next;
    });
  };

  const handleExportPdf = async () => {
    setIsEditing(false);
    setIsExporting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/reports/invoice-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceData: formData,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || "Gagal menghasilkan dokumen PDF.");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeNumber = (formData.letterNumber || "tagihan")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      link.href = downloadUrl;
      link.download = `surat-tagihan-${safeNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setSuccessToast("File PDF Surat Tagihan berhasil diunduh!");
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Terjadi kesalahan koneksi saat export PDF.";
      setErrorMessage(msg);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    setIsEditing(false);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="space-y-5 pb-16 max-w-5xl mx-auto print:space-y-0 print:pb-0 print:m-0 print:p-0 print:max-w-none print:w-full">
      {/* Top Header & Actions Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs flex flex-col gap-4 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link
            href="/owner/invoices"
            prefetch={true}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-xl transition-colors w-fit"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Tagihan</span>
          </Link>

          <span className="text-xs text-gray-500">
            Dibuat oleh: <strong>{period.creatorName}</strong>
          </span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1 border-t border-gray-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-rose-600">
              <FileText className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Surat Penagihan Resmi
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {period.title}
            </h1>
            <p className="text-xs text-gray-500">
              Rentang: <strong>{period.formattedRange}</strong> • {period.totalPosts} Buket Terpasang
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Tombol Perbaiki (Edit Langsung) */}
            <button
              type="button"
              onClick={handleToggleEdit}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-[0.99] ${
                isEditing
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-300"
                  : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-200"
              }`}
              title={
                isEditing
                  ? "Selesai memperbaiki teks surat"
                  : "Klik untuk mengedit teks surat secara langsung"
              }
            >
              {isEditing ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Selesai Perbaiki</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" />
                  <span>Perbaiki</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl border border-gray-200 transition-colors shadow-2xs cursor-pointer"
              title="Kembalikan nilai teks ke format template awal"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl border border-gray-200 transition-colors shadow-2xs cursor-pointer"
              title="Cetak langsung ke printer atau print-to-PDF browser"
            >
              <Printer className="w-3.5 h-3.5 text-gray-600" />
              <span>Cetak</span>
            </button>

            {/* Tombol Export PDF */}
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              title="Unduh surat penagihan dalam format file PDF A4 resmi"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Membuat PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Export PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mode Indicator Banner */}
        {isEditing && (
          <div className="p-3 bg-amber-50 border border-amber-200/90 rounded-xl flex items-center justify-between text-xs text-amber-900 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Mode Perbaikan Aktif:</strong> Silakan klik langsung pada teks mana pun di lembar surat untuk mengubahnya.
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggleEdit}
              className="font-bold text-amber-800 hover:text-amber-950 underline shrink-0 cursor-pointer"
            >
              Selesai
            </button>
          </div>
        )}

        {/* Success Toast */}
        {successToast && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Gagal Mengunduh PDF:</p>
              <p className="mt-0.5">{errorMessage}</p>
              <p className="mt-1 text-[11px] text-red-600">
                Tip: Anda juga dapat menggunakan tombol <strong>Cetak</strong> untuk menyimpan sebagai PDF langsung dari browser.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sheet Preview Card with In-Place Direct Editing */}
      <div className="flex flex-col items-center justify-center print:block print:m-0 print:p-0 print:w-full">
        {!isEditing && (
          <div className="w-full max-w-[210mm] mb-2 flex items-center justify-between text-xs text-gray-500 px-1 print:hidden">
            <span className="flex items-center gap-1.5 text-gray-600">
              <Info className="w-3.5 h-3.5 text-amber-500" />
              <span>
                Klik tombol <strong>Perbaiki</strong> di atas untuk mengubah teks surat secara langsung.
              </span>
            </span>
            <span className="hidden sm:inline">Format Standar A4 Resmi</span>
          </div>
        )}

        {/* Render the full A4 Sheet (Directly Editable in Perbaiki Mode) */}
        <div className="w-full overflow-x-auto pb-8 print:overflow-visible print:pb-0 print:m-0 print:p-0">
          <InvoiceSheetPreview
            data={formData}
            isEditing={isEditing}
            onChange={handleFieldChange}
            onAmountChange={handleAmountChange}
          />
        </div>
      </div>
    </div>
  );
}
