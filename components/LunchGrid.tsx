"use client";

import Link from "next/link";

type Card = {
  id: string;
  name: string;
  cuisines: string[];
  price: string;
  visited: boolean;
  mall: string;
};

export function LunchGrid({ cards }: { cards: Card[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((c) => (
        <Link key={c.id} href={`/restaurant/${c.id}`} className="card">
          <div className="font-medium">{c.name}</div>
          <div className="text-sm muted mt-1">{c.cuisines.join(" / ")}</div>
          <div className="text-sm muted">{c.price}</div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="badge">{c.mall}</span>
            <span className="badge badge-alt">{c.visited ? "去過" : "未去過"}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
