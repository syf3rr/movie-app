export type TMDBGenre = { id: number; name: string };
export type TMDBCastMember = { id: number; name: string; popularity?: number };

export type TMDBSearchItem = {
  id: number;
  title?: string;
  original_title?: string;
  release_date?: string | null;
  vote_average?: number;
  overview?: string | null;
  poster_path?: string | null;
};

export type TMDBSearchResponse = {
  page: number;
  total_results: number;
  results: TMDBSearchItem[];
};

export type TMDBMovieDetails = TMDBSearchItem & {
  genres?: TMDBGenre[];
  credits?: { cast?: TMDBCastMember[] };
};
