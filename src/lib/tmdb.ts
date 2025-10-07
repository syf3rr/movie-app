export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export function posterUrl(
  path: string | null | undefined,
  width: 92 | 154 | 185 | 342 | 500 | 780 = 342
) {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/w${width}${path}`;
}

