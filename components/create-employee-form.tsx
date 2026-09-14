"use client";

import { useState } from "react";
import { createUserAction } from "@/lib/actions/user";
import { UserPlus, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateEmployeeForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"EMPLOYEE" | "OWNER">("EMPLOYEE");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const res = await createUserAction({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });

      if (!res.success) {
        setError(res.error || "Gagal menambahkan akun karyawan.");
      } else {
        setSuccessMsg(`Akun untuk "${name}" berhasil dibuat dan langsung aktif!`);
        setName("");
        setEmail("");
        setPassword("");
        setRole("EMPLOYEE");
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat membuat akun.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 sm:p-7">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
          <UserPlus className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">Tambah Akun Karyawan</h2>
          <p className="text-xs text-gray-500">
            Daftarkan staf operasional lapangan secara manual. Akun langsung aktif.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-800 text-xs sm:text-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Nama Lengkap
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Siti Rahmawati"
              className="block w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Email Karyawan
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="siti@florist.com"
              className="block w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Kata Sandi Sementara
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="block w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Peran (Role)
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "EMPLOYEE" | "OWNER")}
              className="block w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
            >
              <option value="EMPLOYEE">Karyawan (EMPLOYEE)</option>
              <option value="OWNER">Pemilik / Manajer (OWNER)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white text-sm font-medium rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Daftarkan Akun</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
