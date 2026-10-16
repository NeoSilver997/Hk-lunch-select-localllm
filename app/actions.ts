"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../lib/prisma";

export async function recordVisit(formData: FormData) {
  const id = String(formData.get("id"));
  const note = String(formData.get("note") ?? "").trim();

  await prisma.visit.create({ data: { restaurantId: id, note: note || null } });
  await prisma.restaurant.update({ where: { id }, data: { visited: true } });

  revalidatePath(`/restaurant/${id}`);
}

export async function addMenu(formData: FormData) {
  const id = String(formData.get("id"));
  const items = String(formData.get("items") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  if (items.length === 0) return;

  await prisma.menu.create({ data: { restaurantId: id, items } });
  await prisma.restaurantChange.create({
    data: { restaurantId: id, field: "menu", value: items.join(" | "), source: "public" },
  });

  revalidatePath(`/restaurant/${id}`);
}
