export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

export function ProductCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[3/4] w-full rounded-[1.7rem]" />
      <Skeleton className="mt-3 h-4 w-16 rounded-full" />
      <Skeleton className="mt-2 h-4 w-full rounded" />
      <Skeleton className="mt-2 h-4 w-20 rounded" />
    </div>
  );
}

// Shared by category, brand and search pages while their products load.
export function ProductGridSkeleton({ count = 10, withFilters = true }: { count?: number; withFilters?: boolean }) {
  return (
    <div aria-busy="true" aria-label="Loading" className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6">
      <Skeleton className="h-9 w-56 rounded-lg" />
      <Skeleton className="mt-3 h-4 w-full max-w-md rounded" />
      {withFilters ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-9 w-24 rounded-full" />
          ))}
        </div>
      ) : null}
      <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 md:gap-7 lg:grid-cols-5">
        {Array.from({ length: count }, (_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
