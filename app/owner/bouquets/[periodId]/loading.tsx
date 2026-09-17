export default function OwnerBouquetDetailLoading() {
  return (
    <div className="py-2 space-y-6 animate-pulse">
      {/* Top bar with back button & title */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gray-100 shrink-0" />
          <div className="space-y-1.5">
            <div className="h-6 w-56 bg-gray-200 rounded-md" />
            <div className="h-3.5 w-40 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-28 bg-rose-100 rounded-xl" />
          <div className="h-9 w-28 bg-gray-100 rounded-xl" />
        </div>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-100 shrink-0" />
            <div className="space-y-1">
              <div className="h-3 w-14 bg-gray-100 rounded" />
              <div className="h-5 w-20 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Photos Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="aspect-square bg-gray-200" />
            <div className="p-3 space-y-1.5">
              <div className="h-3.5 w-3/4 bg-gray-200 rounded" />
              <div className="h-3 w-1/2 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
