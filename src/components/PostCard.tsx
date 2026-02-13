"use client";

import Link from "next/link";
import type { Post } from "@/lib/notion";
import { TagPill } from "@/components/TagPill";

function formatDate(date: string) {
  if (!date) return "";
  try {
    const dt = new Date(date);
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(dt);
  } catch {
    return date;
  }
}

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="post-card fade-up">
      {post.cover ? (
        <div className="post-cover">
          <img src={post.cover} alt={post.title} loading="lazy" />
        </div>
      ) : null}
      <div className="post-card-header">
        <div className="post-meta">
          <span className="post-date">{formatDate(post.date)}</span>
          {post.category ? (
            <span className="post-category">{post.category}</span>
          ) : null}
        </div>
        <h3 className="post-title">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>
      </div>
      {post.summary ? <p className="post-summary">{post.summary}</p> : null}
      <div className="post-tags">
        {post.tags.map((tag) => (
          <TagPill key={tag} label={tag} />
        ))}
      </div>
    </article>
  );
}
