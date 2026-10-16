import { prisma } from "../../../lib/prisma";
import { recordVisit, addMenu } from "../../actions";
import { AdminModal } from "../../../components/AdminModal";

export const dynamic = "force-dynamic";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const r = await prisma.restaurant.findUnique({
    where: { id },
    include: {
      visits: { orderBy: { visitedAt: "desc" } },
      menus: { orderBy: { createdAt: "desc" } },
      changes: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!r) return <p>搵唔到呢間餐廳。</p>;

  return (
    <>
      <h1 className="text-xl font-medium mb-1">
        {[r.nameZh, r.nameEn].filter(Boolean).join(" / ") || r.address}
      </h1>

      <div className="text-sm text-gray-600 mb-4">
        {r.cuisines.join(" / ")} · {r.address} · 人均 ${r.priceMin ?? "?"}–${r.priceMax ?? "?"} ·{" "}
        評分 {r.rating ?? "無"} · 座位 {r.seats ?? "待補"} · {r.visited ? "去過" : "未去過"}
        {r.closed ? " · 已結業" : ""}
      </div>

      {r.hours && <p className="text-sm text-gray-600 mb-4">營業時間：{r.hours}</p>}
      {r.phone && <p className="text-sm text-gray-600 mb-4">電話：{r.phone}</p>}
      {r.licence && <p className="text-sm text-gray-600 mb-4">食環署：{r.licence}</p>}

      <section className="mb-4">
        <h2 className="font-medium mb-2">到訪 history</h2>
        {r.visits.length === 0 ? <p className="text-sm text-gray-500">未記錄。</p> : null}
        <ul className="space-y-1 text-sm">
          {r.visits.map((v) => (
            <li key={v.id}>
              {v.visitedAt.toISOString().slice(0, 10)} {v.note ?? ""}
            </li>
          ))}
        </ul>
        <form action={recordVisit} className="mt-3 flex gap-2">
          <input type="hidden" name="id" value={r.id} />
          <input name="note" placeholder="備註（可空）" className="flex-1 border border-gray-200 rounded px-3 py-2" />
          <button className="px-3 py-2 rounded-md bg-gray-900 text-white">記錄去過</button>
        </form>
      </section>

      <section className="mb-4">
        <h2 className="font-medium mb-2">餐牌</h2>
        {r.menus.length === 0 ? <p className="text-sm text-gray-500">未記錄。</p> : null}
        {r.menus.map((m) => (
          <div key={m.id} className="text-sm mb-2">
            {m.url ? <a href={m.url} className="text-gray-700 underline">餐牌檔案</a> : null}
            <ul className="mt-1">
              {m.items.map((it, i) => (
                <li key={i}>{it}</li>
              ))}
            </ul>
          </div>
        ))}
        <form action={addMenu} className="mt-3">
          <input type="hidden" name="id" value={r.id} />
          <textarea name="items" rows={4} placeholder="一行一個菜" className="w-full border border-gray-200 rounded px-3 py-2" />
          <button className="mt-2 px-3 py-2 rounded-md bg-gray-900 text-white">加餐牌</button>
        </form>
      </section>

      <section className="mb-4">
        <h2 className="font-medium mb-2">評價／改動記錄</h2>
        {r.changes.length === 0 ? <p className="text-sm text-gray-500">冇記錄。</p> : null}
        <ul className="space-y-1 text-sm">
          {r.changes.map((c) => (
            <li key={c.id}>
              {c.createdAt.toISOString().slice(0, 10)} · {c.field} = {c.value} · {c.source}
            </li>
          ))}
        </ul>
      </section>

      <AdminModal
        restaurant={{
          id: r.id,
          nameZh: r.nameZh,
          nameEn: r.nameEn,
          address: r.address,
          district: r.district,
          cuisines: r.cuisines,
          priceMin: r.priceMin,
          priceMax: r.priceMax,
          seats: r.seats,
          rating: r.rating,
          phone: r.phone,
          hours: r.hours,
          hidden: r.hidden,
          closed: r.closed,
          visited: r.visited,
        }}
      />
    </>
  );
}
