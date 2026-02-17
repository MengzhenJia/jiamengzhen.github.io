import { Client } from "@notionhq/client";
import type {
  BlockObjectResponse,
  DatabaseObjectResponse,
  DataSourceObjectResponse,
  PageObjectResponse,
  PartialBlockObjectResponse,
  PartialPageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const BLOG_DB_ID = process.env.NOTION_BLOG_DB_ID;
const ABOUT_PAGE_ID = process.env.NOTION_ABOUT_PAGE_ID;
type QueryDataSourceArgs = Parameters<Client["dataSources"]["query"]>[0];

const BLOG_PROPERTIES = {
  title: "Name",
  created: "Created",
  status: "Status",
  tags: "Tags",
  reference: "reference",
  slug: "Slug",
};

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  createdTime: string;
  tags: string[];
  reference?: string;
};

type BlogPostWithBlocks = BlogPost & {
  blocks: BlockObjectResponse[];
};

let cachedBlogDatabase: DatabaseObjectResponse | null = null;
let cachedBlogDataSource: DataSourceObjectResponse | null = null;

function requireEnv(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`缺少环境变量 ${name}`);
  }
  return value;
}

function isFullPage(
  page: PageObjectResponse | PartialPageObjectResponse,
): page is PageObjectResponse {
  return "properties" in page;
}

function isPageResult(
  result:
    | PageObjectResponse
    | PartialPageObjectResponse
    | DataSourceObjectResponse
    | { object: string },
): result is PageObjectResponse | PartialPageObjectResponse {
  return result.object === "page";
}

function isFullBlock(
  block: BlockObjectResponse | PartialBlockObjectResponse,
): block is BlockObjectResponse {
  return "type" in block;
}

function richTextToPlain(richText: Array<{ plain_text: string }>) {
  return richText.map((item) => item.plain_text).join("");
}

async function getBlogDatabase() {
  if (cachedBlogDatabase) {
    return cachedBlogDatabase;
  }
  const databaseId = requireEnv(BLOG_DB_ID, "NOTION_BLOG_DB_ID");
  const database = (await notion.databases.retrieve({
    database_id: databaseId,
  })) as DatabaseObjectResponse;
  cachedBlogDatabase = database;
  return database;
}

async function getBlogDataSource() {
  if (cachedBlogDataSource) {
    return cachedBlogDataSource;
  }
  const database = await getBlogDatabase();
  const dataSourceId = database.data_sources[0]?.id;
  if (!dataSourceId) {
    throw new Error("博客数据库缺少可用 data source");
  }
  const dataSource = (await notion.dataSources.retrieve({
    data_source_id: dataSourceId,
  })) as DataSourceObjectResponse;
  cachedBlogDataSource = dataSource;
  return dataSource;
}

async function queryDataSourceAll(
  dataSourceId: string,
  params: Omit<QueryDataSourceArgs, "data_source_id">,
) {
  const results: Array<PageObjectResponse | PartialPageObjectResponse> = [];
  let cursor: string | undefined = undefined;

  do {
    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      start_cursor: cursor,
      ...params,
    });
    response.results.forEach((result) => {
      if (isPageResult(result)) {
        results.push(result);
      }
    });
    cursor = response.next_cursor ?? undefined;
  } while (cursor);

  return results;
}

function getTitle(
  page: PageObjectResponse,
  propertyName: string,
  fallback: string,
) {
  const prop = page.properties[propertyName];
  if (!prop || prop.type !== "title") {
    return fallback;
  }
  return richTextToPlain(prop.title) || fallback;
}

function getRichText(
  page: PageObjectResponse,
  propertyName: string,
) {
  const prop = page.properties[propertyName];
  if (!prop) {
    return undefined;
  }
  if (prop.type === "rich_text") {
    return richTextToPlain(prop.rich_text) || undefined;
  }
  if (prop.type === "title") {
    return richTextToPlain(prop.title) || undefined;
  }
  return undefined;
}

function getTags(page: PageObjectResponse, propertyName: string) {
  const prop = page.properties[propertyName];
  if (!prop || prop.type !== "multi_select") {
    return [];
  }
  return prop.multi_select.map((item) => item.name);
}

