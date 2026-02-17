import type {
  BlockObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";
import React, { Fragment } from "react";

type RendererProps = {
  blocks: BlockObjectResponse[];
  textOnly?: boolean;
};

type ListItemBlock = Extract<
  BlockObjectResponse,
  { type: "bulleted_list_item" | "numbered_list_item" }
>;

function renderTextWithBreaks(text: string) {
  const parts = text.split("\n");
  return parts.map((part, index) => (
    <Fragment key={`${part}-${index}`}>
      {part}
      {index < parts.length - 1 ? <br /> : null}
    </Fragment>
  ));
}

function applyAnnotations(
  content: React.ReactNode,
  annotations: RichTextItemResponse["annotations"],
) {
  let node = content;
  if (annotations.code) {
    node = (
      <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm">
        {node}
      </code>
    );
  }
  if (annotations.bold) {
    node = <strong>{node}</strong>;
  }
  if (annotations.italic) {
    node = <em>{node}</em>;
  }
  if (annotations.underline) {
    node = <u>{node}</u>;
  }
  if (annotations.strikethrough) {
    node = <s>{node}</s>;
  }
  return node;
}

function renderRichText(
  richText: RichTextItemResponse[],
  textOnly: boolean,
) {
  return richText.map((item, index) => {
    const content = renderTextWithBreaks(item.plain_text);
    const annotated = applyAnnotations(content, item.annotations);

    if (!textOnly && item.href) {
      return (
        <a
          key={`${item.plain_text}-${index}`}
          href={item.href}
          className="underline decoration-zinc-300 underline-offset-4 hover:text-zinc-900"
          target="_blank"
          rel="noreferrer"
        >
          {annotated}
        </a>
      );
    }

    return (
      <Fragment key={`${item.plain_text}-${index}`}>{annotated}</Fragment>
    );
  });
}

function groupListBlocks(blocks: BlockObjectResponse[]) {
  const groups: Array<{
    type: "ul" | "ol" | "block";
    items?: ListItemBlock[];
    block?: BlockObjectResponse;
  }> = [];

  let index = 0;
  while (index < blocks.length) {
    const block = blocks[index];
    if (
      block.type === "bulleted_list_item" ||
      block.type === "numbered_list_item"
    ) {
      const listType = block.type === "bulleted_list_item" ? "ul" : "ol";
      const items: ListItemBlock[] = [];

      while (
        index < blocks.length &&
        blocks[index].type === block.type
      ) {
        items.push(blocks[index] as ListItemBlock);
        index += 1;
      }

      groups.push({ type: listType, items });
    } else {
      groups.push({ type: "block", block });
      index += 1;
    }
  }

  return groups;
}

function getListItemRichText(item: ListItemBlock) {
  return item.type === "bulleted_list_item"
    ? item.bulleted_list_item.rich_text
    : item.numbered_list_item.rich_text;
}

function renderBlock(
  block: BlockObjectResponse,
  textOnly: boolean,
) {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="leading-7 text-zinc-700">
          {renderRichText(block.paragraph.rich_text, textOnly)}
        </p>
      );
    case "heading_1":
      return (
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          {renderRichText(block.heading_1.rich_text, textOnly)}
        </h1>
      );
    case "heading_2":
      return (
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
          {renderRichText(block.heading_2.rich_text, textOnly)}
        </h2>
      );
    case "heading_3":
      return (
        <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
          {renderRichText(block.heading_3.rich_text, textOnly)}
        </h3>
      );
    case "quote":
      return (
        <blockquote className="border-l-2 border-zinc-200 pl-4 text-zinc-600">
          {renderRichText(block.quote.rich_text, textOnly)}
        </blockquote>
      );
    case "code":
      return (
        <pre className="overflow-x-auto rounded-md bg-zinc-950 p-4 text-sm text-zinc-100">
          <code>{block.code.rich_text.map((item) => item.plain_text).join("")}</code>
        </pre>
      );
    case "image": {
      if (textOnly) {
        return null;
      }
      const source =
        block.image.type === "file"
          ? block.image.file.url
          : block.image.external.url;
      return (
        <figure className="space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={source} alt="" className="rounded-md" />
          {block.image.caption.length > 0 ? (
            <figcaption className="text-sm text-zinc-500">
              {renderRichText(block.image.caption, textOnly)}
            </figcaption>
          ) : null}
        </figure>
      );
    }
    default:
      return null;
  }
}

export function NotionRenderer({ blocks, textOnly = false }: RendererProps) {
  const grouped = groupListBlocks(blocks);

  return (
    <div className="space-y-5">
      {grouped.map((group, index) => {
        if (group.type === "block" && group.block) {
          return (
            <div key={`${group.block.id}-${index}`}>
              {renderBlock(group.block, textOnly)}
            </div>
          );
        }

        if (group.items && group.items.length > 0) {
          const ListTag = group.type === "ol" ? "ol" : "ul";
          const listClass =
            group.type === "ol" ? "list-decimal" : "list-disc";
          return (
            <ListTag
              key={`${group.type}-${index}`}
              className={`list-inside ${listClass} space-y-2 text-zinc-700`}
            >
              {group.items.map((item) => (
                <li key={item.id}>
                  {renderRichText(getListItemRichText(item), textOnly)}
                </li>
              ))}
            </ListTag>
          );
        }

        return null;
      })}
    </div>
  );
}
