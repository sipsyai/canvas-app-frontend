export const ObjectsTableSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="mb-4 space-y-3">
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="flex gap-4">
          <div className="h-10 w-48 bg-gray-200 rounded"></div>
          <div className="h-10 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="border border-gray-200 rounded-lg">
        <div className="h-12 bg-gray-100 border-b border-gray-200"></div>
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-16 border-b border-gray-200 bg-white"></div>
        ))}
      </div>
    </div>
  );
};
