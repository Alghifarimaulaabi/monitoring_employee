import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BouquetHistoryCard from "@/components/bouquet-history-card";
import { History, Camera, Flower2 } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Riwayat Pemasangan - B-Tracker",
};

export default async function HistoryPage() {
  const session = await getServerSession();

  if (!session || !session.user) {
    redirect("/login");
  }

  const posts = await prisma.bouquetPost.findMany({
    where: {
      userId: session.user.id,
      isArchived: false,
    },
    orderBy: {
      installDate: "desc",
    },
  });

  const totalFlowers = posts.reduce((sum, p) => sum + p.flowerCount, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">Riwayat Pemasangan</h1>
            <p className="text-xs text-gray-500">Bukti yang telah Anda laporkan.</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
            {posts.length} Laporan
          </span>
        </div>
      </div>

      {/* Summary Chips */}
      {posts.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-3 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <Flower2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-gray-400 font-medium uppercase">Total Bunga</div>
              <div className="text-sm font-bold text-gray-900">{totalFlowers} pcs</div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-gray-400 font-medium uppercase">Total Laporan</div>
              <div className="text-sm font-bold text-gray-900">{posts.length} Buket</div>
            </div>
          </div>
        </div>
      )}

      {/* Posts List / Empty State */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-xs text-center py-12">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl mx-auto flex items-center justify-center mb-3">
            <Camera className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-gray-900">Belum Ada Riwayat</h2>
          <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
            Anda belum pernah mengirim laporan pemasangan buket.
          </p>
          <div className="mt-6">
            <Link
              href="/employee/submit"
              prefetch={true}
              className="inline-flex items-center justify-center px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors gap-2"
            >
              <Camera className="w-4 h-4" />
              <span>Lapor Buket Sekarang</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5">
          {posts.map((post) => (
            <BouquetHistoryCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
