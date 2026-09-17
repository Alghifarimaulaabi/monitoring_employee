export default function OwnerBouquetsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header & Month/Year Selector Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
        <div className="space-y-1.5">
          <div className="h-6 w-56 bg-gray-200 rounded-lg" />
          <div className="h-3.5 w-80 max-w-full bg-gray-100 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-32 bg-gray-100 rounded-xl" />
          <div className="h-10 w-24 bg-gray-100 rounded-xl" />
        </div>
      </div>

      {/* Tabs navigation skeleton */}
      <div className="flex gap-2 border-b border-gray-200 pb-3">
        <div className="h-10 w-44 bg-rose-100/60 rounded-xl" />
        <div className="h-10 w-40 bg-gray-100 rounded-xl" />
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-100 shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3 w-16 bg-gray-100 rounded" />
              <div className="h-6 w-12 bg-gray-200 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Period Cards Grid (3 columns on desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-gray-100" />
                <div className="h-5 w-16 bg-gray-100 rounded-md" />
              </div>
              <div className="space-y-1.5">
                <div className="h-5 w-3/4 bg-gray-200 rounded-md" />
                <div className="h-3 w-1/2 bg-gray-100 rounded" />
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="h-8 bg-gray-100 rounded-xl" />
                <div className="h-8 bg-gray-100 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-8 bg-gray-100 rounded-xl" />
                <div className="h-8 bg-gray-100 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
