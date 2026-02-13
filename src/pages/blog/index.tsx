import Head from "next/head";
import type { GetStaticProps } from "next";
import { BlogListClient } from "@/components/BlogListClient";
import { getAllPosts, type Post } from "@/lib/notion";

type BlogIndexProps = {
  posts: Post[];
};

export const getStaticProps: GetStaticProps<BlogIndexProps> = async () => {
  const posts = await getAllPosts();
  return {
    props: {
      posts,
    },
  };
};

export default function BlogPage({ posts }: BlogIndexProps) {
  return (
    <>
      <Head>
        <title>博客 / Blog</title>
      </Head>
      <div className="container">
        <section className="hero">
          <h1>博客 / Blog</h1>
          <p>分类浏览我的文章、研究笔记与阅读记录。</p>
        </section>
        <section className="section">
          {posts.length ? <BlogListClient posts={posts} /> : <p>暂无已发布文章。</p>}
        </section>
      </div>
    </>
  );
}
