export type Movie = {
  id: number;
  title: string;
  year: number | null;
  rating: number | null;
  description: string | null;
  actors: string[];
  genres: string[];
  posterPath?: string | null;
};

export type MoviesResponse = {
  data: Movie[];
  page: number;
  total: number;
};
