import type { Post } from "./notion";

export type SearchIndexItem = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  date: string;
  tags: string[];
  cover: string;
};

export type SearchIndex = {
  posts: SearchIndexItem[];
};

export function buildSearchIndex(posts: Post[]): SearchIndex {
  return {
    posts: posts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      summary: post.summary,
      category: post.category,
      date: post.date,
      tags: post.tags,
      cover: post.cover,
    })),
  };
}
