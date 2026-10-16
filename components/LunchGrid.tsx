"use client";

import Link from "next/link";

type Card = {
  id: string;
  name: string;
  cuisines: string[];
  price: string;
  visited: boolean;
};

export function LunchGrid({ cards }: { cards: Card[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((c) => (
        <Link
          key={c.id}
          href={`/restaurant/${c.id}`}
          className="border border-gray-200 rounded-md p-3 bg-white text-gray-900"
        >
          <div className="font-medium">{c.name}</div>
          <div className="text-sm text-gray-600 mt-1">{c.cuisines.join(" / ")}</div>
          <div className="text-sm text-gray-600">{c.price}</div>
          <div className="text-xs text-gray-500 mt-1">{c.visited ? "去過" : "未去過"}</div>
        </Link>
      ))}
    </div>
  );
}
