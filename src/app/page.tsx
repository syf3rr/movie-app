"use client";

import { useEffect, useState } from "react";
import { useMovies } from "@/hooks/useMovies";

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

  if (isLoading) return <div className="p-6">Завантаження…</div>;
  if (isError || !data) return <div className="p-6">Помилка завантаження</div>;

  const { data: movies, total } = data;
  const canPrev = page > 1;
  const canNext = movies.length > 0 && page * 20 < total; // TMDB ~20 на сторінку

  return (
    <main className="p-6 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Пошук за назвою…"
          className="px-3 py-2 border rounded w-72"
        />

        <select
          value={sort}
          onChange={(e) => {
            setPage(1);
            setSort(e.target.value as typeof sort);
          }}
          className="px-3 py-2 border rounded"
        >
          <option value="rating">Rating</option>
          <option value="title">Title</option>
          <option value="year">Year</option>
        </select>

        <button
          onClick={() => {
            setPage(1);
            setOrder((o) => (o === "asc" ? "desc" : "asc"));
          }}
          className="px-3 py-2 border rounded"
          aria-label="Змінити порядок"
          title="Змінити порядок"
        >
          {order === "asc" ? "▲ ASC" : "▼ DESC"}
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button
            disabled={!canPrev}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-2 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>Page {page}</span>
          <button
            disabled={!canNext}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      <ul className="space-y-2">
        {movies.map((m) => (
          <li key={m.id} className="border rounded p-3">
            <div className="font-medium">
              {m.title} {m.year ? `(${m.year})` : ""}
            </div>
            <div className="text-sm opacity-80">Rating: {m.rating ?? "—"}</div>
            {m.genres.length > 0 && (
              <div className="text-xs opacity-70">Genres: {m.genres.join(", ")}</div>
            )}
            {m.actors.length > 0 && (
              <div className="text-xs opacity-70">Actors: {m.actors.join(", ")}</div>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}