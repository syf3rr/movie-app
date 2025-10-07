import { NextResponse } from "next/server";
import { isAxiosError } from "axios";
import { tmdb } from "@/lib/tmdb";
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

  const sortFieldMap = {
    title: "original_title",
    year: "primary_release_date",
    rating: "vote_average",
  } as const;
  const sortBy = `${sortFieldMap[sort]}.${order}`;

  const basePath = search
    ? `${TMDB_BASE}/search/movie`
    : `${TMDB_BASE}/discover/movie`;

  const qs = new URLSearchParams();
  if (search) {
    qs.set("query", search);
  } else {
    qs.set("sort_by", sortBy);
    qs.set("vote_count.gte", "50");
  }
  qs.set("page", String(page));
  qs.set("include_adult", "false");

  const endpoint = `${basePath}?${qs.toString()}`;

  let res;
  try {
    res = await tmdb.get(
      endpoint.replace(/^https:\/\/api\.themoviedb\.org\/3/, "")
    );
  } catch (e: unknown) {
    const status = isAxiosError(e) ? e.response?.status ?? 500 : 500;
    return NextResponse.json({ error: "TMDB request failed" }, { status });
  }

  const json = res.data as TMDBSearchResponse;

  const results: TMDBSearchItem[] = Array.isArray(json.results)
    ? json.results.slice(0, 10)
    : [];
  const detailed = await Promise.all(
    results.map(async (m: TMDBSearchItem) => {
      const d = (await tmdb
        .get(`/movie/${m.id}`, { params: { append_to_response: "credits" } })
        .then((r) => r.data)) as TMDBMovieDetails;

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
