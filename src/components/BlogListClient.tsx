"use client";

import { useMemo, useState } from "react";
import type { Post } from "@/lib/notion";
import { PostCard } from "@/components/PostCard";

export function BlogListClient({ posts }: { posts: Post[] }) {
  const categories = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((post) => {
      if (post.category) set.add(post.category);
    });
    return ["全部 / All", ...Array.from(set)];
  }, [posts]);

  const [active, setActive] = useState(categories[0]);

  const filtered = useMemo(() => {
    if (active === "全部 / All") return posts;
    return posts.filter((post) => post.category === active);
  }, [active, posts]);

  return (
    <div className="blog-list">
      <div className="category-filter">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`category-pill${active === category ? " active" : ""}`}
            onClick={() => setActive(category)}
            aria-pressed={active === category}
          >
            {category}
          </button>
        ))}
      </div>
      {filtered.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