function getCreatedTime(page: PageObjectResponse, propertyName: string) {
  const prop = page.properties[propertyName];
  if (!prop) {
    return page.created_time;
  }
  if (prop.type === "created_time") {
    return prop.created_time;
  }
  if (prop.type === "date" && prop.date?.start) {
    return prop.date.start;
  }
  return page.created_time;
}

function getSlug(page: PageObjectResponse, propertyName: string) {
  const slug = getRichText(page, propertyName);
  return slug?.trim() || page.id;
}

function isPublished(
  page: PageObjectResponse,
  propertyName: string,
  publishedValue: string | null,
) {
  if (!publishedValue) {
    return true;
  }
  const prop = page.properties[propertyName];
  if (!prop) {
    return true;
  }
  if (prop.type === "status") {
    return prop.status?.name === publishedValue;
  }
  if (prop.type === "select") {
    return prop.select?.name === publishedValue;
  }
  return true;
}

function getPublishedStatusValue(
  statusProperty: DataSourceObjectResponse["properties"][string] | undefined,
) {
  if (!statusProperty) {
    return null;
  }
  if (statusProperty.type === "status") {
    const optionNames = statusProperty.status.options.map((option) => option.name);
    return optionNames.includes("Published") ? "Published" : null;
  }
  if (statusProperty.type === "select") {
    const optionNames = statusProperty.select.options.map((option) => option.name);
    return optionNames.includes("Published") ? "Published" : null;
  }
  return null;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  requireEnv(BLOG_DB_ID, "NOTION_BLOG_DB_ID");
  const dataSource = await getBlogDataSource();
  const statusProperty = dataSource.properties[BLOG_PROPERTIES.status];
  const hasStatus = Boolean(statusProperty);
  const hasCreated = BLOG_PROPERTIES.created in dataSource.properties;
  const publishedStatus = getPublishedStatusValue(statusProperty);
  if (hasStatus && !publishedStatus) {
    return [];
  }

  const filter: QueryDataSourceArgs["filter"] | undefined = hasStatus && publishedStatus
    ? statusProperty.type === "select"
      ? {
          property: BLOG_PROPERTIES.status,
          select: {
            equals: publishedStatus,
          },
        }
      : {
          property: BLOG_PROPERTIES.status,
          status: {
            equals: publishedStatus,
          },
        }
    : undefined;

  const sorts: QueryDataSourceArgs["sorts"] = hasCreated
    ? [
        {
          property: BLOG_PROPERTIES.created,
          direction: "descending",
        },
      ]
    : [
        {
          timestamp: "created_time",
          direction: "descending",
        },
      ];

  const results = await queryDataSourceAll(dataSource.id, {
    filter,
    sorts,
  });

  return results
    .filter(isFullPage)
    .filter((page) =>
      isPublished(page, BLOG_PROPERTIES.status, publishedStatus),
    )
    .map((page) => ({
      id: page.id,
      title: getTitle(page, BLOG_PROPERTIES.title, "Untitled"),
      slug: getSlug(page, BLOG_PROPERTIES.slug),
      createdTime: getCreatedTime(page, BLOG_PROPERTIES.created),
      tags: getTags(page, BLOG_PROPERTIES.tags),
      reference: getRichText(page, BLOG_PROPERTIES.reference),
    }));
}

export async function getBlogPostBySlug(
  slug: string,
): Promise<BlogPostWithBlocks | null> {
  const posts = await getBlogPosts();
  const post = posts.find((item) => item.slug === slug || item.id === slug);
  if (!post) {
    return null;
  }
  const blocks = await getPageBlocks(post.id);
  return {
    ...post,
    blocks,
  };
}

export async function getPageBlocks(pageId: string) {
  const blocks: BlockObjectResponse[] = [];
  let cursor: string | undefined = undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
      page_size: 100,
    });
    response.results.forEach((block) => {
      if (isFullBlock(block)) {
        blocks.push(block);
      }
    });
    cursor = response.next_cursor ?? undefined;
  } while (cursor);

  return blocks;
}

export async function getAboutBlocks() {
  const pageId = requireEnv(ABOUT_PAGE_ID, "NOTION_ABOUT_PAGE_ID");
  return getPageBlocks(pageId);
}
