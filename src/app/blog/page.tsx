import Link from "next/link";
import { getBlogPosts } from "@/lib/notion";

export const revalidate = 600;

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
  }).format(date);
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Blog</h1>
        <p className="text-sm text-zinc-600">来自 Notion 的文章列表</p>
      </header>

      {posts.length === 0 ? (
        <p className="text-sm text-zinc-500">暂无内容</p>
      ) : (
        <ul className="space-y-6">
          {posts.map((post) => (
            <li key={post.id} className="space-y-2">
              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                <span>{formatDate(post.createdTime)}</span>
                {post.tags.length > 0 ? (
                  <span className="text-zinc-400">
                    {post.tags.join(" · ")}
                  </span>
                ) : null}
              </div>
              <Link
                href={`/blog/${post.slug}`}
                className="text-lg font-semibold text-zinc-900 hover:underline"
              >
                {post.title}
              </Link>
              {post.reference ? (
                <p className="text-sm leading-6 text-zinc-600">
                  {post.reference}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
