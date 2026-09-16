"use client";

import React, { useState } from "react";
import { Calendar, Plus, X, Loader2 } from "lucide-react";
import { createBouquetPeriodAction } from "@/lib/actions/bouquet";

interface EmployeePeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPeriodId?: string) => void;
}

export default function EmployeePeriodModal({
  isOpen,
  onClose,
  onSuccess,
}: EmployeePeriodModalProps) {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();

  const defaultStart = `${y}-${m}-01`;
  const defaultEnd = `${y}-${m}-${String(lastDay).padStart(2, "0")}`;

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!startDate || !endDate) {
      setError("Tanggal mulai dan tanggal selesai wajib diisi.");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError("Tanggal mulai tidak boleh melebihi tanggal selesai.");
      return;
    }

    setLoading(true);
    try {
      const res = await createBouquetPeriodAction({
        startDate,
        endDate,
      });

      if (!res.success) {
        setError(res.error || "Gagal membuat kartu periode buket.");
        setLoading(false);
        return;
      }

      setLoading(false);
      onSuccess(res.periodId);
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan koneksi saat membuat periode."
      );
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 leading-tight">
                Tambahkan Buket Bulan Ini
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Pilih rentang tanggal pelaksanaan buket
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {/* Input Mulai Pada Tanggal Berapa */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Mulai Pada Tanggal Berapa:
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={loading}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Input Selesai Pada Tanggal Berapa */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Selesai Pada Tanggal Berapa:
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={loading}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-rose-50/60 border border-rose-100 rounded-xl text-[11px] text-rose-800 leading-relaxed">
            💡 Kartu buket baru akan dibuat dengan judul tanggal yang Anda pilih. Di dalam kartu tersebut Anda dapat menambahkan foto-foto bukti pemasangan.
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Membuat Kartu...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Buat</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
