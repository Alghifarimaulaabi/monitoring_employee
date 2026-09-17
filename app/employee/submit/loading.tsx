export default function EmployeeSubmitLoading() {
  return (
    <div className="py-2 space-y-5 animate-pulse">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
            <div className="w-5 h-5 bg-rose-200 rounded-md" />
          </div>
          <div className="space-y-1">
            <div className="h-5 w-32 bg-gray-200 rounded-md" />
            <div className="h-3 w-48 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="h-10 w-44 bg-rose-500/20 rounded-xl" />
      </div>

      {/* Grid of Period Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 flex flex-col justify-between space-y-4"
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

            <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
              <div className="h-8 bg-gray-100 rounded-xl" />
              <div className="h-8 bg-rose-100 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
