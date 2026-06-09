// Generates public/llms.txt — a flat index of every docs page with its one-line
// description, ordered to match the nav (root meta.json → folder meta.json).
// Mirrors the docs.bulk.trade/llms.txt convention. Runs in `postbuild`.
import { readFileSync, readdirSync, writeFileSync, existsSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const DOCS_DIR = join(ROOT, "content", "docs");
const OUT = join(ROOT, "public", "llms.txt");
const SITE = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "";

function frontmatter(file) {
  const raw = readFileSync(file, "utf8");
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---/);
  const fm = {};
  if (m) {
    for (const line of m[1].split("\n")) {
      const kv = line.match(/^(\w+):\s*(.*)$/);
      if (kv) fm[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, "");
    }
  }
  return fm;
}

function urlForFile(file) {
  let rel = relative(DOCS_DIR, file).replace(/\\/g, "/").replace(/\.mdx?$/, "");
  rel = rel.replace(/\/index$/, "").replace(/^index$/, "");
  return `/docs${rel ? `/${rel}` : ""}`;
}

function readMeta(dir) {
  const p = join(dir, "meta.json");
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

// Resolve a meta "pages" entry (a file slug or a subfolder) into page records.
function resolveEntry(dir, entry) {
  const asFile = join(dir, `${entry}.mdx`);
  if (existsSync(asFile)) {
    const fm = frontmatter(asFile);
    return [{ url: urlForFile(asFile), title: fm.title || entry, description: fm.description || "" }];
  }
  const asDir = join(dir, entry);
  if (existsSync(asDir) && statSync(asDir).isDirectory()) {
    return collectDir(asDir);
  }
  return [];
}

function collectDir(dir) {
  const meta = readMeta(dir);
  const out = [];
  const ordered = meta?.pages ?? defaultOrder(dir);
  for (const entry of ordered) out.push(...resolveEntry(dir, entry));
  return out;
}

function defaultOrder(dir) {
  // index first, then the rest alphabetically; folders after files.
  const items = readdirSync(dir);
  const files = items
    .filter((f) => /\.mdx?$/.test(f))
    .map((f) => f.replace(/\.mdx?$/, ""))
    .sort((a, b) => (a === "index" ? -1 : b === "index" ? 1 : a.localeCompare(b)));
  const dirs = items.filter((f) => statSync(join(dir, f)).isDirectory()).sort();
  return [...files, ...dirs];
}

function sectionTitle(dir, entry) {
  const meta = readMeta(join(dir, entry));
  if (meta?.title) return meta.title;
  return entry
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

function build() {
  const rootMeta = readMeta(DOCS_DIR);
  const rootOrder = rootMeta?.pages ?? defaultOrder(DOCS_DIR);

  const home = frontmatter(join(DOCS_DIR, "index.mdx"));
  const lines = [`# ${home.title || "WebSoroban docs"}`, ""];
  if (home.description) lines.push(`> ${home.description}`, "");

  for (const entry of rootOrder) {
    if (entry === "index") continue;
    const asDir = join(DOCS_DIR, entry);
    if (existsSync(asDir) && statSync(asDir).isDirectory()) {
      lines.push(`## ${sectionTitle(DOCS_DIR, entry)}`, "");
      for (const page of collectDir(asDir)) {
        lines.push(`- [${page.title}](${SITE}${page.url})${page.description ? `: ${page.description}` : ""}`);
      }
      lines.push("");
    } else {
      const recs = resolveEntry(DOCS_DIR, entry);
      for (const page of recs) {
        lines.push(`- [${page.title}](${SITE}${page.url})${page.description ? `: ${page.description}` : ""}`);
      }
    }
  }

  writeFileSync(OUT, lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n");
  const count = lines.filter((l) => l.startsWith("- [")).length;
  console.log(`[llms.txt] wrote ${count} pages → public/llms.txt`);
}

build();
