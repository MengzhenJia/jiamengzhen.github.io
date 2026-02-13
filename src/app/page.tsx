import { PostCard } from "@/components/PostCard";
import { site } from "@/data/site";
import { getAllPosts, getHomePageId, getPageMarkdown } from "@/lib/notion";
import { NotionMarkdown } from "@/lib/notion-render";

export const dynamic = "force-static";

export default async function HomePage() {
  const [markdown, posts] = await Promise.all([
    getPageMarkdown(getHomePageId()),
    getAllPosts(),
  ]);

  const latest = posts.slice(0, 3);

  return (
    <div className="container">
      <section className="hero">
        <h1>{site.name}</h1>
        <p>
          {site.titleZh} / {site.titleEn} · {site.description}
        </p>
        <div className="hero-card prose fade-up">
          <NotionMarkdown content={markdown} />
        </div>
      </section>

      <section className="section">
        <div className="blog-header">
          <h2 className="section-title">最新文章 / Latest Posts</h2>
        </div>
        <div className="grid-2">
          {latest.length ? (
            latest.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <p>暂无已发布文章。</p>
          )}
        </div>
      </section>
    </div>
  );
}
