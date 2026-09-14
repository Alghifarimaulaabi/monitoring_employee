import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { CheckSquare, Clock } from "lucide-react";
import Link from "next/link";

export default async function TasksPage() {
  const headerList = await headers();
  const session = await auth.api.getSession({
    headers: headerList,
  });

  const today = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-4">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-1.5 text-xs text-rose-100 font-medium mb-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{today}</span>
        </div>
        <h1 className="text-xl font-bold">Halo, {session?.user?.name}!</h1>
        <p className="text-xs text-rose-100 mt-1">
          Periksa dan selesaikan tugas operasional lapangan Anda hari ini.
        </p>
      </div>

      {/* Quick Status / Milestone placeholder */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs text-center py-10">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl mx-auto flex items-center justify-center mb-3">
          <CheckSquare className="w-6 h-6" />
        </div>
        <h2 className="text-base font-semibold text-gray-900">Belum Ada Tugas Aktif</h2>
        <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
          Tugas harian yang diberikan oleh Owner akan muncul di sini (siap diimplementasikan pada Phase 3).
        </p>

        <div className="mt-6">
          <Link
            href="/employee/submit"
            className="inline-flex items-center justify-center px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            🌸 Lapor Pemasangan Buket
          </Link>
        </div>
      </div>
    </div>
  );
}
