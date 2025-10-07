"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFavoriteIds, useToggleFavorite } from "@/hooks/useFavorites";

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

export default function MovieDetailsPage() {
  const params = useParams<{ id: string }>();
  const movieId = Number(params.id);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["movie", movieId],
    queryFn: async (): Promise<Movie> => {
      const res = await fetch(`/api/movies/${movieId}`);
      if (!res.ok) throw new Error("Failed to load movie");
      return res.json();
    },
    enabled: Number.isFinite(movieId) && movieId > 0,
  });

  const { data: favData } = useFavoriteIds();
  const toggleFav = useToggleFavorite();
  const isFav = !!favData?.ids?.includes(movieId);

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="aspect-[2/3] w-full" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }
  if (isError || !data) return <div>Не вдалося завантажити фільм</div>;

  const m = data;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="relative w-full aspect-[2/3] bg-muted">
        {m.posterPath && (
          <Image
            src={`https://image.tmdb.org/t/p/w500${m.posterPath}`}
            alt={m.title}
            fill
            className="object-contain"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        )}
      </div>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <CardTitle className="text-xl">
            {m.title} {m.year ? `(${m.year})` : ""}
          </CardTitle>
          <Button
            variant={isFav ? "default" : "outline"}
            onClick={() => toggleFav.mutate({ id: m.id, next: !isFav })}
          >
            {isFav ? "Зняти з улюблених" : "В улюблені"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm opacity-80">Rating: {m.rating ?? "—"}</div>
          {m.genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {m.genres.map((g) => (
                <Badge key={g} variant="secondary">
                  {g}
                </Badge>
              ))}
            </div>
          )}
          {m.description && (
            <p className="text-sm leading-6 opacity-90">{m.description}</p>
          )}
          {m.actors.length > 0 && (
            <div className="text-sm opacity-80">
              <span className="font-medium">Actors:</span> {m.actors.join(", ")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
