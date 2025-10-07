import { NextResponse } from "next/server";
import { tmdb } from "@/lib/tmdb";
import type { Movie } from "@/types/movie";
import type { TMDBCastMember, TMDBGenre, TMDBMovieDetails } from "@/types/tmdb";

// TMDB_BASE not needed here; using axios instance baseURL

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const idsParam = searchParams.get("ids")?.trim() || "";
  if (!idsParam) return NextResponse.json({ data: [] as Movie[] });

  const ids = idsParam
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);

  if (ids.length === 0) return NextResponse.json({ data: [] as Movie[] });

  const movies: Movie[] = await Promise.all(
    ids.map(async (id) => {
      const d = (await tmdb
        .get(`/movie/${id}`, { params: { append_to_response: "credits" } })
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

      return {
        id: d.id,
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
      } satisfies Movie;
    })
  );

  return NextResponse.json({ data: movies });
}
