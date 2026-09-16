"use client";

import React, { useState } from "react";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";
import { deleteMonthlyPhotosAction } from "@/lib/actions/bouquet";

interface PurgePhotosDialogProps {
  isOpen: boolean;
  onClose: () => void;
  month: number;
  year: number;
  monthName: string;
  activePhotoCount: number;
  onPurgeSuccess: () => void;
}

export default function PurgePhotosDialog({
  isOpen,
  onClose,
  month,
  year,
  monthName,
  activePhotoCount,
  onPurgeSuccess,
}: PurgePhotosDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isConfirmed = confirmText.trim() === "HAPUS";

  const handleConfirmPurge = async () => {
    if (!isConfirmed || loading) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await deleteMonthlyPhotosAction({
        month,
        year,
        confirmToken: confirmText.trim(),
      });

      if (!res.success) {
        setErrorMessage(res.error || "Gagal membersihkan foto penyimpanan.");
        setLoading(false);
        return;
      }

      setConfirmText("");
      setLoading(false);
      onPurgeSuccess();
      onClose();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga."
      );
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (loading) return;
    setConfirmText("");
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">
                Pembersihan Foto Penyimpanan Cloud
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Periode: <strong className="text-gray-800">{monthName} {year}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-4 text-xs text-amber-900 leading-relaxed">
            <p className="font-semibold mb-1">
              ⚠️ Perhatian: Tindakan ini permanen & tidak dapat dibatalkan!
            </p>
            <p>
              Tindakan ini akan menghapus permanen seluruh file gambar foto (<strong>{activePhotoCount} foto aktif</strong>) dari storage Supabase / server lokal untuk periode <strong>{monthName} {year}</strong> guna menjaga kuota penyimpanan tetap hemat.
            </p>
            <p className="mt-2 text-amber-800 font-medium">
              ℹ️ Catatan Penting: Data riwayat pemasangan (tanggal, nama lokasi, jumlah bunga pcs, dan nama staf) <strong>akan tetap tersimpan</strong> dalam sistem dan laporan.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {errorMessage}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700">
              Ketik kata <span className="font-mono text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">HAPUS</span> untuk konfirmasi:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Ketik HAPUS di sini..."
              disabled={loading}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-sm font-mono tracking-wider outline-none transition-all disabled:bg-gray-50"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirmPurge}
            disabled={!isConfirmed || loading}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Membersihkan...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Hapus Permanen Foto</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
