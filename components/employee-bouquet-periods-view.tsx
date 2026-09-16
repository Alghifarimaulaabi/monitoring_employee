"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Plus,
  Camera,
  Flower2,
  Sparkles,
  Eye,
} from "lucide-react";
import { SerializedBouquetPeriod } from "@/lib/actions/bouquet";
import { useBouquetStore } from "@/lib/stores/bouquet-store";
import { useUIStore } from "@/lib/stores/ui-store";
import EmployeePeriodModal from "@/components/employee-period-modal";

interface EmployeeBouquetPeriodsViewProps {
  initialPeriods: SerializedBouquetPeriod[];
}

export default function EmployeeBouquetPeriodsView({
  initialPeriods,
}: EmployeeBouquetPeriodsViewProps) {
  const {
    periods: storePeriods,
    isPeriodModalOpen,
    setIsPeriodModalOpen,
    fetchPeriods,
  } = useBouquetStore();

  const { toastMessage, showToast } = useUIStore();

  // Sync initial server props to store
  useEffect(() => {
    useBouquetStore.setState({ periods: initialPeriods });
  }, [initialPeriods]);

  const periods = storePeriods.length > 0 ? storePeriods : initialPeriods;

  const handlePeriodCreated = async () => {
    await fetchPeriods();
    showToast("success", "Kartu buket baru berhasil dibuat!");
  };

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in ${
            toastMessage.type === "success"
              ? "bg-gray-900 text-white"
              : "bg-rose-600 text-white"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* EMPTY STATE BERSIH JIKA BELUM ADA BUKET BULAN INI */}
      {periods.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 sm:p-16 border border-gray-200/80 shadow-xs text-center max-w-md mx-auto my-12 animate-in fade-in">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-xs">
            <Flower2 className="w-8 h-8" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
            Belum ada buket yang ditambahkan bulan ini
          </h2>
          <p className="text-xs text-gray-500 mt-1.5 max-w-xs mx-auto">
            Mulai dokumentasi pemasangan buket dengan menentukan tanggal periode buket.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setIsPeriodModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-700 hover:to-pink-600 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambahkan Bouquet</span>
            </button>
          </div>

          <EmployeePeriodModal
            isOpen={isPeriodModalOpen}
            onClose={() => setIsPeriodModalOpen(false)}
            onSuccess={handlePeriodCreated}
          />
        </div>
      ) : (
        <>
          {/* Header & Action Button */}
          <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-900 leading-tight">
                  Foto Buket Lapangan
                </h1>
                <p className="text-xs text-gray-500">
                  Kelola kartu periode buket dan lihat detail bukti foto.
                </p>
              </div>
            </div>

            {/* Tombol: Tambahkan Buket Bulan Ini */}
            <button
              type="button"
              onClick={() => setIsPeriodModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-700 hover:to-pink-600 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambahkan Buket Bulan Ini</span>
            </button>
          </div>

          {/* List of Period Cards (1 Kolom Mobile, 2 Kolom Tablet, 3 Kolom Desktop; Baris Bebas) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {periods.map((period) => (
              <div
                key={period.id}
                className="bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:border-rose-300 hover:shadow-sm transition-all p-4 sm:p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                      {period.totalPosts} Foto
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-snug">
                      {period.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Rentang: {period.formattedRange}
                    </p>
                  </div>
                </div>

                {/* Tombol Aksi: Lihat Detail & Tambahkan Foto */}
                <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
                  <Link
                    href={`/employee/submit/${period.id}`}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-2xs transition-colors"
                    title="Lihat keseluruhan buket pada kartu ini"
                  >
                    <Eye className="w-3.5 h-3.5 text-rose-400" />
                    <span>Lihat Detail</span>
                  </Link>

                  <Link
                    href={`/employee/submit/upload?periodId=${period.id}&startDate=${period.startDate}&endDate=${period.endDate}`}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                    title="Tambahkan foto pada periode ini"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Tambah Foto</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Popup Modal Input Tanggal */}
          <EmployeePeriodModal
            isOpen={isPeriodModalOpen}
            onClose={() => setIsPeriodModalOpen(false)}
            onSuccess={handlePeriodCreated}
          />
        </>
      )}
    </div>
  );
}
