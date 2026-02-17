import { notFound } from "next/navigation";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/notion";
import { NotionRenderer } from "@/lib/notion-renderer";

export const revalidate = 600;

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
  }).format(date);
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          {post.title}
        </h1>
        <div className="text-xs text-zinc-500">
          {formatDate(post.createdTime)}
        </div>
      </header>
      <NotionRenderer blocks={post.blocks} />
    </article>
  );
}
