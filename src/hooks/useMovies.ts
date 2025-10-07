"use client";

import { useQuery } from "@tanstack/react-query";
import type { MoviesResponse } from "@/types/movie";

type Params = {
  page: number;
  search?: string;
  sort?: "title" | "year" | "rating";
  order?: "asc" | "desc";
};

type MoviesResponseLocal = MoviesResponse;

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
    queryFn: async (): Promise<MoviesResponseLocal> => {
      const res = await fetch(`/api/movies?${buildQuery(params)}`);
      if (!res.ok) throw new Error("Failed to load movies");
      return res.json();
    },
    placeholderData: (prev) => prev, 
  });
}
