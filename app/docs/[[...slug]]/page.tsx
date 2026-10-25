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
  const section = page.slugs.length > 1 ? page.slugs[0].replace(/-/g, " ") : "Docs";

  return (
    <div className="mx-auto flex w-full max-w-5xl gap-12 px-5 py-10 lg:px-10 lg:py-14">
      <article className="docs-prose min-w-0 max-w-3xl flex-1">
        <p className="eyebrow !mt-0">{section}</p>
        <h1 className="!mt-6">{page.data.title}</h1>
        {page.data.description && (
          <p className="lead !mt-4 text-base sm:text-lg">{page.data.description}</p>
        )}
        <hr className="!my-8" />
        <MDX components={getMDXComponents()} />

        <nav className="mt-16 grid grid-cols-2 gap-px border border-border bg-border" aria-label="Pagination">
          {neighbours.previous ? (
            <Link
              href={neighbours.previous.url}
              className="group flex min-h-20 flex-col justify-between bg-background p-4 transition-colors duration-150 hover:bg-card"
            >
              <span className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
                <ArrowLeft className="h-3 w-3 transition-transform duration-150 motion-safe:group-hover:-translate-x-0.5" /> Previous
              </span>
              <span className="mt-3 truncate text-sm font-medium text-foreground">{neighbours.previous.name}</span>
            </Link>
          ) : (
            <span className="bg-background" />
          )}
          {neighbours.next ? (
            <Link
              href={neighbours.next.url}
              className="group flex min-h-20 flex-col items-end justify-between bg-background p-4 text-right transition-colors duration-150 hover:bg-card"
            >
              <span className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
                Next <ArrowRight className="h-3 w-3 transition-transform duration-150 motion-safe:group-hover:translate-x-0.5" />
              </span>
              <span className="mt-3 truncate text-sm font-medium text-foreground">{neighbours.next.name}</span>
            </Link>
          ) : (
            <span className="bg-background" />
          )}
        </nav>
      </article>

      <aside className="sticky top-24 hidden h-fit w-52 shrink-0 xl:block">
        <DocsToc items={toc} />
      </aside>
    </div>
  );
}
