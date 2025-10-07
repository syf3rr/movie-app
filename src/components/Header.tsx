"use client";

import Link from "next/link";
import { useFavoriteIds } from "@/hooks/useFavorites";
import { Badge } from "@/components/ui/badge";

export default function Header() {
  const { data } = useFavoriteIds();
  const count = data?.ids?.length ?? 0;

  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
        <Link href="/" className="font-semibold tracking-tight">
          Movie App
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/" className="text-sm opacity-80 hover:opacity-100">
            Home
          </Link>
          <Link
            href="/favorites"
            className="text-sm opacity-80 hover:opacity-100 inline-flex items-center gap-2"
          >
            Favorites
            <Badge variant="secondary">{count}</Badge>
          </Link>
        </nav>
      </div>
    </header>
  );
}
