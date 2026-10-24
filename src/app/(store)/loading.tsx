import { Skeleton } from "@/components/Skeleton";

export default function StoreLoading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="px-3 sm:px-4 md:px-6 pt-3 md:pt-4">
        <Skeleton className="aspect-[1122/1402] w-full rounded-[28px] md:aspect-[2029/775]" />
      </div>
      <Skeleton className="mt-3 h-10 w-full" />
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 py-16">
        <Skeleton className="mb-8 h-8 w-48 rounded-lg" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 md:gap-7">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index}>
              <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
              <Skeleton className="mt-3 h-3 w-16 rounded" />
              <Skeleton className="mt-2 h-4 w-full rounded" />
              <Skeleton className="mt-2 h-4 w-20 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
