// 地址關鍵字：將軍澳／寶琳嘅商場同屋邨
export const MALL_KEYWORDS = [
  "將軍澳中心",
  "PopCorn",
  "東港城",
  "MONTEREY Place",
  "將軍澳廣場",
  "新都城",
  "PopCity",
  "藍塘傲",
  "PopStation",
  "厚德",
  "尚德",
  "健明",
  "翠林",
  "靈實",
  "茵怡",
  "慧安",
  "富寧",
  "順寶",
  "景嶺",
] as const;

// 冇關鍵字嘅歸入「街舖／其他」
export const OTHER_MALL = "街舖／其他";

export function mallOf(address: string): string {
  const a = address.toLowerCase();
  for (const k of MALL_KEYWORDS) {
    if (a.includes(k.toLowerCase())) return k;
  }
  return OTHER_MALL;
}
