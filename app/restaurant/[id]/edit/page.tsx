import Link from "next/link";
import { prisma } from "../../../../lib/prisma";
import { EditForm } from "../../../../components/EditForm";

export const dynamic = "force-dynamic";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const r = await prisma.restaurant.findUnique({ where: { id } });
  if (!r) return <p>搵唔到呢間餐廳。</p>;

  return (
    <>
      <p className="text-sm mb-3">
        <Link href={`/restaurant/${r.id}`} className="underline">
          ← 返回詳情
        </Link>
      </p>

      <h1 className="text-xl font-medium mb-1">編輯餐廳</h1>
      <p className="text-sm muted mb-4">
        {[r.nameZh, r.nameEn].filter(Boolean).join(" / ") || r.address}
      </p>

      <EditForm
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
          notes: r.notes,
          licence: r.licence,
          hours: r.hours,
          hidden: r.hidden,
          closed: r.closed,
          visited: r.visited,
        }}
      />
    </>
  );
}
