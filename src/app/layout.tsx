import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Jia Mengzhen",
    template: "%s | Jia Mengzhen",
  },
  description: "个人网站与博客",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-white text-zinc-900">
          <header className="border-b border-zinc-100">
            <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-6">
              <Link href="/" className="text-base font-semibold">
                Jia Mengzhen
              </Link>
              <nav className="flex items-center gap-4 text-sm text-zinc-600">
                <Link href="/blog" className="hover:text-zinc-900">
                  Blog
                </Link>
                <Link href="/about" className="hover:text-zinc-900">
                  About
                </Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-3xl px-4 py-10">{children}</main>
          <footer className="border-t border-zinc-100">
            <div className="mx-auto max-w-3xl px-4 py-8 text-xs text-zinc-500">
              © {new Date().getFullYear()} Jia Mengzhen
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
