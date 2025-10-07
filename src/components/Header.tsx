"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import useFavoritesCount from "@/hooks/useFavoritesCount";

export default function Header() {
  const count = useFavoritesCount();

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
