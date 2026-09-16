"use client";

import React, { useState, useTransition } from "react";
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
import {
  SerializedBouquetPeriod,
  getBouquetPeriodsAction,
} from "@/lib/actions/bouquet";
import EmployeePeriodModal from "@/components/employee-period-modal";

interface EmployeeBouquetPeriodsViewProps {
  initialPeriods: SerializedBouquetPeriod[];
}

export default function EmployeeBouquetPeriodsView({
  initialPeriods,
}: EmployeeBouquetPeriodsViewProps) {
  const [periods, setPeriods] = useState<SerializedBouquetPeriod[]>(initialPeriods);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handlePeriodCreated = async () => {
    startTransition(async () => {
      const res = await getBouquetPeriodsAction();
      if (res.success) {
        setPeriods(res.periods);
        showToast("Kartu buket baru berhasil dibuat!");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          <span>{toast}</span>
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
          onClick={() => setIsModalOpen(true)}
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
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambahkan Buket Bulan Ini</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {periods.map((period) => (
            <div
              key={period.id}
              className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-4 sm:p-5 hover:border-rose-200 transition-all space-y-3.5"
            >
              {/* Card Title & Date Info */}
              <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-snug">
                      {period.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>Rentang: <strong>{period.formattedRange}</strong></span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-full">
                    {period.totalPosts} Foto
                  </span>
                </div>
              </div>

              {/* Metrics inside card */}
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
                    <span className="text-[10px] text-gray-400 block">Status Dokumentasi</span>
                    <span className="font-bold text-gray-800">{period.totalPosts} Buket</span>
                  </div>
                </div>
              </div>

              {/* Preview thumbnails of photos in this card */}
              {period.posts.length > 0 ? (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Foto yang sudah diunggah ({period.posts.length}):
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {period.posts.slice(0, 4).map((post) => (
                      <div
                        key={post.id}
                        className="relative aspect-4/3 rounded-xl overflow-hidden bg-gray-100 border border-gray-200"
                      >
                        {post.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={post.imageUrl}
                            alt={post.locationName}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
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
                <div className="p-3 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-gray-400" />
                  <span>Belum ada foto yang diunggah untuk periode ini.</span>
                </div>
              )}

              {/* Action: Tambahkan Foto */}
              <div className="pt-1">
                <Link
                  href={`/employee/submit/upload?periodId=${period.id}&startDate=${period.startDate}&endDate=${period.endDate}`}
                  className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-rose-600" />
                  <span>Tambahkan Foto</span>
                  <ChevronRight className="w-3.5 h-3.5 text-rose-500 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Popup Modal Input Tanggal */}
      <EmployeePeriodModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handlePeriodCreated}
      />
    </div>
  );
}
