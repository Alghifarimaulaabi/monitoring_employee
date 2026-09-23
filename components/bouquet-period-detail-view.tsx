"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Camera,
  Download,
  Trash2,
  ChevronLeft,
  Flower2,
  MapPin,
  User,
  Sparkles,
  Maximize2,
  X,
  AlertCircle,
  Loader2,
  Layers,
  Archive,
} from "lucide-react";
import {
  SerializedBouquetPeriod,
  deletePeriodPhotosAction,
} from "@/lib/actions/bouquet";
import { useUIStore } from "@/lib/stores/ui-store";
import LazyImage from "@/components/lazy-image";
import BouquetPackageBadge from "@/components/bouquet-package-badge";

interface BouquetPeriodDetailViewProps {
  period: SerializedBouquetPeriod;
  role: "OWNER" | "EMPLOYEE";
}

export default function BouquetPeriodDetailView({
  period: initialPeriod,
  role,
}: BouquetPeriodDetailViewProps) {
  const router = useRouter();
  const [period, setPeriod] = useState(initialPeriod);
  const [activePreview, setActivePreview] = useState<{
    url: string;
    location: string;
    date: string;
    flowerCount: number;
    staffName: string;
    packageType?: string;
  } | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { toastMessage, showToast, isExportingPdf, setIsExportingPdf } = useUIStore();

  const isOwner = role === "OWNER";
  const backUrl = isOwner ? "/owner/bouquets" : "/employee/submit";

  // PDF Export
  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      const url = `/api/reports/bouquet-pdf?periodId=${encodeURIComponent(period.id)}`;
      const res = await fetch(url);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Gagal mengunduh laporan PDF.");
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeTitle = period.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      link.href = downloadUrl;
      link.download = `${safeTitle}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      showToast("success", `Laporan PDF "${period.title}" berhasil diunduh.`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Terjadi kesalahan saat mengunduh PDF.";
      showToast("error", msg);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Delete all photos in period
  const handleDeletePeriod = async () => {
    setIsDeleting(true);
    try {
      const res = await deletePeriodPhotosAction(period.id);
      if (!res.success) {
        showToast("error", res.error || "Gagal menghapus foto pada periode ini.");
      } else {
        showToast(
          "success",
          `Semua foto pada ${period.title} berhasil dihapus.`
        );
        setShowDeleteModal(false);
        router.push(backUrl);
      }
    } catch {
      showToast("error", "Terjadi kesalahan saat menghapus foto.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
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

      {/* Top Navigation & Action Header */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Link
            href={backUrl}
            prefetch={true}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Kembali ke Kartu Buket</span>
          </Link>

          <span className="text-[11px] font-semibold text-gray-400">
            Dibuat oleh: {period.creatorName}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-rose-600">
              <Calendar className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Periode Buket Lapangan
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight leading-snug">
              {period.title}
            </h1>
            <p className="text-xs text-gray-500">
              Rentang Waktu: <strong>{period.formattedRange}</strong>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Tambahkan Foto */}
            <Link
              href={`/employee/submit/upload?periodId=${period.id}&startDate=${period.startDate}&endDate=${period.endDate}`}
              prefetch={true}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Camera className="w-4 h-4" />
              <span>Tambahkan Foto</span>
            </Link>

            {/* Owner Actions */}
            {isOwner && (
              <>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={period.posts.length === 0 || isExportingPdf}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl border border-gray-200 transition-colors disabled:opacity-40 cursor-pointer"
                  title="Export PDF Laporan Periode Ini"
                >
                  {isExportingPdf ? (
                    <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>Export PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-colors cursor-pointer"
                  title="Hapus Semua Foto pada Periode Ini"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>Hapus Semua Foto</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Flower2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-gray-500">Total Buket</div>
            <div className="text-lg font-bold text-gray-900">{period.totalPosts} Buket</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-gray-500">Total Bunga</div>
            <div className="text-lg font-bold text-gray-900">{period.totalFlowers} pcs</div>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-gray-500">Status Periode</div>
            <div className="text-lg font-bold text-gray-900">
              {period.isArchived ? "Diarsipkan" : "Aktif"}
            </div>
          </div>
        </div>
      </div>

      {/* Full Photo Gallery */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <span>Keseluruhan Foto Buket</span>
          <span className="text-xs bg-rose-50 text-rose-700 font-semibold px-2 py-0.5 rounded-full">
            {period.posts.length} foto
          </span>
        </h2>

        {period.posts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-gray-200/80 shadow-xs text-center py-16">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-xs">
              <Camera className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              Belum Ada Foto Buket pada Periode Ini
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Belum ada staf lapangan yang mengunggah foto buket untuk rentang tanggal ini.
            </p>
            <div className="mt-5">
              <Link
                href={`/employee/submit/upload?periodId=${period.id}&startDate=${period.startDate}&endDate=${period.endDate}`}
                prefetch={true}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <Camera className="w-4 h-4" />
                <span>Tambahkan Foto Pertama</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {period.posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
              >
                {/* Photo Image Container */}
                <div className="relative aspect-4/3 bg-gray-100 overflow-hidden">
                  {post.imageUrl && !post.isArchived ? (
                    <>
                      <LazyImage
                        src={post.imageUrl}
                        alt={post.locationName}
                        className="group-hover:scale-105 transition-transform duration-300"
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
                            packageType: post.packageType,
                          })
                        }
                        className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                        title="Perbesar Foto"
                      >
                        <div className="w-9 h-9 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-xs">
                          <Maximize2 className="w-4 h-4" />
                        </div>
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gray-50 text-gray-400">
                      <Archive className="w-8 h-8 text-amber-500 mb-1" />
                      <span className="text-xs font-semibold text-gray-700">Foto Diarsipkan</span>
                      <span className="text-[10px] text-gray-400">Penyimpanan fisik dibersihkan</span>
                    </div>
                  )}

                  {/* Bouquet Package Type Badge (Floating Top-Left) */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <BouquetPackageBadge packageType={post.packageType} variant="floating" />
                  </div>

                  {/* Flower Count Badge */}
                  <div className="absolute top-2.5 right-2.5 bg-gray-900/85 backdrop-blur-xs text-white text-xs font-bold px-2 py-0.5 rounded-lg shadow-xs flex items-center gap-1">
                    <Flower2 className="w-3 h-3 text-rose-400" />
                    <span>{post.flowerCount} pcs</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{post.installDate}</span>
                      </div>
                      <BouquetPackageBadge packageType={post.packageType} variant="inline" />
                    </div>

                    <h4 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">
                      {post.locationName}
                    </h4>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1.5 truncate">
                      <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate font-medium text-gray-700">
                        {post.staffName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
                  Dipasang oleh <strong>{activePreview.staffName}</strong> • {activePreview.date}
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

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800">Total Rangkaian:</span>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-bold">
                    {activePreview.flowerCount} pcs
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800">Jenis Buket:</span>
                  <BouquetPackageBadge packageType={activePreview.packageType} variant="inline" />
                </div>
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

      {/* Delete Period Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-5 pb-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 leading-tight">
                  Hapus Semua Foto Kartu Ini?
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tindakan permanen dan tidak dapat dibatalkan
                </p>
              </div>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-xs text-gray-600 leading-relaxed">
                Anda akan menghapus seluruh <strong>{period.totalPosts} foto buket</strong> pada{" "}
                <span className="font-semibold text-gray-900">{period.title}</span> secara permanen dari server dan Supabase storage.
              </p>
            </div>

            <div className="p-5 pt-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeletePeriod}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Ya, Hapus Semua</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
