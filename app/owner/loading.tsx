export default function OwnerLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200 rounded-xl" />
          <div className="h-4 w-96 max-w-full bg-gray-100 rounded-lg" />
        </div>
        <div className="h-10 w-36 bg-gray-200 rounded-xl" />
      </div>

      {/* Metrics Summary Skeleton (4 cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-200 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-3 w-16 bg-gray-200 rounded" />
              <div className="h-6 w-12 bg-gray-200 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar Skeleton */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="h-10 w-full sm:w-72 bg-gray-100 rounded-xl" />
        <div className="flex gap-2">
          <div className="h-10 w-28 bg-gray-100 rounded-xl" />
          <div className="h-10 w-28 bg-gray-100 rounded-xl" />
        </div>
      </div>

      {/* Main Content Area Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 space-y-4">
        <div className="h-5 w-40 bg-gray-200 rounded-md" />
        <div className="divide-y divide-gray-100 space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="pt-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-9 h-9 rounded-xl bg-gray-100 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-48 bg-gray-200 rounded" />
                  <div className="h-3 w-32 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="h-8 w-20 bg-gray-100 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
