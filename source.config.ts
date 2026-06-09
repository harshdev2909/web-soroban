import { defineDocs, defineConfig } from 'fumadocs-mdx/config';

// Docs content lives in content/docs/**/*.mdx with { title, description }
// frontmatter (description is one concise line, bulk-style). _meta-less: nav
// order is controlled by meta.json files per folder.
export const docs = defineDocs({
  dir: 'content/docs',
});

export default defineConfig({
  mdxOptions: {
    // Shiki highlighting tuned for the near-black canvas. Our own <Pre> wrapper
    // (components/docs/code-block) reads `data-title` for the filename header
    // and adds the copy button. Line highlighting uses shiki notation comments
    // (`// [!code highlight]`) via fumadocs' default transformers.
    rehypeCodeOptions: {
      themes: {
        light: 'github-light',
        dark: 'github-dark-default',
      },
      transformers: [
        {
          name: 'websoroban:meta-title',
          pre(node) {
            const raw = this.options.meta?.__raw;
            if (!raw) return;
            const match = raw.match(/title="([^"]+)"/);
            if (match) node.properties['data-title'] = match[1];
          },
        },
      ],
    },
  },
});
