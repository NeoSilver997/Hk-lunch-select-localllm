"use client";

import { useState } from "react";
import { CUISINE_OPTIONS } from "../lib/cuisines";

export type EditableRestaurant = {
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
  notes: string | null;
  licence: string | null;
  hours: string | null;
  hidden: boolean;
  closed: boolean;
  visited: boolean;
};

const NUMERIC = ["priceMin", "priceMax", "seats", "rating"];
const BOOLEAN = ["hidden", "closed", "visited"];

const field = "w-full field";

export function EditForm({ restaurant }: { restaurant: EditableRestaurant }) {
  const [secret, setSecret] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const body: Record<string, unknown> = {};
    for (const [k, v] of fd.entries()) {
      if (k === "secret") continue;
      if (k === "cuisines") {
        body[k] = String(v).split(",").map((s) => s.trim()).filter(Boolean);
      } else if (NUMERIC.includes(k)) {
        body[k] = Number(v);
      } else if (BOOLEAN.includes(k)) {
        // hidden 嘅 "false" 先入，checkbox 有剔就覆蓋成 true
        body[k] = v === "true";
      } else if (String(v).trim()) {
        body[k] = v;
      }
    }

    if (Object.keys(body).length === 0) {
      setStatus("冇嘢可改");
      return;
    }

    setBusy(true);
    const res = await fetch(`/api/admin/restaurants/${restaurant.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", "x-admin-secret": secret },
      body: JSON.stringify(body),
    });
    setStatus(res.ok ? "已更新" : `錯誤 ${res.status}`);
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="card space-y-3">
      <label className="block">
        <span className="text-sm muted">x-admin-secret</span>
        <input
          name="secret"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="ADMIN_SECRET"
          className={field}
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <input name="nameZh" defaultValue={restaurant.nameZh ?? ""} placeholder="中文名" className={field} />
        <input name="nameEn" defaultValue={restaurant.nameEn ?? ""} placeholder="英文名" className={field} />
      </div>

      <input name="address" defaultValue={restaurant.address} placeholder="地址" className={field} />
      <input name="district" defaultValue={restaurant.district} placeholder="地區" className={field} />

      <input
        name="cuisines"
        defaultValue={restaurant.cuisines.join(", ")}
        placeholder="菜式（comma 分隔）"
        list="cuisine-options"
        className={field}
      />
      <datalist id="cuisine-options">
        {CUISINE_OPTIONS.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <div className="flex flex-wrap gap-2">
        <input name="priceMin" type="number" defaultValue={restaurant.priceMin ?? ""} placeholder="人均最低" className="field w-28" />
        <input name="priceMax" type="number" defaultValue={restaurant.priceMax ?? ""} placeholder="人均最高" className="field w-28" />
        <input name="seats" type="number" defaultValue={restaurant.seats ?? ""} placeholder="座位" className="field w-24" />
        <input name="rating" type="number" step="0.1" defaultValue={restaurant.rating ?? ""} placeholder="評分" className="field w-24" />
      </div>

      <input name="phone" defaultValue={restaurant.phone ?? ""} placeholder="電話" className={field} />
      <input name="hours" defaultValue={restaurant.hours ?? ""} placeholder="營業時間" className={field} />
      <input name="licence" defaultValue={restaurant.licence ?? ""} placeholder="食環署核對" className={field} />

      <label className="block">
        <span className="text-sm muted">備註</span>
        <textarea name="notes" rows={3} defaultValue={restaurant.notes ?? ""} className={field} />
      </label>

      <div className="flex flex-wrap gap-3 text-sm">
        <label className="flex items-center gap-1">
          <input type="hidden" name="hidden" value="false" />
          <input name="hidden" type="checkbox" value="true" defaultChecked={restaurant.hidden} /> hidden
        </label>
        <label className="flex items-center gap-1">
          <input type="hidden" name="closed" value="false" />
          <input name="closed" type="checkbox" value="true" defaultChecked={restaurant.closed} /> 結業
        </label>
        <label className="flex items-center gap-1">
          <input type="hidden" name="visited" value="false" />
          <input name="visited" type="checkbox" value="true" defaultChecked={restaurant.visited} /> 去過
        </label>
      </div>

      <div className="flex items-center gap-2">
        <button type="submit" disabled={busy} className="btn disabled:opacity-50">
          保存
        </button>
        {status && <span className="text-sm muted">{status}</span>}
      </div>
    </form>
  );
}
