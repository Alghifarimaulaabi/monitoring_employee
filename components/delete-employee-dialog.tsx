"use client";

import React, { useState } from "react";
import { UserX, AlertTriangle, CheckCircle2, Loader2, X } from "lucide-react";
import { deleteEmployeeAction } from "@/lib/actions/user";

export interface TargetEmployee {
  id: string;
  name: string;
  email: string;
  pendingTasksCount?: number;
  bouquetPostsCount?: number;
}

interface DeleteEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employee: TargetEmployee | null;
  onSuccess: (message: string) => void;
}

export default function DeleteEmployeeDialog({
  isOpen,
  onClose,
  employee,
  onSuccess,
}: DeleteEmployeeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (loading || !employee) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await deleteEmployeeAction({
        employeeId: employee.id,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Gagal menghapus akun karyawan.");
        setLoading(false);
        return;
      }

      setLoading(false);
      onSuccess(res.message || `Akun "${employee.name}" berhasil dinonaktifkan.`);
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Terjadi kesalahan koneksi server.";
      setErrorMessage(msg);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (loading) return;
    setErrorMessage(null);
    onClose();
  };

  // Close dialog on Escape key press
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        handleCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading]);

  if (!isOpen || !employee) return null;

  const pendingCount = employee.pendingTasksCount ?? 0;
  const bouquetCount = employee.bouquetPostsCount ?? 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={handleCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-employee-title"
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 pb-4 border-b border-gray-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <h3 id="delete-employee-title" className="text-base font-bold text-gray-900 leading-tight">
                Hapus Akun Karyawan?
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">{employee.email}</p>
            </div>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={handleCancel}
            aria-label="Tutup dialog"
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3.5 text-xs sm:text-sm text-gray-600">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <p className="leading-relaxed text-gray-700">
            Akun <strong className="text-gray-900 font-semibold">{employee.name}</strong>{" "}
            akan dinonaktifkan dan tidak dapat digunakan untuk login lagi.
          </p>

          <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Data histori karyawan tetap dipertahankan:</span>
            </div>
            <p className="text-[11px] text-emerald-700 pl-5.5 leading-snug">
              Seluruh riwayat laporan pemasangan buket ({bouquetCount} foto) dan rekap penugasan tetap tersimpan aman di sistem.
            </p>
          </div>

          {/* Notice if employee still has active pending tasks */}
          {pendingCount > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-amber-800 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Perhatian: Tugas Aktif Masih Berjalan</span>
              </div>
              <p className="text-[11px] text-amber-700 pl-5.5 leading-snug">
                Karyawan ini masih memiliki <strong>{pendingCount} tugas aktif (Pending)</strong>. Tugas ini akan tetap tersimpan dalam riwayat penugasan.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={loading}
            onClick={handleCancel}
            className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleConfirm}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menghapus Akun...</span>
              </>
            ) : (
              <span>Hapus Akun</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
