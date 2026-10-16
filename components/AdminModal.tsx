"use client";

import { useState } from "react";
import { CUISINE_OPTIONS } from "../lib/cuisines";

type Restaurant = {
  id: string;
  nameZh: string | null;
  nameEn: string | null;
  address: string;
  district: string;
  cuisines: string[];
  priceMin: number | null;
  priceMax: number | null;
  seats: number | null;
  rating: number | null;
  phone: string | null;
  hours: string | null;
  hidden: boolean;
  closed: boolean;
  visited: boolean;
};

export function AdminModal({ restaurant }: { restaurant: Restaurant }) {
  const [open, setOpen] = useState(false);
  const [secret, setSecret] = useState("");
  const [status, setStatus] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    const body: Record<string, unknown> = {};
    for (const [k, v] of fd.entries()) {
      if (k === "secret") continue;
      if (v === "") continue;
      if (k === "cuisines") body[k] = String(v).split(",").map((s) => s.trim()).filter(Boolean);
      else if (["priceMin", "priceMax", "seats", "rating"].includes(k)) body[k] = Number(v);
      else if (["hidden", "closed", "visited"].includes(k)) body[k] = v === "true";
      else body[k] = v;
    }

    const res = await fetch(`/api/admin/restaurants/${restaurant.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", "x-admin-secret": secret },
      body: JSON.stringify(body),
    });

    setStatus(res.ok ? "已更新" : `錯誤 ${res.status}`);
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="px-3 py-2 rounded-md border border-gray-200 bg-white text-gray-900">
        Admin
      </button>
    );
  }

  return (
    <div className="border border-gray-200 rounded-md p-4 bg-white text-gray-900 mt-4">
      <div className="flex justify-between mb-3">
        <h2 className="font-medium">Admin 編輯</h2>
        <button onClick={() => setOpen(false)} className="text-gray-700">
          關
        </button>
      </div>

      <form onSubmit={submit} className="space-y-2">
        <input name="secret" placeholder="x-admin-secret" className="w-full border border-gray-200 rounded px-3 py-2" />

        <div className="flex gap-2">
          <input name="nameZh" defaultValue={restaurant.nameZh ?? ""} placeholder="中文名" className="flex-1 border border-gray-200 rounded px-3 py-2" />
          <input name="nameEn" defaultValue={restaurant.nameEn ?? ""} placeholder="英文名" className="flex-1 border border-gray-200 rounded px-3 py-2" />
        </div>

        <input name="address" defaultValue={restaurant.address} placeholder="地址" className="w-full border border-gray-200 rounded px-3 py-2" />

        <select name="cuisineMain" className="w-full border border-gray-200 rounded px-3 py-2 bg-white">
          {CUISINE_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input name="cuisines" defaultValue={restaurant.cuisines.join(", ")} placeholder="全部菜式（comma 分隔）" className="w-full border border-gray-200 rounded px-3 py-2" />

        <div className="flex gap-2">
          <input name="priceMin" type="number" defaultValue={restaurant.priceMin ?? ""} placeholder="人均最低" className="w-28 border border-gray-200 rounded px-3 py-2" />
          <input name="priceMax" type="number" defaultValue={restaurant.priceMax ?? ""} placeholder="人均最高" className="w-28 border border-gray-200 rounded px-3 py-2" />
          <input name="seats" type="number" defaultValue={restaurant.seats ?? ""} placeholder="座位" className="w-24 border border-gray-200 rounded px-3 py-2" />
          <input name="rating" type="number" step="0.1" defaultValue={restaurant.rating ?? ""} placeholder="評分" className="w-24 border border-gray-200 rounded px-3 py-2" />
        </div>

        <input name="hours" defaultValue={restaurant.hours ?? ""} placeholder="營業時間" className="w-full border border-gray-200 rounded px-3 py-2" />

        <div className="flex gap-3 text-sm">
          <label className="flex items-center gap-1">
            <input name="hidden" type="checkbox" value="true" defaultChecked={restaurant.hidden} /> hidden
          </label>
          <label className="flex items-center gap-1">
            <input name="closed" type="checkbox" value="true" defaultChecked={restaurant.closed} /> 結業
          </label>
          <label className="flex items-center gap-1">
            <input name="visited" type="checkbox" value="true" defaultChecked={restaurant.visited} /> 去過
          </label>
        </div>

        <button type="submit" className="px-3 py-2 rounded-md bg-gray-900 text-white">
          保存
        </button>
        {status && <span className="text-sm text-gray-700 ml-2">{status}</span>}
      </form>
    </div>
  );
}
