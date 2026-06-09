import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { findNeighbour } from "fumadocs-core/server";
import { source } from "@/lib/docs-source";
import { getMDXComponents } from "@/components/docs/mdx";
import { DocsToc } from "@/components/docs/toc";

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) return {};
  return {
    title: `${page.data.title} · WebSoroban docs`,
    description: page.data.description,
  };
}

export default async function DocsPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const toc = (page.data.toc ?? []).map((t) => ({
    title: typeof t.title === "string" ? t.title : "",
    url: t.url,
    depth: t.depth,
  }));
  const neighbours = findNeighbour(source.pageTree, page.url);

  return (
    <div className="mx-auto flex w-full max-w-5xl gap-10 px-5 py-10 lg:px-10">
      <article className="docs-prose min-w-0 max-w-[70ch] flex-1">
        <p className="mb-1 font-mono text-xs uppercase tracking-wider text-brand">
          {page.slugs.length > 1 ? page.slugs[0].replace(/-/g, " ") : "Docs"}
        </p>
        <h1>{page.data.title}</h1>
        {page.data.description && (
          <p className="!mt-2 text-base leading-relaxed text-muted-foreground">{page.data.description}</p>
        )}
        <hr className="!my-6" />
        <MDX components={getMDXComponents()} />

        <nav className="mt-12 grid grid-cols-2 gap-3 border-t border-border pt-6">
          {neighbours.previous ? (
            <Link
              href={neighbours.previous.url}
              className="group flex flex-col rounded-lg border border-border p-3 transition-colors hover:border-brand/40 hover:bg-accent/40"
            >
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowLeft className="h-3 w-3" /> Previous
              </span>
              <span className="mt-0.5 truncate text-sm font-medium text-foreground">{neighbours.previous.name}</span>
            </Link>
          ) : (
            <span />
          )}
          {neighbours.next ? (
            <Link
              href={neighbours.next.url}
              className="group flex flex-col items-end rounded-lg border border-border p-3 text-right transition-colors hover:border-brand/40 hover:bg-accent/40"
            >
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                Next <ArrowRight className="h-3 w-3" />
              </span>
              <span className="mt-0.5 truncate text-sm font-medium text-foreground">{neighbours.next.name}</span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </article>

      <aside className="sticky top-20 hidden h-fit w-56 shrink-0 xl:block">
        <DocsToc items={toc} />
      </aside>
    </div>
  );
}
