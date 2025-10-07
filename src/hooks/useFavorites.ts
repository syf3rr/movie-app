"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useFavoriteIds() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const res = await fetch("/api/favorites");
      if (!res.ok) throw new Error("Failed to load favorites");
      return (await res.json()) as { ids: number[] };
    },
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, next }: { id: number; next: boolean }) => {
      const method = next ? "POST" : "DELETE";
      const res = await fetch("/api/favorites", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Fav toggle failed");
      return { id, next };
    },
    // Optimistic update
    onMutate: async ({ id, next }) => {
      await qc.cancelQueries({ queryKey: ["favorites"] });
      const prev = qc.getQueryData<{ ids: number[] }>(["favorites"]);
      if (prev) {
        const ids = new Set(prev.ids);
        next ? ids.add(id) : ids.delete(id);
        qc.setQueryData(["favorites"], { ids: Array.from(ids) });
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(["favorites"], ctx.prev);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}