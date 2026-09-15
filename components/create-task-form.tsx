"use client";

import { useState } from "react";
import { createTaskAction } from "@/lib/actions/task";
import { Plus, CheckSquare, Calendar, User, AlignLeft, AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";

interface EmployeeOption {
  id: string;
  name: string;
  email: string;
}

interface CreateTaskFormProps {
  employees: EmployeeOption[];
}

export default function CreateTaskForm({ employees }: CreateTaskFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedToId, setAssignedToId] = useState(employees[0]?.id || "");
  const [dueDate, setDueDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!assignedToId) {
      setError("Pilih staf karyawan terlebih dahulu.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await createTaskAction({
        title,
        description: description || undefined,
        assignedToId,
        dueDate,
      });

      if (!res.success) {
        setError(res.error || "Gagal membuat tugas.");
        setIsLoading(false);
        return;
      }

      setSuccess("Tugas berhasil didelegasikan!");
      setTitle("");
      setDescription("");

      setTimeout(() => {
        setSuccess(null);
        setIsOpen(false);
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-700 hover:to-pink-600 active:scale-[0.99] text-white font-medium text-sm rounded-xl shadow-sm shadow-rose-200 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Tugas Baru</span>
        </button>
      ) : (
        <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-6 mb-6 transition-all">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <CheckSquare className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 leading-tight">Form Penugasan Harian Toko</h2>
                <p className="text-xs text-gray-500">Tugas operasional harian (seperti menyiram tanaman, menyapu, kebersihan, dll.)</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title="Tutup form"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200/80 flex items-center gap-2.5 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-2.5 text-emerald-700 text-xs">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Judul Tugas <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Menyiram tanaman & semprot daun anggrek"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Tugaskan Kepada <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <select
                    required
                    value={assignedToId}
                    onChange={(e) => setAssignedToId(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                  >
                    {employees.length === 0 ? (
                      <option value="">Belum ada karyawan terdaftar</option>
                    ) : (
                      employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.email})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Tanggal Pelaksanaan <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Catatan / Instruksi Khusus (Opsional)
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none text-gray-400">
                  <AlignLeft className="w-4 h-4" />
                </div>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Siram pot tanaman depan toko, sapu & pel lantai kasir, buang sampah sebelum shift berakhir..."
                  className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading || employees.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white text-xs font-semibold rounded-xl shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>Tugaskan Sekarang</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
