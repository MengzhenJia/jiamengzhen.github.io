import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import { slugify } from "@/lib/slug";

export type Post = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  date: string;
  tags: string[];
  cover: string;
};

const REQUIRED_ENVS = [
  "NOTION_TOKEN",
  "NOTION_BLOG_DB_ID",
  "NOTION_HOME_PAGE_ID",
  "NOTION_RESUME_PAGE_ID",
];

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

function getRichText(property: any) {
  if (!property || !Array.isArray(property.rich_text)) return "";
  return property.rich_text.map((t: any) => t.plain_text).join("");
}

function getTitle(property: any) {
  if (!property || !Array.isArray(property.title)) return "";
  return property.title.map((t: any) => t.plain_text).join("");
}

function getDate(property: any, fallback: string) {
  if (property?.date?.start) return property.date.start as string;
  return fallback;
}

function getTags(property: any) {
  if (!property) return [] as string[];
  if (Array.isArray(property.multi_select)) {
    return property.multi_select.map((t: any) => t.name);
  }
  if (property.select?.name) return [property.select.name];
  return [] as string[];
}

function getCategory(property: any) {
  if (!property) return "";
  if (property.select?.name) return property.select.name as string;
  if (Array.isArray(property.multi_select) && property.multi_select[0]) {
    return property.multi_select[0].name as string;
  }
  const text = getRichText(property);
  return text;
}

function getCover(property: any) {
  if (!property || !Array.isArray(property.files) || !property.files[0]) return "";
  const file = property.files[0];
  if (file.type === "external") return file.external.url as string;
  if (file.type === "file") return file.file.url as string;
  return "";
}

function getNotionClient() {
  REQUIRED_ENVS.forEach(getRequiredEnv);
  return new Client({ auth: getRequiredEnv("NOTION_TOKEN") });
}

async function fetchAllPages(notion: Client, databaseId: string) {
  let cursor: string | undefined = undefined;
  const pages: any[] = [];

  while (true) {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      filter: {
        property: "Status",
        status: {
          equals: "Published",
        },
      },
      sorts: [
        {
          property: "created",
          direction: "descending",
        },
      ],
    });

    pages.push(...response.results);

    if (!response.has_more) break;
    cursor = response.next_cursor ?? undefined;
  }

  return pages;
}

export async function getAllPosts(): Promise<Post[]> {
  const notion = getNotionClient();
  const databaseId = getRequiredEnv("NOTION_BLOG_DB_ID");
  const pages = await fetchAllPages(notion, databaseId);

  return pages.map((page: any) => {
    const props = page.properties || {};
    const title = getTitle(props.name);
    const slug = getRichText(props.Slug) || slugify(title);
    const summary = getRichText(props.Summary);
    const category = getCategory(props.reference);
    const date = getDate(props.created, page.created_time);
    const tags = getTags(props.tags);
    const cover = getCover(props.Cover);

    return {
      id: page.id,
      title,
      slug,
      summary,
      category,
      date,
      tags,
      cover,
    };
  });
}

export async function getPostBySlug(category: string, slug: string) {
  const posts = await getAllPosts();
  return posts.find((post) => post.slug === slug && post.category === category);
}

export async function getPageMarkdown(pageId: string) {
  const notion = getNotionClient();
  const n2m = new NotionToMarkdown({ notionClient: notion });
  const mdBlocks = await n2m.pageToMarkdown(pageId);
  const mdString = n2m.toMarkdownString(mdBlocks);
  return mdString.parent;
}

export function getHomePageId() {
  return getRequiredEnv("NOTION_HOME_PAGE_ID");
}

export function getResumePageId() {
  return getRequiredEnv("NOTION_RESUME_PAGE_ID");
}
