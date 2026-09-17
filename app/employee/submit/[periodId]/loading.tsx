export default function EmployeeBouquetDetailLoading() {
  return (
    <div className="py-2 space-y-5 animate-pulse">
      {/* Header bar with back button */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gray-100 shrink-0" />
          <div className="space-y-1">
            <div className="h-5 w-44 bg-gray-200 rounded-md" />
            <div className="h-3 w-32 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="h-9 w-28 bg-rose-500/20 rounded-xl" />
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gray-100 shrink-0" />
            <div className="space-y-1">
              <div className="h-3 w-14 bg-gray-100 rounded" />
              <div className="h-4 w-16 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-2 gap-3.5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
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
