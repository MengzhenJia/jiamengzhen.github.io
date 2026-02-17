import { getAboutBlocks } from "@/lib/notion";
import { NotionRenderer } from "@/lib/notion-renderer";

export const revalidate = 600;

export default async function AboutPage() {
  const blocks = await getAboutBlocks();

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">About</h1>
        <p className="text-sm text-zinc-600">来自 Notion 的简介内容</p>
      </header>
      <NotionRenderer blocks={blocks} textOnly />
    </section>
  );
}
