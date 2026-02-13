import fs from "node:fs/promises";
import path from "node:path";
import { Client } from "@notionhq/client";

const REQUIRED_ENVS = ["NOTION_TOKEN", "NOTION_BLOG_DB_ID"];

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

function slugify(value) {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-\u4e00-\u9fa5]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getRichText(property) {
  if (!property || !Array.isArray(property.rich_text)) return "";
  return property.rich_text.map((t) => t.plain_text).join("");
}

function getTitle(property) {
  if (!property || !Array.isArray(property.title)) return "";
  return property.title.map((t) => t.plain_text).join("");
}

function getDate(property, fallback) {
  if (property?.date?.start) return property.date.start;
  return fallback;
}

function getTags(property) {
  if (!property) return [];
  if (Array.isArray(property.multi_select)) {
    return property.multi_select.map((t) => t.name);
  }
  if (property.select?.name) return [property.select.name];
  return [];
}

function getCategory(property) {
  if (!property) return "";
  if (property.select?.name) return property.select.name;
  if (Array.isArray(property.multi_select) && property.multi_select[0]) {
    return property.multi_select[0].name;
  }
  const text = getRichText(property);
  return text;
}

function getCover(property) {
  if (!property || !Array.isArray(property.files) || !property.files[0]) return "";
  const file = property.files[0];
  if (file.type === "external") return file.external.url;
  if (file.type === "file") return file.file.url;
  return "";
}

async function fetchAllPages(notion, databaseId) {
  let cursor = undefined;
  const pages = [];

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
    cursor = response.next_cursor;
  }

  return pages;
}

async function main() {
  REQUIRED_ENVS.forEach(getRequiredEnv);

  const notion = new Client({ auth: getRequiredEnv("NOTION_TOKEN") });
  const databaseId = getRequiredEnv("NOTION_BLOG_DB_ID");

  const pages = await fetchAllPages(notion, databaseId);

  const posts = pages.map((page) => {
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

  const outputPath = path.join(process.cwd(), "public", "search.json");
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify({ posts }, null, 2), "utf8");

  console.log(`Search index written: ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
