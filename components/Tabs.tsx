import Link from "next/link";

export function Tabs({ active }: { active: "search" | "lunch" }) {
  return (
    <nav className="mb-4 flex gap-2">
      <Link href="/" className={`pill ${active === "search" ? "pill-active" : ""}`}>
        搵餐廳
      </Link>
      <Link href="/lunch" className={`pill ${active === "lunch" ? "pill-active" : ""}`}>
        食晏揀
      </Link>
    </nav>
  );
}
