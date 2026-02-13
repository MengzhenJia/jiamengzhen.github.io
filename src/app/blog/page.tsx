import { BlogListClient } from "@/components/BlogListClient";
import { getAllPosts } from "@/lib/notion";

export const dynamic = "force-static";

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div className="container">
      <section className="hero">
        <h1>博客 / Blog</h1>
        <p>分类浏览我的文章、研究笔记与阅读记录。</p>
      </section>
      <section className="section">
        {posts.length ? (
          <BlogListClient posts={posts} />
        ) : (
          <p>暂无已发布文章。</p>
        )}
      </section>
    </div>
  );
}
