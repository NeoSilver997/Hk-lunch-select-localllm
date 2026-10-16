import Link from "next/link";
import { prisma } from "../lib/prisma";
import { Tabs } from "../components/Tabs";
import { mallOf } from "../lib/malls";

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
  const mall = sp.mall ?? "";
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
  const all = await prisma.restaurant.findMany({ select: { id: true, address: true, cuisines: true } });

  const counts = new Map<string, number>();
  for (const r of all) {
    const m = mallOf(r.address);
    counts.set(m, (counts.get(m) ?? 0) + 1);
  }
  const mallOptions = [...counts.entries()].sort((a, b) => b[1] - a[1]);

  if (cuisine) where.cuisines = { has: cuisine };
  if (mall) {
    // 用 mallOf 計，同 pill 嘅數完全一致
    where.id = { in: all.filter((r) => mallOf(r.address) === mall).map((r) => r.id) };
  }
  if (min !== null) where.priceMin = { gte: min };
  if (max !== null) where.priceMax = { lte: max };
  if (visited === "visited") where.visited = true;
  if (visited === "unvisited") where.visited = false;
  if (!showClosed) where.closed = false;

  const rows = await prisma.restaurant.findMany({
    where,
    orderBy: [{ rating: "desc" }, { nameZh: "asc" }],
    take: 100,
  });

  const cuisineOptions = Array.from(new Set(all.flatMap((c) => c.cuisines))).sort();

  const base = new URLSearchParams();
  if (q) base.set("q", q);
  if (cuisine) base.set("cuisine", cuisine);
  if (mall) base.set("mall", mall);
  if (min !== null) base.set("min", String(min));
  if (max !== null) base.set("max", String(max));
  if (visited !== "all") base.set("visited", visited);
  if (showClosed) base.set("closed", "1");

  const pillHref = (key: string, value: string) => {
    const p = new URLSearchParams(base);
    if (value) p.set(key, value);
    else p.delete(key);
    return `/?${p.toString()}`;
  };

  return (
    <>
      <Tabs active="search" />

      <form method="get" className="mb-4 space-y-3">
        <input name="q" defaultValue={q} placeholder="關鍵字（名／地址／菜式）" className="field w-full" />

        <select name="cuisine" defaultValue={cuisine} className="field w-full">
          <option value="">全部菜式</option>
          {cuisineOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <input name="min" type="number" defaultValue={min ?? ""} placeholder="人均最低" className="field w-32" />
          <input name="max" type="number" defaultValue={max ?? ""} placeholder="人均最高" className="field w-32" />
        </div>

        <div className="flex flex-wrap gap-2">
          {PRICE_PILLS.map((p) => (
            <Link key={p.label} href={pillHref("max", p.max)} className={`pill ${max === Number(p.max) ? "pill-active" : ""}`}>
              {p.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href={pillHref("mall", "")} className={`pill ${mall === "" ? "pill-active" : ""}`}>
            全部地點
          </Link>
          {mallOptions.map(([label, n]) => (
            <Link key={label} href={pillHref("mall", label)} className={`pill ${mall === label ? "pill-active" : ""}`}>
              {label} {n}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {["all", "visited", "unvisited"].map((v) => (
            <Link key={v} href={pillHref("visited", v)} className={`pill ${visited === v ? "pill-active" : ""}`}>
              {v === "all" ? "全部" : v === "visited" ? "去過" : "未去過"}
            </Link>
          ))}
          <Link href={pillHref("closed", showClosed ? "0" : "1")} className="pill">
            顯示已結業
          </Link>
        </div>

        <div className="flex gap-2">
          <Link href="/" className="btn-quiet">
            重設
          </Link>
          <button type="submit" className="btn">
            搜尋
          </button>
        </div>
      </form>

      <p className="mb-3 muted">{rows.length} 個結果</p>

      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.id} className="card">
            <Link href={`/restaurant/${r.id}`} className="font-medium">
              {[r.nameZh, r.nameEn].filter(Boolean).join(" / ") || r.address}
            </Link>
            <div className="text-sm muted mt-1">
              {r.cuisines.join(" / ")} · {r.address} · 人均 ${r.priceMin ?? "?"}–${r.priceMax ?? "?"} ·{" "}
              {r.rating ?? "無評分"} · 座位 {r.seats ?? "待補"}
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="badge">{mallOf(r.address)}</span>
              {r.visited && <span className="badge badge-alt">去過</span>}
              {r.closed && <span className="badge badge-alt">已結業</span>}
              <Link href={`/restaurant/${r.id}/edit`} className="muted">
                編輯
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
