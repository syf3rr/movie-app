"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFiltersStore } from "@/store/useFiltersStore";

export default function useSyncFiltersURL() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = useFiltersStore((s) => s.page);
  const search = useFiltersStore((s) => s.search);
  const sort = useFiltersStore((s) => s.sort);
  const order = useFiltersStore((s) => s.order);
  const setPage = useFiltersStore((s) => s.setPage);
  const setSearch = useFiltersStore((s) => s.setSearch);
  const setSort = useFiltersStore((s) => s.setSort);
  const setOrder = useFiltersStore((s) => s.setOrder);

  useEffect(() => {
    const p = Number(searchParams.get("page") || "1");
    const s = searchParams.get("search") || "";
    const so = (searchParams.get("sort") || "rating") as typeof sort;
    const or = (searchParams.get("order") || "desc") as typeof order;
    setPage(Number.isFinite(p) && p > 0 ? p : 1);
    setSearch(s);
    setSort(so);
    setOrder(or);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const qs = new URLSearchParams();
    if (page && page !== 1) qs.set("page", String(page));
    if (search) qs.set("search", search);
    if (sort && sort !== "rating") qs.set("sort", sort);
    if (order && order !== "desc") qs.set("order", order);
    const query = qs.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
  }, [page, search, sort, order, router]);
}
