import { source } from "./docs-source";
import type { SearchEntry } from "@/components/docs/search";

function sectionLabel(slug?: string): string {
  if (!slug) return "Docs";
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

/** Flat, serializable search index built at render time from the docs source. */
export function getSearchIndex(): SearchEntry[] {
  return source.getPages().map((page) => ({
    url: page.url,
    title: page.data.title,
    description: page.data.description,
    section: sectionLabel(page.slugs[0]),
    headings: (page.data.toc ?? [])
      .filter((t) => typeof t.title === "string")
      .map((t) => ({ text: t.title as string, url: `${page.url}${t.url}` })),
  }));
}
