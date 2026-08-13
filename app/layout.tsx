import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const themeInitializationScript = `
  (() => {
    const fallback = "midnight";
    const allowed = new Set(["midnight", "warm-light", "warm-dark"]);
    let theme = fallback;
    try {
      const stored = window.localStorage.getItem("ant-vigil-theme");
      if (stored && allowed.has(stored)) theme = stored;
    } catch {}
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme =
      theme === "warm-light" ? "light" : "dark";
  })();
`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "小火蚁智能监测",
  description: "小火蚁智能监测平台安全登录入口",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      data-theme="midnight"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializationScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
