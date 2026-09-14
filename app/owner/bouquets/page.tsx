import { Flower2 } from "lucide-react";

export default function OwnerBouquetsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Galeri Buket & Laporan</h1>
        <p className="text-sm text-gray-500 mt-1">
          Inspeksi foto pemasangan dari staf, filter bulanan, export PDF 3 item per lembar, dan purge foto.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-12 border border-gray-200/80 shadow-xs text-center">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl mx-auto flex items-center justify-center mb-3">
          <Flower2 className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Galeri Buket & PDF Export</h2>
        <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
          Fitur filter galeri buket, streaming PDF report, dan bulk cleanup akan diimplementasikan pada <strong>Phase 4 & Phase 5</strong>.
        </p>
      </div>
    </div>
  );
}
