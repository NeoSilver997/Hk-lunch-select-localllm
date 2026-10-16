import Link from "next/link";

export function Tabs({ active }: { active: "search" | "lunch" }) {
  return (
    <nav className="mb-4 flex gap-2">
      <Link
        href="/"
        className={`px-3 py-2 rounded-md border ${active === "search" ? "bg-gray-900 text-white" : "bg-white text-gray-700 border-gray-200"}`}
      >
        搵餐廳
      </Link>
      <Link
        href="/lunch"
        className={`px-3 py-2 rounded-md border ${active === "lunch" ? "bg-gray-900 text-white" : "bg-white text-gray-700 border-gray-200"}`}
      >
        食晏揀
      </Link>
    </nav>
  );
}
