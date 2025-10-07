"use client";

import { useQuery } from "@tanstack/react-query";
import type { Movie } from "@/types/movie";

export default function useMovie(id: number | undefined) {
  return useQuery({
    queryKey: ["movie", id],
    queryFn: async (): Promise<Movie> => {
      const res = await fetch(`/api/movies/${id}`);
      if (!res.ok) throw new Error("Failed to load movie");
      return res.json();
    },
    enabled: !!id && Number.isFinite(id) && id > 0,
  });
}


