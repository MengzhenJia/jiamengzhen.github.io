import Head from "next/head";
import type { GetStaticProps } from "next";
import { getPageMarkdown, getResumePageId } from "@/lib/notion";
import { NotionMarkdown } from "@/lib/notion-render";

type ResumeProps = {
  markdown: string;
};

export const getStaticProps: GetStaticProps<ResumeProps> = async () => {
  const markdown = await getPageMarkdown(getResumePageId());
  return {
    props: {
      markdown,
    },
  };
};

export default function ResumePage({ markdown }: ResumeProps) {
  return (
    <>
      <Head>
        <title>简历 / Resume</title>
      </Head>
      <div className="container">
        <section className="hero">
          <h1>简历 / Resume</h1>
          <p>我的研究、工作与出版记录。</p>
        </section>
        <section className="prose">
          <NotionMarkdown content={markdown} />
        </section>
      </div>
    </>
  );
}
