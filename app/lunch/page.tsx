import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { Tabs } from "../../components/Tabs";
import { LunchGrid } from "../../components/LunchGrid";

export const dynamic = "force-dynamic";

const MODES = [
  { key: "a", label: "a 去過" },
  { key: "b", label: "b 未去過" },
  { key: "c", label: "c 價高" },
  { key: "d", label: "d 隨便" },
];

const BUDGETS = ["80", "100", "150", "200", ""];

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let s = seed >>> 0;
  const rand = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

type SearchParams = Record<string, string | undefined>;

export default async function LunchPage(props: { searchParams: Promise<SearchParams> }) {
  const sp = await props.searchParams;
  const mode = MODES.some((m) => m.key === sp.mode) ? sp.mode! : "d";
  const budget = sp.budget ?? "";
  const cuisine = sp.cuisine ?? "";
  const party = sp.party ? Number(sp.party) : null;
  const seed = sp.seed ? Number(sp.seed) : Math.floor(Math.random() * 1e9);

  const where: Record<string, unknown> = { hidden: false, closed: false };
  if (mode === "a") where.visited = true;
  if (mode === "b") where.visited = false;
  if (budget) where.priceMax = { lte: Number(budget) };
  if (cuisine) where.cuisines = { has: cuisine };
  if (party) where.seats = { gte: party };

  const rows = await prisma.restaurant.findMany({ where, take: 200 });

  const picked =
    mode === "c"
      ? [...rows].sort((a, b) => (b.priceMax ?? 0) - (a.priceMax ?? 0)).slice(0, 4)
      : seededShuffle(rows, seed).slice(0, 4);

  const params = new URLSearchParams();
  params.set("mode", mode);
  if (budget) params.set("budget", budget);
  if (cuisine) params.set("cuisine", cuisine);
  if (party) params.set("party", String(party));
  params.set("seed", String(seed));

  const cuisineOptions = Array.from(new Set(rows.flatMap((r) => r.cuisines))).sort();

  return (
    <>
      <Tabs active="lunch" />

      <div className="mb-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {MODES.map((m) => {
            const p = new URLSearchParams(params);
            p.set("mode", m.key);
            return (
              <Link
                key={m.key}
                href={`/lunch?${p.toString()}`}
                className={`px-3 py-1.5 rounded-full border ${mode === m.key ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-700"}`}
              >
                {m.label}
              </Link>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          {BUDGETS.map((b) => {
            const p = new URLSearchParams(params);
            if (b) p.set("budget", b); else p.delete("budget");
            return (
              <Link
                key={b || "unlimited"}
                href={`/lunch?${p.toString()}`}
                className={`px-3 py-1.5 rounded-full border ${budget === b ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-700"}`}
              >
                {b ? `≤$${b}` : "唔設限"}
              </Link>
            );
          })}
        </div>

        <form method="get" action="/lunch" className="flex flex-wrap gap-2">
          <input type="hidden" name="mode" value={mode} />
          <input type="hidden" name="budget" value={budget} />
          <input type="hidden" name="seed" value={seed} />
          <select name="cuisine" defaultValue={cuisine} className="border border-gray-200 rounded-md px-3 py-2 bg-white text-gray-900">
            <option value="">菜式：唔拘</option>
            {cuisineOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            name="party"
            type="number"
            defaultValue={party ?? ""}
            placeholder="人數"
            className="w-24 border border-gray-200 rounded-md px-3 py-2 text-gray-900"
          />
          <button type="submit" className="px-3 py-2 rounded-md bg-gray-900 text-white">
            開始揀
          </button>
        </form>

        <Link href={`/lunch?${params.toString()}&seed=${Date.now()}`} className="px-3 py-2 rounded-md border border-gray-200 bg-white text-gray-700">
          換一批
        </Link>
      </div>

      {picked.length === 0 ? (
        <p className="text-gray-500">冇匹配嘅餐廳，試下放寬條件。</p>
      ) : (
        <LunchGrid
          cards={picked.map((r) => ({
            id: r.id,
            name: [r.nameZh, r.nameEn].filter(Boolean).join(" / ") || r.address,
            cuisines: r.cuisines,
            price: `人均 $${r.priceMin ?? "?"}–${r.priceMax ?? "?"}`,
            visited: r.visited,
          }))}
        />
      )}
    </>
  );
}
