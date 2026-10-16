import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "搵餐廳｜將軍澳",
  description: "大角咀／將軍澳午餐餐廳搜尋、人均、食晏揀",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-HK">
      <body>
        <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
