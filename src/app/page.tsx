import Link from "next/link";

export default function Home() {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
          Home
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          你好，欢迎来到我的世界。
        </h1>
        <p className="text-base leading-7 text-zinc-600">
          这里是我的个人网站，包含博客与简介。博客内容来自 Notion，
          会自动同步更新。
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/blog"
          className="rounded-full border border-zinc-200 px-4 py-2 text-sm text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-900"
        >
          进入博客
        </Link>
        <Link
          href="/about"
          className="rounded-full border border-zinc-200 px-4 py-2 text-sm text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-900"
        >
          查看简介
        </Link>
      </div>
    </section>
  );
}
