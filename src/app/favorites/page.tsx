"use client";
import Image from "next/image";
import { useMemo } from "react";
import { useFavoriteIds } from "@/hooks/useFavorites";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type Movie = {
  id: number;
  title: string;
  year: number | null;
  rating: number | null;
  description: string | null;
  actors: string[];
  genres: string[];
  posterPath?: string | null;
};

export default function FavoritesPage() {
  const { data } = useFavoriteIds();
  const ids = data?.ids ?? [];

  const idsParam = useMemo(() => ids.join(","), [ids]);

  const { data: moviesResp, isLoading } = useQuery({
    queryKey: ["favorites-batch", idsParam],
    queryFn: async () => {
      const res = await fetch(`/api/movies/by-ids?ids=${idsParam}`);
      if (!res.ok) throw new Error("Failed to load favorites");
      return res.json() as Promise<{ data: Movie[] }>;
    },
    enabled: ids.length > 0,
  });

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
              <Card className="overflow-hidden">
                {m.posterPath ? (
                  <div className="relative w-full aspect-[2/3] max-h-72 bg-muted">
                    <Image
                      src={`https://image.tmdb.org/t/p/w342${m.posterPath}`}
                      alt={m.title}
                      fill
                      className="object-contain"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  </div>
                ) : null}
                <CardHeader>
                  <CardTitle className="text-base">
                    {m.title} {m.year ? `(${m.year})` : ""}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm opacity-80">
                    Rating: {m.rating ?? "—"}
                  </div>
                  {m.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {m.genres.map((g) => (
                        <Badge key={g} variant="secondary">
                          {g}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {m.actors.length > 0 && (
                    <div className="text-xs opacity-70">
                      Actors: {m.actors.join(", ")}
                    </div>
                  )}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
