"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { SearchIndexItem } from "@/lib/search-index";
import { getSafeCategorySlug } from "@/lib/slug";

function includes(text: string, query: string) {
  return text.toLowerCase().includes(query.toLowerCase());
}

export function SearchClient() {
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<SearchIndexItem[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "done">(
    "idle"
  );

  useEffect(() => {
    let active = true;
    setStatus("loading");
    fetch("/search.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load search index");
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        setPosts(data.posts || []);
        setStatus("done");
      })
      .catch(() => {
        if (!active) return;
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, []);

  const results = useMemo(() => {
    if (!query) return posts;
    return posts.filter((post) => {
      const haystack = [
        post.title,
        post.summary,
        post.category,
        post.tags.join(" "),
      ].join(" ");
      return includes(haystack, query);
    });
  }, [posts, query]);

  return (
    <div className="search-panel">
      <label className="search-label" htmlFor="search">
        搜索 / Search
      </label>
      <input
        id="search"
        className="search-input"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="输入关键词 / Type keywords"
      />
      {status === "loading" ? <p>正在加载索引...</p> : null}
      {status === "error" ? (
        <p>搜索索引未生成，请先运行构建。</p>
      ) : null}
      <div className="search-results">
        {results.map((post) => {
          const categorySlug = getSafeCategorySlug(post.category);
          return (
            <Link
              key={post.id}
              className="search-result"
              href={`/blog/${categorySlug}/${post.slug}`}
            >
              <span className="search-title">{post.title}</span>
              <span className="search-meta">
                {post.category} · {post.tags.join(" / ")}
              </span>
            </Link>
          );
        })}
        {status === "done" && results.length === 0 ? (
          <p>没有匹配结果。</p>
        ) : null}
      </div>
    </div>
  );
}
