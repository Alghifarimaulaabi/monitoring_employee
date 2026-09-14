import { CheckSquare } from "lucide-react";

export default function OwnerTasksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manajemen Penugasan Harian</h1>
        <p className="text-sm text-gray-500 mt-1">
          Buat dan delegasikan checklist tugas harian kepada staf operasional lapangan.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-12 border border-gray-200/80 shadow-xs text-center">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl mx-auto flex items-center justify-center mb-3">
          <CheckSquare className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Board Penugasan Harian</h2>
        <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
          Fitur pembuatan tugas harian dan pemantauan status checklist akan diimplementasikan pada <strong>Phase 3</strong>.
        </p>
      </div>
    </div>
  );
}
