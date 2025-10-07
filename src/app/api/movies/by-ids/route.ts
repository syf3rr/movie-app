import { NextResponse } from "next/server";
import type { Movie } from "@/types/movie";
import type { TMDBCastMember, TMDBGenre, TMDBMovieDetails } from "@/types/tmdb";

const TMDB_BASE = "https://api.themoviedb.org/3";

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
      const res = await fetch(
        `${TMDB_BASE}/movie/${id}?append_to_response=credits`,
        {
          headers: {
            Authorization: `Bearer ${process.env.TMDB_API_READ_TOKEN}`,
          },
        }
      );
      if (!res.ok) throw new Error(`TMDB error for id ${id}`);
      const d = (await res.json()) as TMDBMovieDetails;

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
