import { NextResponse } from "next/server";
import type { Movie } from "@/types/movie";
import type {
  TMDBSearchItem,
  TMDBSearchResponse,
  TMDBGenre,
  TMDBCastMember,
  TMDBMovieDetails,
} from "@/types/tmdb";

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
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "TMDB request failed" },
      { status: res.status }
    );
  }

  const json = (await res.json()) as TMDBSearchResponse;

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
