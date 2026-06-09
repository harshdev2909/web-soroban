import type { ProjectFile } from "@/lib/api"

/**
 * Client-side path model for the multi-file explorer. Mirrors the backend's
 * lib/paths.ts rules (the server is authoritative; this is for fast UX feedback).
 */

/** The tree path of a file (falls back to its flat name for legacy rows). */
export function pathOf(f: ProjectFile): string {
  return f.path || f.name
}

/** Leaf (file name) of a path. */
export function baseName(p: string): string {
  const i = p.lastIndexOf("/")
  return i === -1 ? p : p.slice(i + 1)
}

/** Directory portion of a path ("" for a root file). */
export function dirName(p: string): string {
  const i = p.lastIndexOf("/")
  return i === -1 ? "" : p.slice(0, i)
}

/**
 * Validate an untrusted project-relative path. Returns an error message, or null
 * if valid. Rules: no absolute paths, no "..", no leading slash, no backslashes,
 * no whitespace inside a segment, no empty/"." segments.
 */
export function validatePath(input: string): string | null {
  const raw = (input || "").trim()
  if (!raw) return "Path is empty"
  if (raw.startsWith("/")) return 'Path must be relative (no leading "/")'
  if (raw.includes("\\")) return 'Use "/" to separate folders, not "\\"'
  if (/^[a-zA-Z]:/.test(raw)) return "Path must be a plain relative path"
  const segments = raw.split("/")
  for (const seg of segments) {
    if (seg === "" ) return 'Path has an empty segment (no "//")'
    if (seg === "." || seg === "..") return `Path may not contain "${seg}"`
    if (/\s/.test(seg)) return "Folder/file names may not contain spaces"
  }
  return null
}

export interface TreeNode {
  name: string
  path: string
  isDir: boolean
  children: TreeNode[]
  file?: ProjectFile
}

/** Build a nested tree from a flat list of files (folders derived from paths). */
export function buildFileTree(files: ProjectFile[], extraFolders: string[] = []): TreeNode[] {
  const root: TreeNode = { name: "", path: "", isDir: true, children: [] }

  const ensureDir = (segments: string[]): TreeNode => {
    let node = root
    let acc = ""
    for (const seg of segments) {
      acc = acc ? `${acc}/${seg}` : seg
      let child = node.children.find((c) => c.isDir && c.name === seg)
      if (!child) {
        child = { name: seg, path: acc, isDir: true, children: [] }
        node.children.push(child)
      }
      node = child
    }
    return node
  }

  // Seed any client-only empty folders so they render before a file is added.
  for (const folder of extraFolders) {
    if (folder) ensureDir(folder.split("/"))
  }

  for (const f of files) {
    const p = pathOf(f)
    const segments = p.split("/")
    const leaf = segments.pop() as string
    const parent = segments.length ? ensureDir(segments) : root
    parent.children.push({ name: leaf, path: p, isDir: false, children: [], file: f })
  }

  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.isDir !== b.isDir) return a.isDir ? -1 : 1 // folders first
      return a.name.localeCompare(b.name)
    })
    for (const n of nodes) if (n.isDir) sortNodes(n.children)
  }
  sortNodes(root.children)
  return root.children
}

/**
 * Find `mod NAME;` declarations in a .rs file whose target file is missing from
 * the project, for an inline editor/explorer warning. Resolution mirrors rustc:
 * lib.rs/main.rs/mod.rs declare modules in their own directory; any other foo.rs
 * declares modules in a foo/ subdirectory.
 */
export function findMissingModules(files: ProjectFile[]): { file: string; module: string }[] {
  const paths = new Set(files.map(pathOf))
  const out: { file: string; module: string }[] = []
  const MOD = /^\s*(?:pub\s*(?:\([^)]*\)\s*)?)?mod\s+([A-Za-z_][A-Za-z0-9_]*)\s*;/

  for (const f of files) {
    const p = pathOf(f)
    if (!p.endsWith(".rs")) continue
    const dir = dirName(p)
    const leaf = baseName(p).replace(/\.rs$/, "")
    const base = leaf === "lib" || leaf === "main" || leaf === "mod" ? dir : dir ? `${dir}/${leaf}` : leaf
    const lines = (f.content || "").split("\n")
    for (let i = 0; i < lines.length; i++) {
      const m = MOD.exec(lines[i])
      if (!m) continue
      if ((lines[i - 1] || "").includes("#[path") || lines[i].includes("#[path")) continue
      const name = m[1]
      const a = base ? `${base}/${name}.rs` : `${name}.rs`
      const b = base ? `${base}/${name}/mod.rs` : `${name}/mod.rs`
      if (!paths.has(a) && !paths.has(b)) out.push({ file: p, module: name })
    }
  }
  return out
}
