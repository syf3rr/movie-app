"use client";

import { useEffect, useState } from "react";
import { useMovies, type Movie } from "@/hooks/useMovies";
import { useFavoriteIds, useToggleFavorite } from "@/hooks/useFavorites";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function useDebouncedValue<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function HomePage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"title" | "year" | "rating">("rating");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, isError } = useMovies({
    page,
    search: debouncedSearch || undefined,
    sort,
    order,
  });

  const { data: favData } = useFavoriteIds();
  const toggleFav = useToggleFavorite();
  const favoriteIds = new Set(favData?.ids ?? []);

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
      </main>
    );
  if (isError || !data) return <div className="p-6">Помилка завантаження</div>;

  const { data: movies, total } = data as { data: Movie[]; total: number };
  const canPrev = page > 1;
  const canNext = movies.length > 0 && page * 20 < total; // TMDB ~20 на сторінку

  return (
    <main className="p-6 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Пошук за назвою…"
          className="w-72"
        />

        <Select
          value={sort}
          onValueChange={(v) => {
            setPage(1);
            setSort(v as typeof sort);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Сортування" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Rating</SelectItem>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="year">Year</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => {
            setPage(1);
            setOrder((o) => (o === "asc" ? "desc" : "asc"));
          }}
          aria-label="Змінити порядок"
          title="Змінити порядок"
        >
          {order === "asc" ? "▲ ASC" : "▼ DESC"}
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            disabled={!canPrev}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </Button>
          <span>Page {page}</span>
          <Button
            variant="outline"
            disabled={!canNext}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {movies.map((m: Movie) => {
          const isFav = favoriteIds.has(m.id);
          return (
            <li key={m.id}>
              <Card className="h-full overflow-hidden">
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
                  <div className="pt-2">
                    <Button
                      variant={isFav ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        toggleFav.mutate({ id: m.id, next: !isFav })
                      }
                    >
                      {isFav ? "Зняти з улюблених" : "В улюблені"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
