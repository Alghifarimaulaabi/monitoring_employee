"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Plus,
  Camera,
  Flower2,
  MapPin,
  Sparkles,
  ChevronRight,
  Clock,
  Images,
  AlertCircle,
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
    <div className="space-y-4">
      {/* Toast */}
      {toastMessage && (
        <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in ${
          toastMessage.type === "success"
            ? "bg-gray-900 text-white"
            : "bg-rose-600 text-white"
        }`}>
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header & Primary Action */}
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
              Kelola kartu periode buket dan unggah bukti foto.
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

      {/* List of Period Cards */}
      {periods.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-xs text-center py-12">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-xs">
            <Calendar className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-gray-900">Belum Ada Kartu Buket</h2>
          <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
            Klik tombol di bawah ini untuk membuat kartu buket dengan menentukan tanggal mulai dan selesai.
          </p>
          <div className="mt-5">
            <button
              onClick={() => setIsPeriodModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambahkan Buket Bulan Ini</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {periods.map((period) => (
            <div
              key={period.id}
              className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 sm:p-5 hover:border-rose-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-rose-600 shrink-0" />
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-snug">
                    {period.title}
                  </h3>
                </div>
                <p className="text-xs text-gray-500 pl-6">
                  {period.totalPosts} foto terunggah • Rentang: {period.formattedRange}
                </p>
              </div>

              {/* Action: Tambahkan Foto pada bulan itu */}
              <Link
                href={`/employee/submit/upload?periodId=${period.id}&startDate=${period.startDate}&endDate=${period.endDate}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all shrink-0 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Tambahkan Foto</span>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Popup Modal Input Tanggal */}
      <EmployeePeriodModal
        isOpen={isPeriodModalOpen}
        onClose={() => setIsPeriodModalOpen(false)}
        onSuccess={handlePeriodCreated}
      />
    </div>
  );
}
