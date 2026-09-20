"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { compressImage, formatBytes, CompressionResult } from "@/lib/image/compress";
import { createBouquetPostAction } from "@/lib/actions/bouquet";
import { useBouquetFormStore } from "@/lib/stores/bouquet-form-store";
import {
  Camera,
  Upload,
  Calendar,
  MapPin,
  Flower2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  Tag,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { CLIENT_BOUQUET_PACKAGE_OPTIONS } from "@/lib/constants/bouquet";

interface BouquetSubmitFormProps {
  periodId?: string;
  startDate?: string;
  endDate?: string;
}

export default function BouquetSubmitForm({
  periodId,
  startDate,
  endDate,
}: BouquetSubmitFormProps = {}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    selectedFile,
    previewUrl,
    compressionMetrics,
    isCompressing,
    installDate,
    locationName,
    flowerCount,
    packageType,
    isSubmitting,
    error,
    success,
    setFileAndPreview,
    setIsCompressing,
    setInstallDate,
    setLocationName,
    setFlowerCount,
    setPackageType,
    setIsSubmitting,
    setError,
    setSuccess,
    resetForm: storeResetForm,
  } = useBouquetFormStore();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsCompressing(true);

    try {
      // Execute client-side compression
      const result = await compressImage(file);
      const url = URL.createObjectURL(result.file);
      setFileAndPreview(result.file, result, url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memproses gambar.";
      setError(msg);
      setFileAndPreview(null, null, null);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRetake = () => {
    setFileAndPreview(null, null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Silakan ambil atau pilih foto buket terlebih dahulu.");
      return;
    }

    const countNum = parseInt(flowerCount, 10);
    if (isNaN(countNum) || countNum <= 0) {
      setError("Jumlah bunga harus berupa angka lebih dari 0.");
      return;
    }

    if (locationName.trim().length < 3) {
      setError("Nama lokasi / venue minimal 3 karakter.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("install_date", installDate);
      formData.append("location_name", locationName.trim());
      formData.append("flower_count", countNum.toString());
      formData.append("package_type", packageType);
      if (periodId) {
        formData.append("period_id", periodId);
      }

      const res = await createBouquetPostAction(formData);

      if (!res.success) {
        setError(res.error || "Gagal mengirim laporan buket.");
      } else {
        setSuccess(true);
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan koneksi server.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    storeResetForm();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm text-center">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Laporan Berhasil Terkirim!</h2>
        <p className="text-xs text-gray-500 mt-1.5 max-w-xs mx-auto">
          Foto bukti pemasangan di <strong>{locationName}</strong> telah tersimpan di sistem.
        </p>

        <div className="mt-6 space-y-2.5">
          <button
            onClick={resetForm}
            className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-medium text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4" />
            <span>Lapor Pemasangan Lain</span>
          </button>

          <Link
            href="/employee/history"
            prefetch={true}
            className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium text-sm rounded-xl border border-gray-200 transition-all flex items-center justify-center gap-2"
          >
            <span>Lihat Riwayat Saya</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-5 sm:p-7 space-y-4">
      {/* Back Link */}
      <div>
        <Link
          href="/employee/submit"
          prefetch={true}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali ke Kartu Buket</span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
          <Flower2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 leading-tight">Unggah Foto Buket</h1>
          <p className="text-xs text-gray-500">
            {startDate && endDate
              ? `Periode: ${startDate} s/d ${endDate}`
              : "Ambil foto bukti pemasangan dan lengkapi detail lokasi."}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Hidden Camera Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Photo Box Area */}
        {!previewUrl ? (
          <button
            type="button"
            disabled={isCompressing}
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-52 sm:h-60 rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/40 hover:bg-rose-50/80 active:scale-[0.99] transition-all flex flex-col items-center justify-center p-4 text-center group cursor-pointer"
          >
            {isCompressing ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
                <span className="text-xs font-semibold text-rose-700">Mengompresi foto otomatis...</span>
                <span className="text-[10px] text-gray-400">Menyesuaikan resolusi maks 1280px</span>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-xs">
                  <Camera className="w-7 h-7" />
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  Ambil Foto / Pilih Gambar
                </span>
                <span className="text-[11px] text-gray-400 mt-1">
                  Kamera ponsel otomatis dikompresi ke WebP ~250KB
                </span>
              </>
            )}
          </button>
        ) : (
          <div className="space-y-2">
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-black aspect-4/3 flex items-center justify-center">
              {/* Preview Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Preview Pemasangan Buket"
                className="w-full h-full object-cover"
              />

              <button
                type="button"
                onClick={handleRetake}
                className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/70 hover:bg-black/85 text-white text-xs font-medium rounded-lg backdrop-blur-xs flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Foto Ulang</span>
              </button>
            </div>

            {/* Compression Metrics Badge */}
            {compressionMetrics && (
              <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>
                    <strong>{formatBytes(compressionMetrics.compressedSize)}</strong>{" "}
                    <span className="text-gray-500 line-through text-[11px]">
                      {formatBytes(compressionMetrics.originalSize)}
                    </span>
                  </span>
                </div>
                <span className="font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md text-[11px]">
                  Hemat {compressionMetrics.reductionPercent}%
                </span>
              </div>
            )}
          </div>
        )}

        {/* Form Field: Date */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Tanggal Pemasangan
          </label>
          <div className="relative rounded-xl shadow-2xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Calendar className="w-4 h-4" />
            </div>
            <input
              type="date"
              required
              value={installDate}
              onChange={(e) => setInstallDate(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Form Field: Location */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Lokasi / Venue Pemasangan
          </label>
          <div className="relative rounded-xl shadow-2xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Contoh: Ballroom Hotel Mulia, Meja Utama"
              className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Form Field: Package Type */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Tipe Buket
          </label>
          <div className="relative rounded-xl shadow-2xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Tag className="w-4 h-4" />
            </div>
            <select
              required
              value={packageType}
              onChange={(e) => setPackageType(e.target.value)}
              className="block w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all cursor-pointer appearance-none"
            >
              {CLIENT_BOUQUET_PACKAGE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Form Field: Flower Count */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Jumlah Bunga (pcs / tangkai)
          </label>
          <div className="relative rounded-xl shadow-2xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Flower2 className="w-4 h-4" />
            </div>
            <input
              type="number"
              required
              min="1"
              value={flowerCount}
              onChange={(e) => setFlowerCount(e.target.value)}
              placeholder="Contoh: 15"
              className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || isCompressing}
            className="w-full py-3 px-4 bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-700 hover:to-pink-600 active:scale-[0.99] text-white font-medium text-sm rounded-xl shadow-md shadow-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mengunggah Laporan...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Kirim Bukti Pemasangan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
