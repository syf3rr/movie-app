"use client";

import { useFavoriteIds } from "@/hooks/useFavorites";

export default function useFavoritesCount() {
  const { data } = useFavoriteIds();
  return data?.ids?.length ?? 0;
}

