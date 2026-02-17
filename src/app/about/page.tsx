import { getAboutBlocks } from "@/lib/notion";
import { NotionRenderer } from "@/lib/notion-renderer";

export const revalidate = 600;

export default async function AboutPage() {
  const blocks = await getAboutBlocks();

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">About</h1>
      </header>
      <NotionRenderer blocks={blocks} textOnly />
    </section>
  );
}
