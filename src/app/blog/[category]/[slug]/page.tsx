import { notFound } from "next/navigation";
import { getAllPosts, getPageMarkdown } from "@/lib/notion";
import { getSafeCategorySlug } from "@/lib/slug";
import { NotionMarkdown } from "@/lib/notion-render";

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    category: getSafeCategorySlug(post.category),
    slug: post.slug,
  }));
}

export default async function BlogDetailPage({
  params,
}: {
  params: { category: string; slug: string };
}) {
  const posts = await getAllPosts();
  const post = posts.find(
    (item) =>
      item.slug === params.slug &&
      getSafeCategorySlug(item.category) === params.category
  );

  if (!post) {
    notFound();
  }

  const markdown = await getPageMarkdown(post.id);

  return (
    <div className="container">
      <section className="hero">
        <h1>{post.title}</h1>
        <p>
          {post.category}
          {post.tags.length ? ` · ${post.tags.join(" / ")}` : ""}
        </p>
      </section>
      <section className="prose">
        <NotionMarkdown content={markdown} />
      </section>
    </div>
  );
}
