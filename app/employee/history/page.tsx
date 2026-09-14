import { History } from "lucide-react";

export default function HistoryPage() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs text-center py-12">
      <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl mx-auto flex items-center justify-center mb-3">
        <History className="w-6 h-6" />
      </div>
      <h1 className="text-lg font-bold text-gray-900">Riwayat Pemasangan</h1>
      <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
        Riwayat pemasangan buket pribadi Anda akan ditampilkan di sini (Phase 2).
      </p>
    </div>
  );
}
