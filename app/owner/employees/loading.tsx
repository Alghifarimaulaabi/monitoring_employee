export default function EmployeesLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-gray-200 rounded-xl" />
        <div className="h-4 w-96 max-w-full bg-gray-100 rounded-lg" />
      </div>

      {/* Metric summary badges (3 cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-100 shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3 w-16 bg-gray-100 rounded" />
              <div className="h-6 w-10 bg-gray-200 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Form: Create Employee Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="space-y-1">
          <div className="h-5 w-44 bg-gray-200 rounded-md" />
          <div className="h-3.5 w-72 bg-gray-100 rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="h-11 bg-gray-100 rounded-xl" />
          <div className="h-11 bg-gray-100 rounded-xl" />
          <div className="h-11 bg-gray-100 rounded-xl" />
        </div>
      </div>

      {/* Table: Registered Staff Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-4 w-40 bg-gray-200 rounded" />
            <div className="h-3 w-56 bg-gray-100 rounded" />
          </div>
          <div className="h-6 w-24 bg-gray-100 rounded-full" />
        </div>

        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-9 h-9 rounded-xl bg-gray-100 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-36 bg-gray-200 rounded" />
                  <div className="h-3 w-48 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="h-6 w-20 bg-gray-100 rounded-full" />
              <div className="h-4 w-28 bg-gray-100 rounded hidden sm:block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
