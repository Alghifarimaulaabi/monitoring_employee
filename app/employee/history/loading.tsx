export default function EmployeeHistoryLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header card */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
            <div className="w-5 h-5 bg-rose-200 rounded-md" />
          </div>
          <div className="space-y-1">
            <div className="h-4 w-36 bg-gray-200 rounded-md" />
            <div className="h-3 w-48 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="h-6 w-20 bg-rose-100 rounded-full" />
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white p-3 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gray-100 shrink-0" />
            <div className="space-y-1">
              <div className="h-2.5 w-16 bg-gray-100 rounded" />
              <div className="h-4 w-14 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* History cards grid (2 cols) */}
      <div className="grid grid-cols-2 gap-3.5">
        {[1, 2, 3, 4].map((i) => (
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
