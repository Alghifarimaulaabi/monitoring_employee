export default function UploadBouquetLoading() {
  return (
    <div className="py-2 space-y-4 animate-pulse">
      {/* Header bar */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gray-100 shrink-0" />
          <div className="space-y-1">
            <div className="h-5 w-44 bg-gray-200 rounded-md" />
            <div className="h-3 w-36 bg-gray-100 rounded" />
          </div>
        </div>
      </div>

      {/* Form Card Skeleton */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-5">
        {/* Photo Upload Zone */}
        <div className="h-48 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-gray-200" />
          <div className="h-3 w-36 bg-gray-200 rounded" />
        </div>

        {/* Input Fields */}
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <div className="h-3 w-24 bg-gray-100 rounded" />
            <div className="h-11 bg-gray-50 border border-gray-200 rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-28 bg-gray-100 rounded" />
            <div className="h-11 bg-gray-50 border border-gray-200 rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-24 bg-gray-100 rounded" />
            <div className="h-11 bg-gray-50 border border-gray-200 rounded-xl" />
          </div>
        </div>

        {/* Submit Button Skeleton */}
        <div className="h-12 bg-rose-500/20 rounded-xl mt-4" />
      </div>
    </div>
  );
}
