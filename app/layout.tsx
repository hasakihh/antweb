import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  createThemeInitializationScript,
  DEFAULT_APP_THEME,
} from "@/components/theme/theme-config";
import "./globals.css";

const themeInitializationScript = createThemeInitializationScript();

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
      data-theme={DEFAULT_APP_THEME}
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
