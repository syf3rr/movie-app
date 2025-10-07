"use client";
import { useFavoriteIds } from "@/hooks/useFavorites";
import useFavoriteMovies from "@/hooks/useFavoriteMovies";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import MovieCard from "@/components/MovieCard";
import type { Movie } from "@/types/movie";

export default function FavoritesPage() {
  const { data } = useFavoriteIds();
  const ids = data?.ids ?? [];

  const { data: moviesResp, isLoading } = useFavoriteMovies(ids);

  const movies = moviesResp?.data ?? [];

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Улюблені</h1>
      {ids.length === 0 ? (
        <div>Порожньо</div>
      ) : isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-52" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {movies.map((m) => (
            <li key={m.id}>
              <MovieCard movie={m} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
