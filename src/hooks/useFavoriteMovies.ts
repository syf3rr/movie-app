"use client";

import { useQuery } from "@tanstack/react-query";
import type { Movie } from "@/types/movie";

export default function useFavoriteMovies(ids: number[]) {
  const idsParam = ids.join(",");
  return useQuery({
    queryKey: ["favorites-batch", idsParam],
    queryFn: async (): Promise<{ data: Movie[] }> => {
      const res = await fetch(`/api/movies/by-ids?ids=${idsParam}`);
      if (!res.ok) throw new Error("Failed to load favorites");
      return res.json();
    },
    enabled: ids.length > 0,
  });
}

