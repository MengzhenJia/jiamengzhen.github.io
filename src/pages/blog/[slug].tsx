import type { GetStaticPaths, GetStaticProps } from "next";
import { getAllPosts, getPageMarkdown, type Post } from "@/lib/notion";
import { NotionMarkdown } from "@/lib/notion-render";

type BlogDetailProps = {
  post: Post;
  markdown: string;
};

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getAllPosts();
  return {
    paths: posts.map((post) => ({ params: { slug: post.slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<BlogDetailProps> = async (
  context
) => {
  const slug = context.params?.slug as string;
  const posts = await getAllPosts();
  const post = posts.find((item) => item.slug === slug);

  if (!post) {
    return { notFound: true };
  }

  const markdown = await getPageMarkdown(post.id);

  return {
    props: {
      post,
      markdown,
    },
  };
};

export default function BlogDetailPage({ post, markdown }: BlogDetailProps) {
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
