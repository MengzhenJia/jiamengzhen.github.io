import Head from "next/head";
import { SearchClient } from "@/components/SearchClient";

export default function SearchPage() {
  return (
    <>
      <Head>
        <title>搜索 / Search</title>
      </Head>
      <div className="container">
        <section className="hero">
          <h1>搜索 / Search</h1>
          <p>基于标题、摘要、分类与标签进行检索。</p>
        </section>
        <section className="section">
          <SearchClient />
        </section>
      </div>
    </>
  );
}
