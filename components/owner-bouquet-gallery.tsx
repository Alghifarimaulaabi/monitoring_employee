"use client";

import React, { useState, useTransition } from "react";
import {
  Flower2,
  Calendar,
  MapPin,
  User,
  Download,
  Trash2,
  Maximize2,
  X,
  FileText,
  Layers,
  Sparkles,
  Users,
  Archive,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Clock,
  Images,
  FolderOpen,
} from "lucide-react";
import {
  getOwnerMonthlyBouquetsAction,
  OwnerMonthlyBouquetsResult,
  SerializedBouquetPeriod,
  getBouquetPeriodsAction,
  deletePeriodPhotosAction,
} from "@/lib/actions/bouquet";
import PurgePhotosDialog from "@/components/purge-photos-dialog";

const MONTH_OPTIONS = [
  { value: 1, label: "Januari" },
  { value: 2, label: "Februari" },
  { value: 3, label: "Maret" },
  { value: 4, label: "April" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "Agustus" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" },
];

const YEAR_OPTIONS = [2025, 2026, 2027];

interface OwnerBouquetGalleryProps {
  initialData: OwnerMonthlyBouquetsResult;
  initialPeriods: SerializedBouquetPeriod[];
  initialMonth: number;
  initialYear: number;
}

export default function OwnerBouquetGallery({
  initialData,
  initialPeriods,
  initialMonth,
  initialYear,
}: OwnerBouquetGalleryProps) {
  const [selectedMonth, setSelectedMonth] = useState<number>(initialMonth);
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [data, setData] = useState<OwnerMonthlyBouquetsResult>(initialData);
  const [periods, setPeriods] = useState<SerializedBouquetPeriod[]>(initialPeriods);
  const [activeTab, setActiveTab] = useState<"cards" | "allPhotos">("cards");
  const [isPending, startTransition] = useTransition();

  // Lightbox modal state
  const [activePreview, setActivePreview] = useState<{
    url: string;
    location: string;
    date: string;
    flowerCount: number;
    staffName: string;
  } | null>(null);

  // Card delete confirmation modal state
  const [periodToDelete, setPeriodToDelete] = useState<SerializedBouquetPeriod | null>(null);
  const [isDeletingPeriod, setIsDeletingPeriod] = useState(false);

  // Purge monthly dialog state
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);

  // PDF download state
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Fetch bouquets when month or year changes
  const handleFilterChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);

    startTransition(async () => {
      const [monthlyRes, periodsRes] = await Promise.all([
        getOwnerMonthlyBouquetsAction({ month, year }),
        getBouquetPeriodsAction(),
      ]);
      setData(monthlyRes);
      if (periodsRes.success) {
        setPeriods(periodsRes.periods);
      }
    });
  };

  const handleRefresh = async () => {
    const [monthlyRes, periodsRes] = await Promise.all([
      getOwnerMonthlyBouquetsAction({
        month: selectedMonth,
        year: selectedYear,
      }),
      getBouquetPeriodsAction(),
    ]);
    setData(monthlyRes);
    if (periodsRes.success) {
      setPeriods(periodsRes.periods);
    }
  };

  // One-click monthly consolidated PDF export
  const handleDownloadMonthlyPdf = async (customMonth?: number, customYear?: number) => {
    const targetMonth = customMonth ?? selectedMonth;
    const targetYear = customYear ?? selectedYear;

    setIsExportingPdf(true);
    try {
      const url = `/api/reports/bouquet-pdf?month=${targetMonth}&year=${targetYear}`;
      const res = await fetch(url);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Gagal mengunduh file laporan PDF bulanan."
        );
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const paddedMonth = String(targetMonth).padStart(2, "0");
      link.href = downloadUrl;
      link.download = `laporan-buket-${targetYear}-${paddedMonth}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      showToast(
        "success",
        `Laporan PDF bulan ${MONTH_OPTIONS[targetMonth - 1].label} ${targetYear} berhasil diunduh.`
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Terjadi kesalahan saat mengunduh PDF.";
      showToast("error", msg);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Card-level deletion: deletes all photos in that card/period
  const handleExecuteDeletePeriod = async () => {
    if (!periodToDelete || isDeletingPeriod) return;

    setIsDeletingPeriod(true);
    try {
      const res = await deletePeriodPhotosAction(periodToDelete.id);
      if (!res.success) {
        showToast("error", res.error || "Gagal menghapus foto pada kartu ini.");
      } else {
        showToast(
          "success",
          `Semua foto pada ${periodToDelete.title} (${res.deletedCount} foto) berhasil dihapus.`
        );
        setPeriodToDelete(null);
        handleRefresh();
      }
    } catch (err: unknown) {
      showToast("error", "Terjadi kegagalan saat menghapus foto.");
    } finally {
      setIsDeletingPeriod(false);
    }
  };

  const currentMonthLabel =
    MONTH_OPTIONS.find((m) => m.value === selectedMonth)?.label || "";

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all animate-in fade-in slide-in-from-bottom-2 ${
            toastMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {toastMessage.type === "success" ? (
            <Sparkles className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Galeri Buket & Laporan Bulanan
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Inspeksi visual kartu buket, export dokumen PDF 1 bulan penuh, dan tombol hapus semua foto pada kartu.
          </p>
        </div>

        {/* Action Buttons: Export PDF 1 Bulan & Purge Storage */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => handleDownloadMonthlyPdf()}
            disabled={data.posts.length === 0 || isExportingPdf || isPending}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-all cursor-pointer"
            title="Export seluruh gambar & laporan buket bulan ini dalam 1 dokumen PDF"
          >
            {isExportingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Membuat PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export PDF (Bulan Ini)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsPurgeModalOpen(true)}
            disabled={data.stats.activeCount === 0 || isPending}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-white hover:text-rose-600 hover:bg-rose-50 border border-gray-200 shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Hapus permanen foto storage bulan ini untuk konservasi kuota"
          >
            <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-rose-600" />
            <span>Purge Storage Bulan Ini</span>
          </button>
        </div>
      </div>

      {/* Filter & Period Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500 block">
              Pilih Periode Laporan
            </span>
            <span className="text-sm font-bold text-gray-900">
              {currentMonthLabel} {selectedYear}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Month Selector */}
          <select
            value={selectedMonth}
            onChange={(e) =>
              handleFilterChange(parseInt(e.target.value, 10), selectedYear)
            }
            disabled={isPending}
            className="px-3.5 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-500 transition-all cursor-pointer"
          >
            {MONTH_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          {/* Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) =>
              handleFilterChange(selectedMonth, parseInt(e.target.value, 10))
            }
            disabled={isPending}
            className="px-3.5 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-500 transition-all cursor-pointer"
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metrics Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Flower2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500">Total Buket Bulan Ini</div>
            <div className="text-xl font-bold text-gray-900">
              {data.stats.totalBouquets}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500">Total Bunga (Pcs)</div>
            <div className="text-xl font-bold text-gray-900">
              {data.stats.totalFlowers} pcs
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500">Total Kartu Periode</div>
            <div className="text-xl font-bold text-gray-900">
              {periods.length} Kartu
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500">Foto Aktif / Arsip</div>
            <div className="text-sm sm:text-base font-bold text-gray-900">
              {data.stats.activeCount} aktif{" "}
              <span className="text-xs font-normal text-gray-400">
                ({data.stats.archivedCount} di-purge)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Tampilan Kartu Periode vs Grid Semua Foto */}
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab("cards")}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "cards"
              ? "border-rose-600 text-rose-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Kartu Buket Periode ({periods.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("allPhotos")}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "allPhotos"
              ? "border-rose-600 text-rose-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Semua Foto Bulan Ini ({data.posts.length})
        </button>
      </div>

      {/* TAB 1: KARTU BUKET PERIODE (DENGAN TOMBOL HAPUS PADA TIAP CARD) */}
      {activeTab === "cards" && (
        <div className="space-y-4">
          {periods.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-gray-200/80 shadow-xs text-center">
              <div className="w-14 h-14 bg-gray-50 text-gray-400 rounded-2xl mx-auto flex items-center justify-center mb-3">
                <FolderOpen className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">
                Belum Ada Kartu Buket Periode
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Karyawan belum membuat kartu buket periode melalui tombol &quot;Tambahkan Buket Bulan Ini&quot;.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {periods.map((period) => {
                const [py, pm] = period.startDate.split("-").map(Number);
                return (
                  <div
                    key={period.id}
                    className="bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
                  >
                    {/* Card Header with Title & Action: HAPUS */}
                    <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                          <h3 className="text-base font-bold text-gray-900 leading-tight">
                            {period.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>Rentang: <strong>{period.formattedRange}</strong></span>
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          Dibuat oleh: <strong>{period.creatorName}</strong>
                        </div>
                      </div>

                      {/* TOMBOL HAPUS PADA CARD: Untuk menghapus semua foto pada kartu/bulan itu */}
                      <button
                        type="button"
                        onClick={() => setPeriodToDelete(period)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer shrink-0"
                        title="Hapus semua foto pada kartu buket ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>

                    {/* Metrics in Card */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-gray-50 p-2.5 rounded-xl flex items-center gap-2">
                        <Flower2 className="w-4 h-4 text-pink-500" />
                        <div>
                          <span className="text-[10px] text-gray-400 block">Total Bunga</span>
                          <span className="font-bold text-gray-800">{period.totalFlowers} pcs</span>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-2.5 rounded-xl flex items-center gap-2">
                        <Images className="w-4 h-4 text-purple-500" />
                        <div>
                          <span className="text-[10px] text-gray-400 block">Dokumentasi Foto</span>
                          <span className="font-bold text-gray-800">{period.totalPosts} Foto</span>
                        </div>
                      </div>
                    </div>

                    {/* Photos Preview in this Card */}
                    {period.posts.length > 0 ? (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                          Daftar Foto Buket ({period.posts.length}):
                        </span>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {period.posts.map((post) => (
                            <div
                              key={post.id}
                              className="relative aspect-4/3 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 group/img"
                            >
                              {post.imageUrl ? (
                                <>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={post.imageUrl}
                                    alt={post.locationName}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setActivePreview({
                                        url: post.imageUrl,
                                        location: post.locationName,
                                        date: post.installDate,
                                        flowerCount: post.flowerCount,
                                        staffName: post.staffName,
                                      })
                                    }
                                    className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white"
                                    title="Perbesar Foto"
                                  >
                                    <Maximize2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-400 text-center p-1">
                                  Foto Diarsipkan
                                </div>
                              )}
                              <div className="absolute bottom-1 left-1 right-1 bg-black/60 backdrop-blur-xs text-white text-[9px] font-medium px-1 rounded truncate">
                                {post.locationName}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-center text-xs text-gray-400">
                        Belum ada foto yang diunggah pada kartu ini.
                      </div>
                    )}

                    {/* Card Footer Actions: Export PDF for this month */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[11px] text-gray-400">
                        ID: {period.id.slice(0, 8)}...
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDownloadMonthlyPdf(pm, py)}
                        disabled={period.posts.length === 0 || isExportingPdf}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors disabled:opacity-40 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export PDF Kartu Ini</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SEMUA FOTO BULAN INI (GRID VIEW LENGKAP) */}
      {activeTab === "allPhotos" && (
        <div className="space-y-4">
          {isPending ? (
            <div className="bg-white rounded-2xl p-16 border border-gray-200/80 shadow-xs text-center">
              <Loader2 className="w-8 h-8 text-rose-600 animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-600">
                Memuat data galeri buket...
              </p>
            </div>
          ) : data.posts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 sm:p-16 border border-gray-200/80 shadow-xs text-center">
              <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-2xl mx-auto flex items-center justify-center mb-3">
                <Flower2 className="w-8 h-8" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">
                Belum Ada Buket di Bulan Ini
              </h2>
              <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                Tidak ditemukan laporan pemasangan buket untuk periode{" "}
                <strong>
                  {currentMonthLabel} {selectedYear}
                </strong>
                .
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {data.posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
                >
                  {/* Photo Container */}
                  <div className="relative aspect-4/3 bg-gray-100 overflow-hidden">
                    {post.imageUrl && !post.isArchived ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={post.imageUrl}
                          alt={post.locationName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setActivePreview({
                              url: post.imageUrl,
                              location: post.locationName,
                              date: post.installDate,
                              flowerCount: post.flowerCount,
                              staffName: post.user.name,
                            })
                          }
                          className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                          title="Perbesar Foto"
                        >
                          <div className="bg-white/90 text-gray-900 rounded-full p-2.5 shadow-sm transform scale-90 group-hover:scale-100 transition-transform">
                            <Maximize2 className="w-4 h-4" />
                          </div>
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gray-50 text-gray-400">
                        <Archive className="w-7 h-7 text-amber-500 mb-1" />
                        <span className="text-xs font-semibold text-gray-700">
                          Foto Telah Di-Purge
                        </span>
                        <span className="text-[10px] text-gray-400 mt-0.5">
                          Diarsipkan untuk hemat storage
                        </span>
                      </div>
                    )}

                    {/* Flower Count Badge */}
                    <div className="absolute top-2.5 right-2.5 bg-gray-900/85 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-xs flex items-center gap-1">
                      <Flower2 className="w-3 h-3 text-rose-400" />
                      <span>{post.flowerCount} pcs</span>
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{post.installDate}</span>
                      </div>

                      <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">
                        {post.locationName}
                      </h3>
                    </div>

                    <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1.5 truncate">
                        <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate font-medium text-gray-700">
                          {post.user.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {post.id.slice(0, 6)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DIALOG KONFIRMASI HAPUS PADA KARTU OWNER */}
      {periodToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-5 pb-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 leading-tight">
                  Hapus Semua Foto Pada Kartu Ini?
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {periodToDelete.title}
                </p>
              </div>
            </div>

            <div className="p-5 space-y-3">
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 leading-relaxed">
                <p className="font-semibold mb-1">
                  ⚠️ Peringatan Penghapusan Foto:
                </p>
                <p>
                  Tindakan ini akan <strong>menghapus permanen seluruh foto ({periodToDelete.totalPosts} foto)</strong> di dalam kartu ini dari server/cloud storage untuk menghemat kuota.
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPeriodToDelete(null)}
                disabled={isDeletingPeriod}
                className="px-4 py-2 text-xs font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteDeletePeriod}
                disabled={isDeletingPeriod}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {isDeletingPeriod ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Ya, Hapus Semua Foto</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox / High-Resolution Photo Preview Modal */}
      {activePreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setActivePreview(null)}
        >
          <div
            className="relative bg-white rounded-2xl overflow-hidden max-w-3xl w-full shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 leading-tight">
                  {activePreview.location}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Dipasang oleh <strong>{activePreview.staffName}</strong> •{" "}
                  {activePreview.date}
                </p>
              </div>
              <button
                onClick={() => setActivePreview(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 bg-black/90 flex items-center justify-center p-2 overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activePreview.url}
                alt={activePreview.location}
                className="max-h-[65vh] w-auto object-contain rounded-lg shadow-md"
              />
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800">
                  Total Rangkaian:
                </span>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-bold">
                  {activePreview.flowerCount} pcs
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActivePreview(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purge Photos Confirmation Dialog (Monthly) */}
      <PurgePhotosDialog
        isOpen={isPurgeModalOpen}
        onClose={() => setIsPurgeModalOpen(false)}
        month={selectedMonth}
        year={selectedYear}
        monthName={currentMonthLabel}
        activePhotoCount={data.stats.activeCount}
        onPurgeSuccess={() => {
          showToast(
            "success",
            `Penyimpanan foto periode ${currentMonthLabel} ${selectedYear} berhasil dibersihkan.`
          );
          handleRefresh();
        }}
      />
    </div>
  );
}
