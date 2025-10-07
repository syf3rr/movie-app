"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFavoriteIds, useToggleFavorite } from "@/hooks/useFavorites";
import { posterUrl } from "@/lib/tmdb";

export type MovieCardProps = {
  movie: {
    id: number;
    title: string;
    year: number | null;
    rating: number | null;
    genres: string[];
    actors: string[];
    posterPath?: string | null;
  };
};

export default function MovieCard({ movie }: MovieCardProps) {
  const { id, title, year, rating, genres, actors, posterPath } = movie;
  const { data: favData } = useFavoriteIds();
  const toggleFav = useToggleFavorite();
  const isFav = !!favData?.ids?.includes(id);

  return (
    <Link href={`/movies/${id}`} className="block h-full">
      <Card className="h-full overflow-hidden">
        {posterPath ? (
          <div className="relative w-full aspect-[2/3] max-h-72 bg-muted">
            <Image
              src={posterUrl(posterPath, 342) as string}
              alt={title}
              fill
              className="object-contain"
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          </div>
        ) : null}
        <CardHeader>
          <CardTitle className="text-base">
            {title} {year ? `(${year})` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm opacity-80">Rating: {rating ?? "—"}</div>
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {genres.map((g) => (
                <Badge key={g} variant="secondary">
                  {g}
                </Badge>
              ))}
            </div>
          )}
          {actors.length > 0 && (
            <div className="text-xs opacity-70">
              Actors: {actors.join(", ")}
            </div>
          )}
          <div className="pt-2">
            <Button
              variant={isFav ? "default" : "outline"}
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFav.mutate({ id, next: !isFav });
              }}
            >
              {isFav ? "Зняти з улюблених" : "В улюблені"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
