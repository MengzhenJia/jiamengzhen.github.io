import { SearchClient } from "@/components/SearchClient";

export const dynamic = "force-static";

export default function SearchPage() {
  return (
    <div className="container">
      <section className="hero">
        <h1>搜索 / Search</h1>
        <p>基于标题、摘要、分类与标签进行检索。</p>
      </section>
      <section className="section">
        <SearchClient />
      </section>
    </div>
  );
}
