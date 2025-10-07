"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFiltersStore } from "@/store/useFiltersStore";

export default function FilterBar({
  canPrev,
  canNext,
}: {
  canPrev: boolean;
  canNext: boolean;
}) {
  const page = useFiltersStore((s) => s.page);
  const search = useFiltersStore((s) => s.search);
  const sort = useFiltersStore((s) => s.sort);
  const order = useFiltersStore((s) => s.order);
  const setPage = useFiltersStore((s) => s.setPage);
  const setSearch = useFiltersStore((s) => s.setSearch);
  const setSort = useFiltersStore((s) => s.setSort);
  const setOrder = useFiltersStore((s) => s.setOrder);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        value={search}
        onChange={(e) => {
          setPage(1);
          setSearch(e.target.value);
        }}
        placeholder="Пошук за назвою…"
        className="w-72"
      />

      <Select
        value={sort}
        onValueChange={(v) => {
          setPage(1);
          setSort(v as typeof sort);
        }}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Сортування" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="rating">Rating</SelectItem>
          <SelectItem value="title">Title</SelectItem>
          <SelectItem value="year">Year</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        onClick={() => {
          setPage(1);
          setOrder(order === "asc" ? "desc" : "asc");
        }}
        aria-label="Змінити порядок"
        title="Змінити порядок"
      >
        {order === "asc" ? "▲ ASC" : "▼ DESC"}
      </Button>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="outline"
          disabled={!canPrev}
          onClick={() => setPage(page - 1)}
        >
          Prev
        </Button>
        <span>Page {page}</span>
        <Button
          variant="outline"
          disabled={!canNext}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

