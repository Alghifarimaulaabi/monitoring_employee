export default function EmployeeTasksLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Welcome Banner Skeleton */}
      <div className="bg-gradient-to-br from-rose-400/30 to-pink-400/30 rounded-3xl p-5 space-y-2.5">
        <div className="h-3.5 w-32 bg-rose-200/50 rounded" />
        <div className="h-6 w-48 bg-rose-200/50 rounded-md" />
        <div className="h-3 w-full bg-rose-100/50 rounded" />
      </div>

      {/* Progress / Filter Tabs Skeleton */}
      <div className="bg-white rounded-3xl p-4 border border-gray-200/80 shadow-xs space-y-2">
        <div className="flex justify-between items-center">
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="h-3 w-16 bg-gray-200 rounded" />
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full" />
      </div>

      {/* List items Skeleton */}
      <div className="space-y-2.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 rounded-2xl border border-gray-200/70 bg-white shadow-xs flex items-start gap-3.5"
          >
            <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-center">
                <div className="h-4 w-40 bg-gray-200 rounded" />
                <div className="h-3.5 w-14 bg-gray-100 rounded-full" />
              </div>
              <div className="h-3 w-3/4 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
