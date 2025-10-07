import { NextResponse } from "next/server";

const TMDB_BASE = "https://api.themoviedb.org/3";

// Мінімальні типи відповіді TMDB для деталей фільму
type TMDBGenre = { id: number; name: string };
type TMDBCastMember = { id: number; name: string; popularity?: number };
type TMDBMovieDetails = {
  id: number;
  title?: string;
  original_title?: string;
  release_date?: string | null;
  vote_average?: number;
  overview?: string | null;
  poster_path?: string | null;
  genres?: TMDBGenre[];
  credits?: { cast?: TMDBCastMember[] };
};

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const res = await fetch(
    `${TMDB_BASE}/movie/${id}?append_to_response=credits`,
    {
      headers: { Authorization: `Bearer ${process.env.TMDB_API_READ_TOKEN}` },
    }
  );
  if (!res.ok)
    return NextResponse.json({ error: "TMDB error" }, { status: res.status });

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
}
