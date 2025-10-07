import axios from "axios";

export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";
export const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export const tmdb = axios.create({
  baseURL: TMDB_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.TMDB_API_READ_TOKEN}`,
  },
});

export function posterUrl(
  path: string | null | undefined,
  width: 92 | 154 | 185 | 342 | 500 | 780 = 342
) {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/w${width}${path}`;
}
