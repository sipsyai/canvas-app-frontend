/**
 * RecordsTableSkeleton Component
 *
 * Loading skeleton for records table
 */

export const RecordsTableSkeleton = () => {
  return (
    <div className="p-6 animate-pulse">
      {/* Header */}
      <div className="mb-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
        <div className="h-4 w-64 bg-gray-200 dark:bg-slate-700 rounded" />
      </div>

      {/* Toolbar */}
      <div className="mb-4 p-4 bg-white dark:bg-surface-dark border border-gray-200 dark:border-slate-700 rounded-lg">
        <div className="flex items-center justify-between gap-4">
          <div className="h-10 w-80 bg-gray-200 dark:bg-slate-700 rounded" />
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-gray-200 dark:bg-slate-700 rounded" />
            <div className="h-10 w-32 bg-gray-200 dark:bg-slate-700 rounded" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 dark:bg-surface-dark-alt border-b border-gray-200 dark:border-slate-700 p-4">
          <div className="flex gap-4">
            <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded" />
            <div className="h-4 w-48 bg-gray-200 dark:bg-slate-700 rounded" />
            <div className="h-4 w-40 bg-gray-200 dark:bg-slate-700 rounded" />
            <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded" />
            <div className="h-4 w-20 bg-gray-200 dark:bg-slate-700 rounded" />
          </div>
        </div>

        {/* Table Rows */}
        {[...Array(8)].map((_, idx) => (
          <div
            key={idx}
            className="border-b border-gray-200 dark:border-slate-700 p-4 last:border-b-0"
          >
            <div className="flex gap-4">
              <div className="h-6 w-32 bg-gray-200 dark:bg-slate-700 rounded" />
              <div className="h-6 w-48 bg-gray-200 dark:bg-slate-700 rounded" />
              <div className="h-6 w-40 bg-gray-200 dark:bg-slate-700 rounded" />
              <div className="h-6 w-24 bg-gray-200 dark:bg-slate-700 rounded" />
              <div className="h-6 w-20 bg-gray-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="h-4 w-40 bg-gray-200 dark:bg-slate-700 rounded" />
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-gray-200 dark:bg-slate-700 rounded" />
          <div className="h-10 w-16 bg-gray-200 dark:bg-slate-700 rounded" />
          <div className="h-10 w-24 bg-gray-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    </div>
  );
};
