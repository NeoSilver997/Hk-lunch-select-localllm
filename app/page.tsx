import Link from "next/link";
import { prisma } from "../lib/prisma";
import { Tabs } from "../components/Tabs";

export const dynamic = "force-dynamic";

const PRICE_PILLS = [
  { label: "≤$80", min: "", max: "80" },
  { label: "$50–150", min: "50", max: "150" },
  { label: "$100–200", min: "100", max: "200" },
  { label: "$200+", min: "200", max: "" },
];

type SearchParams = Record<string, string | undefined>;

export default async function Page(props: { searchParams: Promise<SearchParams> }) {
  const sp = await props.searchParams;
  const q = sp.q ?? "";
  const cuisine = sp.cuisine ?? "";
  const min = sp.min ? Number(sp.min) : null;
  const max = sp.max ? Number(sp.max) : null;
  const visited = sp.visited ?? "all";
  const showClosed = sp.closed === "1";

  const where: Record<string, unknown> = { hidden: false };
  if (q) {
    where.OR = [
      { nameZh: { contains: q, mode: "insensitive" } },
      { nameEn: { contains: q, mode: "insensitive" } },
      { address: { contains: q, mode: "insensitive" } },
      { cuisines: { has: q } },
    ];
  }
  if (cuisine) where.cuisines = { has: cuisine };
  if (min !== null) where.priceMin = { gte: min };
  if (max !== null) where.priceMax = { lte: max };
  if (visited === "visited") where.visited = true;
  if (visited === "unvisited") where.visited = false;
  if (!showClosed) where.closed = false;

  const [rows, cuisines] = await Promise.all([
    prisma.restaurant.findMany({ where, orderBy: [{ rating: "desc" }, { nameZh: "asc" }], take: 100 }),
    prisma.restaurant.findMany({ select: { cuisines: true } }),
  ]);

  const cuisineOptions = Array.from(new Set(cuisines.flatMap((c) => c.cuisines))).sort();

  const base = new URLSearchParams();
  if (q) base.set("q", q);
  if (cuisine) base.set("cuisine", cuisine);
  if (min !== null) base.set("min", String(min));
  if (max !== null) base.set("max", String(max));
  if (visited !== "all") base.set("visited", visited);
  if (showClosed) base.set("closed", "1");

  return (
    <>
      <Tabs active="search" />

      <form method="get" className="mb-4 space-y-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="關鍵字（名／地址／菜式）"
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-gray-900"
        />

        <select
          name="cuisine"
          defaultValue={cuisine}
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-gray-900 bg-white"
        >
          <option value="">全部菜式</option>
          {cuisineOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <input
            name="min"
            type="number"
            defaultValue={min ?? ""}
            placeholder="人均最低"
            className="w-32 border border-gray-200 rounded-md px-3 py-2 text-gray-900"
          />
          <input
            name="max"
            type="number"
            defaultValue={max ?? ""}
            placeholder="人均最高"
            className="w-32 border border-gray-200 rounded-md px-3 py-2 text-gray-900"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {PRICE_PILLS.map((p) => {
            const pill = new URLSearchParams(base);
            if (p.min) pill.set("min", p.min); else pill.delete("min");
            if (p.max) pill.set("max", p.max); else pill.delete("max");
            return (
              <Link
                key={p.label}
                href={`/?${pill.toString()}`}
                className="px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-700"
              >
                {p.label}
              </Link>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          {["all", "visited", "unvisited"].map((v) => {
            const pill = new URLSearchParams(base);
            if (v === "all") pill.delete("visited"); else pill.set("visited", v);
            const label = v === "all" ? "全部" : v === "visited" ? "去過" : "未去過";
            return (
              <Link
                key={v}
                href={`/?${pill.toString()}`}
                className={`px-3 py-1.5 rounded-full border ${visited === v ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-700"}`}
              >
                {label}
              </Link>
            );
          })}
          <Link
            href={`/?${base.toString()}${base.toString() ? "&" : ""}closed=${showClosed ? "0" : "1"}`}
            className="px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-700"
          >
            顯示已結業
          </Link>
        </div>

        <div className="flex gap-2">
          <Link href="/" className="px-3 py-2 rounded-md border border-gray-200 bg-white text-gray-700">
            重設
          </Link>
          <button type="submit" className="px-3 py-2 rounded-md bg-gray-900 text-white">
            搜尋
          </button>
        </div>
      </form>

      <p className="mb-3 text-sm text-gray-500">{rows.length} 個結果</p>

      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.id} className="border border-gray-200 rounded-md p-3 bg-white">
            <Link href={`/restaurant/${r.id}`} className="font-medium text-gray-900">
              {[r.nameZh, r.nameEn].filter(Boolean).join(" / ") || r.address}
            </Link>
            <div className="text-sm text-gray-600 mt-1">
              {r.cuisines.join(" / ")} · {r.address} · 人均 ${r.priceMin ?? "?"}–${r.priceMax ?? "?"} ·{" "}
              {r.rating ?? "無評分"} · 座位 {r.seats ?? "待補"}
            </div>
            {r.visited && <span className="text-xs text-gray-500">去過</span>}
            {r.closed && <span className="text-xs text-red-600">已結業</span>}
          </li>
        ))}
      </ul>
    </>
  );
}
