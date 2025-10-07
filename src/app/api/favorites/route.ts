import { NextResponse } from "next/server";

// In-memory favorites store (per server instance)
const favorites = new Set<number>();

export async function GET() {
  return NextResponse.json({ ids: Array.from(favorites) });
}

export async function POST(req: Request) {
  const { id } = await req.json();
  if (typeof id !== "number") {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  favorites.add(id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  if (typeof id !== "number") {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  favorites.delete(id);
  return NextResponse.json({ ok: true });
}
