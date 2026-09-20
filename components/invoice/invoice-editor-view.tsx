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
  Building,
  User,
  DollarSign,
  CreditCard,
  PenTool,
  Sparkles,
  AlertCircle,
  Eye,
  Sliders,
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
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("preview");
  const [activeSection, setActiveSection] = useState<
    "metadata" | "recipient" | "billing" | "bank" | "company"
  >("metadata");

  // Handler for text input changes
  const handleInputChange = (field: keyof InvoiceData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handler for total amount changes (auto-updates terbilang)
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
  };

  // Export PDF via Server API route
  const handleExportPdf = async () => {
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
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Terjadi kesalahan koneksi saat export PDF.";
      setErrorMessage(msg);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header & Actions */}
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
                Template Surat Penagihan
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {period.title}
            </h1>
            <p className="text-xs text-gray-500">
              Rentang Periode: <strong>{period.formattedRange}</strong> •{" "}
              {period.totalPosts} Buket
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl border border-gray-200 transition-colors shadow-2xs cursor-pointer"
              title="Kembalikan nilai teks ke format template awal"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
              <span>Reset Template</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl border border-gray-200 transition-colors shadow-2xs cursor-pointer"
              title="Cetak langsung ke printer atau PDF browser"
            >
              <Printer className="w-3.5 h-3.5 text-gray-600" />
              <span>Cetak / Print</span>
            </button>

            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
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

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Mobile View Toggle */}
        <div className="flex xl:hidden border-t border-gray-100 pt-3">
          <div className="grid grid-cols-2 w-full bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab("editor")}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "editor"
                  ? "bg-white text-gray-900 shadow-2xs"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Edit Teks Surat</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "preview"
                  ? "bg-white text-gray-900 shadow-2xs"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Lembar Surat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container: Form Editor (Left) & Live Sheet Preview (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT: Live Editor Panel */}
        <div
          className={`xl:col-span-5 bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 sm:p-5 space-y-4 print:hidden ${
            activeTab === "preview" ? "hidden xl:block" : "block"
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-rose-600" />
                <span>Pengaturan & Edit Teks</span>
              </h2>
              <p className="text-[11px] text-gray-500">
                Ubah teks di bawah, lembar surat di sebelah kanan otomatis terupdate.
              </p>
            </div>
          </div>

          {/* Section Navigation Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <button
              type="button"
              onClick={() => setActiveSection("metadata")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeSection === "metadata"
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              Informasi Surat
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("recipient")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeSection === "recipient"
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              Penerima (Yth)
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("billing")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeSection === "billing"
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              Rincian Tagihan
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("bank")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeSection === "bank"
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              Rekening & Penutup
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("company")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeSection === "company"
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              Kop Perusahaan
            </button>
          </div>

          {/* Section 1: Informasi Surat */}
          {activeSection === "metadata" && (
            <div className="space-y-3.5 pt-2 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tanggal Surat (Muncul di Kanan Atas)
                </label>
                <input
                  type="text"
                  value={formData.letterDate}
                  onChange={(e) => handleInputChange("letterDate", e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
                  placeholder="Contoh: 18 Mei 2026"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nomor Surat
                </label>
                <input
                  type="text"
                  value={formData.letterNumber}
                  onChange={(e) => handleInputChange("letterNumber", e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
                  placeholder="Contoh: 005/ALZ/V/2026"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Perihal
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Lampiran
                  </label>
                  <input
                    type="text"
                    value={formData.attachment}
                    onChange={(e) => handleInputChange("attachment", e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Salam Pembuka
                </label>
                <input
                  type="text"
                  value={formData.greeting}
                  onChange={(e) => handleInputChange("greeting", e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
                />
              </div>
            </div>
          )}

          {/* Section 2: Penerima (Yth.) */}
          {activeSection === "recipient" && (
            <div className="space-y-3.5 pt-2 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Salam Tujuan
                </label>
                <input
                  type="text"
                  value={formData.recipientSalutation}
                  onChange={(e) =>
                    handleInputChange("recipientSalutation", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
                  placeholder="Yth."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Jabatan Penerima
                </label>
                <input
                  type="text"
                  value={formData.recipientTitle}
                  onChange={(e) => handleInputChange("recipientTitle", e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
                  placeholder="General Manager"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama Perusahaan / Hotel / Venue
                </label>
                <input
                  type="text"
                  value={formData.recipientCompany}
                  onChange={(e) =>
                    handleInputChange("recipientCompany", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
                  placeholder="Patra Cirebon"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Alamat Penerima
                </label>
                <input
                  type="text"
                  value={formData.recipientAddress}
                  onChange={(e) =>
                    handleInputChange("recipientAddress", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
                  placeholder="Jl. Tuparev No. 11 Kedawung"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Kota Penerima
                </label>
                <input
                  type="text"
                  value={formData.recipientCity}
                  onChange={(e) => handleInputChange("recipientCity", e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
                  placeholder="Cirebon"
                />
              </div>
            </div>
          )}

          {/* Section 3: Rincian Tagihan & Nominal */}
          {activeSection === "billing" && (
            <div className="space-y-3.5 pt-2 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Deskripsi Layanan / Tagihan
                </label>
                <textarea
                  rows={2}
                  value={formData.serviceDescription}
                  onChange={(e) =>
                    handleInputChange("serviceDescription", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
                  placeholder="Perawatan Taman, Rental Tanaman, dan Bunga Rangkai"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Periode Mulai
                  </label>
                  <input
                    type="text"
                    value={formData.periodStart}
                    onChange={(e) =>
                      handleInputChange("periodStart", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Periode Selesai
                  </label>
                  <input
                    type="text"
                    value={formData.periodEnd}
                    onChange={(e) => handleInputChange("periodEnd", e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-rose-50/50 border border-rose-200 rounded-xl space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-rose-600" />
                      <span>Nilai Tagihan (Rupiah)</span>
                    </label>
                    <span className="text-[10px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                      Auto Terbilang
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.totalAmount || ""}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    placeholder="15000000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Teks Terbilang (Bisa Dikustomisasi)
                  </label>
                  <input
                    type="text"
                    value={formData.terbilangAmount}
                    onChange={(e) =>
                      handleInputChange("terbilangAmount", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-rose-500 focus:outline-none capitalize"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Rekening & Tanda Tangan */}
          {activeSection === "bank" && (
            <div className="space-y-3.5 pt-2 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Petunjuk Pembayaran
                </label>
                <input
                  type="text"
                  value={formData.paymentInstructions}
                  onChange={(e) =>
                    handleInputChange("paymentInstructions", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nama Bank
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => handleInputChange("bankName", e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
                    placeholder="Mandiri"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nomor Rekening
                  </label>
                  <input
                    type="text"
                    value={formData.bankAccountNumber}
                    onChange={(e) =>
                      handleInputChange("bankAccountNumber", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all font-mono"
                    placeholder="1320025326860"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Atas Nama Rekening
                </label>
                <input
                  type="text"
                  value={formData.bankAccountName}
                  onChange={(e) =>
                    handleInputChange("bankAccountName", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
                  placeholder="Aji Kurniaji"
                />
              </div>

              <div className="pt-2 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Nama Penandatangan
                    </label>
                    <input
                      type="text"
                      value={formData.signerName}
                      onChange={(e) =>
                        handleInputChange("signerName", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
                      placeholder="Aji Kurniaji"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Jabatan
                    </label>
                    <input
                      type="text"
                      value={formData.signerTitle}
                      onChange={(e) =>
                        handleInputChange("signerTitle", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
                      placeholder="Direktur"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Paragraf Penutup
                </label>
                <textarea
                  rows={2}
                  value={formData.closingText}
                  onChange={(e) => handleInputChange("closingText", e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
                />
              </div>
            </div>
          )}

          {/* Section 5: Kop Perusahaan */}
          {activeSection === "company" && (
            <div className="space-y-3.5 pt-2 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama Perusahaan
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) =>
                    handleInputChange("companyName", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Alamat Perusahaan
                </label>
                <textarea
                  rows={2}
                  value={formData.companyAddress}
                  onChange={(e) =>
                    handleInputChange("companyAddress", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Kontak (Telp/Fax & Email)
                </label>
                <input
                  type="text"
                  value={formData.companyContact}
                  onChange={(e) =>
                    handleInputChange("companyContact", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
                />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Live A4 Sheet Preview */}
        <div
          className={`xl:col-span-7 flex flex-col items-center justify-center ${
            activeTab === "editor" ? "hidden xl:flex" : "flex"
          }`}
        >
          <div className="w-full max-w-[210mm] mb-2 flex items-center justify-between text-xs text-gray-500 px-1 print:hidden">
            <span className="font-semibold flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-rose-600" />
              <span>Pratinjau Kertas A4 (Live Preview)</span>
            </span>
            <span>Skala 1:1 format surat resmi</span>
          </div>

          {/* Styled A4 Sheet */}
          <div className="w-full overflow-x-auto pb-6">
            <InvoiceSheetPreview data={formData} />
          </div>
        </div>
      </div>
    </div>
  );
}
