import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export const dynamic = "force-dynamic";

const ALLOWED = [
  "nameZh",
  "nameEn",
  "address",
  "district",
  "cuisines",
  "priceMin",
  "priceMax",
  "seats",
  "rating",
  "phone",
  "notes",
  "licence",
  "hours",
  "hidden",
  "closed",
  "visited",
] as const;

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const secret = req.headers.get("x-admin-secret");
  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  for (const key of ALLOWED) {
    if (key in body) data[key] = body[key];
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "no fields" }, { status: 400 });
  }

  await prisma.restaurant.update({ where: { id }, data });

  await prisma.restaurantChange.createMany({
    data: Object.entries(data).map(([field, value]) => ({
      restaurantId: id,
      field,
      value: Array.isArray(value) ? value.join(" | ") : String(value),
      source: "admin",
    })),
  });

  return NextResponse.json({ ok: true });
}
