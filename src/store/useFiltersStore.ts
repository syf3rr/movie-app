"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SortKey = "title" | "year" | "rating";
export type SortOrder = "asc" | "desc";

type FiltersState = {
  page: number;
  search: string;
  sort: SortKey;
  order: SortOrder;
  // setters
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  setSort: (sort: SortKey) => void;
  setOrder: (order: SortOrder) => void;
  reset: () => void;
};

const initial: Omit<
  FiltersState,
  "setPage" | "setSearch" | "setSort" | "setOrder" | "reset"
> = {
  page: 1,
  search: "",
  sort: "rating",
  order: "desc",
};

export const useFiltersStore = create<FiltersState>()(
  persist(
    (set) => ({
      ...initial,
      setPage: (page) => set({ page }),
      setSearch: (search) => set({ search }),
      setSort: (sort) => set({ sort }),
      setOrder: (order) => set({ order }),
      reset: () => set({ ...initial }),
    }),
    {
      name: "filters-store-v1",
      partialize: (s) => ({
        page: s.page,
        search: s.search,
        sort: s.sort,
        order: s.order,
      }),
    }
  )
);
