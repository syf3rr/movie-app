import { NextResponse } from "next/server";

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

// TMDB response types (minimal subset we need)
type TMDBSearchItem = {
  id: number;
  title?: string;
  original_title?: string;
  release_date?: string | null;
  vote_average?: number;
  overview?: string | null;
  poster_path?: string | null;
};

type TMDBSearchResponse = {
  page: number;
  total_results: number;
  results: TMDBSearchItem[];
};

type TMDBGenre = { id: number; name: string };
type TMDBCastMember = {
  id: number;
  name: string;
  popularity?: number;
};

type TMDBMovieDetails = TMDBSearchItem & {
  genres?: TMDBGenre[];
  credits?: { cast?: TMDBCastMember[] };
};

const TMDB_BASE = "https://api.themoviedb.org/3";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? "1");
  const search = searchParams.get("search")?.trim() || "";
  const sort = (searchParams.get("sort") || "rating") as
    | "title"
    | "year"
    | "rating";
  const order = (searchParams.get("order") || "desc") as "asc" | "desc";

  // TODO: за потреби врахуй limit (TMDB працює з page, 20 items/page)

  // Якщо є пошук — /search/movie, інакше — /discover/movie з sort_by
  const sortBy =
    sort === "title"
      ? `original_title.${order}`
      : sort === "year"
      ? `primary_release_date.${order}`
      : `vote_average.${order}`;

  const endpoint = search
    ? `${TMDB_BASE}/search/movie?query=${encodeURIComponent(
        search
      )}&page=${page}&include_adult=false`
    : `${TMDB_BASE}/discover/movie?sort_by=${encodeURIComponent(
        sortBy
      )}&page=${page}&include_adult=false&vote_count.gte=50`;

  const res = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${process.env.TMDB_API_READ_TOKEN}` },
    // cache: "no-store" // опційно, якщо не хочеш кеш
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "TMDB request failed" },
      { status: res.status }
    );
  }

  const json = (await res.json()) as TMDBSearchResponse;

  // Деталізація фільмів (актори/жанри) — по кожному id
  // Порада: для старту зроби 5–10 штук через Promise.all, потім оптимізуємо.
  const results: TMDBSearchItem[] = Array.isArray(json.results)
    ? json.results.slice(0, 10)
    : [];
  const detailed = await Promise.all(
    results.map(async (m: TMDBSearchItem) => {
      const d = (await fetch(
        `${TMDB_BASE}/movie/${m.id}?append_to_response=credits`,
        {
          headers: {
            Authorization: `Bearer ${process.env.TMDB_API_READ_TOKEN}`,
          },
        }
      ).then((r) => r.json())) as TMDBMovieDetails;

      const cast: TMDBCastMember[] = Array.isArray(d?.credits?.cast)
        ? (d.credits?.cast as TMDBCastMember[])
        : [];
      const actors = cast
        .slice()
        .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
        .slice(0, 5)
        .map((c) => c.name);

      const genres = Array.isArray(d?.genres)
        ? (d.genres as TMDBGenre[]).map((g) => g.name)
        : [];

      const movie: Movie = {
        id: d.id!,
        title: d.title ?? d.original_title ?? "",
        year: d.release_date ? Number(d.release_date.slice(0, 4)) : null,
        rating:
          typeof d.vote_average === "number"
            ? Number(d.vote_average.toFixed(1))
            : null,
        description: d.overview ?? null,
        actors,
        genres,
        posterPath: d.poster_path ?? null,
      };

      return movie;
    })
  );

  return NextResponse.json({
    data: detailed,
    page: Number(json.page) || page,
    total: Number(json.total_results) || 0,
  });
}
