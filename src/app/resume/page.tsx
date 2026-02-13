import { getPageMarkdown, getResumePageId } from "@/lib/notion";
import { NotionMarkdown } from "@/lib/notion-render";

export const dynamic = "force-static";

export default async function ResumePage() {
  const markdown = await getPageMarkdown(getResumePageId());

  return (
    <div className="container">
      <section className="hero">
        <h1>简历 / Resume</h1>
        <p>我的研究、工作与出版记录。</p>
      </section>
      <section className="prose">
        <NotionMarkdown content={markdown} />
      </section>
    </div>
  );
}
