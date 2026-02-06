export const FieldsTableSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="mb-4 space-y-3">
        <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded"></div>
        <div className="flex gap-4">
          <div className="h-10 w-48 bg-gray-200 dark:bg-slate-700 rounded"></div>
          <div className="h-10 w-48 bg-gray-200 dark:bg-slate-700 rounded"></div>
          <div className="h-10 w-48 bg-gray-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
      <div className="border border-gray-200 dark:border-slate-700 rounded-lg">
        <div className="h-12 bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700"></div>
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-16 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-surface-dark"></div>
        ))}
      </div>
    </div>
  );
};
