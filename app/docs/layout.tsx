import type { ReactNode } from "react";
import { source } from "@/lib/docs-source";
import { getSearchIndex } from "@/lib/docs-search";
import { DocsThemeProvider } from "@/components/docs/theme";
import { DocsShell } from "@/components/docs/shell";
import "./docs.css";

const VERSION = "v1";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <DocsThemeProvider>
      <DocsShell tree={source.pageTree} index={getSearchIndex()} version={VERSION}>
        {children}
      </DocsShell>
    </DocsThemeProvider>
  );
}
