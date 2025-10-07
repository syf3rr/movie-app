import { NextRequest, NextResponse } from "next/server";
import { isAxiosError } from "axios";
import { tmdb } from "@/lib/tmdb";
import type { TMDBCastMember, TMDBGenre, TMDBMovieDetails } from "@/types/tmdb";

const TMDB_BASE = "https://api.themoviedb.org/3";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: idStr } = await context.params;
  const id = Number(idStr);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
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

    return NextResponse.json({
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
    });
  } catch (e: unknown) {
    const status = isAxiosError(e) ? e.response?.status ?? 500 : 500;
    return NextResponse.json({ error: "TMDB error" }, { status });
  }
}
