import { ProductCardSkeleton, Skeleton } from "@/components/Skeleton";

export default function ProductLoading() {
  return (
    <div aria-busy="true" aria-label="Loading product" className="mx-auto max-w-[100rem] px-4 py-8 sm:px-6 lg:px-10">
      <Skeleton className="mb-6 h-4 w-60 rounded" />
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,32rem)_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[minmax(0,36rem)_minmax(0,1fr)]">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div>
          <Skeleton className="h-4 w-40 rounded" />
          <Skeleton className="mt-3 h-9 w-3/4 rounded-lg" />
          <Skeleton className="mt-4 h-7 w-32 rounded" />
          <Skeleton className="mt-5 h-4 w-full rounded" />
          <Skeleton className="mt-2 h-4 w-11/12 rounded" />
          <Skeleton className="mt-2 h-4 w-2/3 rounded" />
          <div className="mt-6 flex gap-2">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-16 w-16 rounded-lg" />
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-10 w-14 rounded-full" />
            ))}
          </div>
          <Skeleton className="mt-6 h-12 w-full rounded-xl" />
        </div>
      </div>
      <div className="mt-20 border-t border-[var(--border)] pt-16">
        <Skeleton className="mb-8 h-8 w-56 rounded-lg" />
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
