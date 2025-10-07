"use client";

import { useEffect } from "react";
import { useMovies } from "@/hooks/useMovies";
import type { Movie } from "@/types/movie";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useFiltersStore } from "@/store/useFiltersStore";
import FilterBar from "@/components/FilterBar";
import MovieCard from "@/components/MovieCard";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import useSyncFiltersURL from "@/hooks/useSyncFiltersURL";


export default function HomePage() {
  const router = useRouter();
  const page = useFiltersStore((s) => s.page);
  const search = useFiltersStore((s) => s.search);
  const sort = useFiltersStore((s) => s.sort);
  const order = useFiltersStore((s) => s.order);

  const debouncedSearch = useDebouncedValue(search, 400);
  useSyncFiltersURL();

  const { data, isLoading, isError } = useMovies({
    page,
    search: debouncedSearch || undefined,
    sort,
    order,
  });

  useEffect(() => {
    const qs = new URLSearchParams();
    if (page && page !== 1) qs.set("page", String(page));
    if (debouncedSearch) qs.set("search", debouncedSearch);
    if (sort && sort !== "rating") qs.set("sort", sort);
    if (order && order !== "desc") qs.set("order", order);
    const query = qs.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
  }, [page, debouncedSearch, sort, order, router]);


  if (isLoading)
    return (
      <main className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[2/3] w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </main>
    );
  if (isError || !data) return <div className="p-6">Помилка завантаження</div>;

  const { data: movies, total } = data as { data: Movie[]; total: number };
  const canPrev = page > 1;
  const canNext = movies.length > 0 && page * 20 < total; 

  return (
    <main className="p-6 space-y-4">
      <FilterBar canPrev={canPrev} canNext={canNext} />

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {movies.map((m: Movie) => (
          <li key={m.id}>
            <MovieCard movie={m} />
          </li>
        ))}
      </ul>
    </main>
  );
}
