"use client";

import { useQuery } from "@tanstack/react-query";

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

type Params = {
  page: number;
  search?: string;
  sort?: "title" | "year" | "rating";
  order?: "asc" | "desc";
};

type MoviesResponse = {
  data: Movie[];
  page: number;
  total: number;
};

function buildQuery(params: Params) {
  const qs = new URLSearchParams();
  qs.set("page", String(params.page ?? 1));
  if (params.search) qs.set("search", params.search);
  if (params.sort) qs.set("sort", params.sort);
  if (params.order) qs.set("order", params.order);
  return qs.toString();
}

export function useMovies(params: Params) {
  const key = ["movies", params] as const;

  return useQuery({
    queryKey: key,
    queryFn: async (): Promise<MoviesResponse> => {
      const res = await fetch(`/api/movies?${buildQuery(params)}`);
      if (!res.ok) throw new Error("Failed to load movies");
      return res.json();
    },
    keepPreviousData: true,
  });
}