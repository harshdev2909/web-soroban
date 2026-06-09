"use client"

import { useMemo, useState } from "react"
import {
  ChevronRight,
  File,
  FileCode2,
  FileCog,
  FileJson,
  Folder,
  FolderOpen,
  FilePlus2,
  FolderPlus,
  Pencil,
  Trash2,
} from "lucide-react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

import { ProjectFile } from "@/lib/api"
import { buildFileTree, pathOf, type TreeNode } from "@/lib/paths"

interface FileTreeProps {
  files: ProjectFile[]
  extraFolders?: string[]
  activePath: string | null
  onSelect: (file: ProjectFile) => void
  onNewFileInDir: (dir: string) => void
  onNewFolderInDir: (dir: string) => void
  onRename: (file: ProjectFile) => void
  onDelete: (path: string) => void
  canDelete: boolean
}

function fileIcon(name: string, active: boolean) {
  const base = "h-4 w-4 shrink-0"
  if (name.endsWith(".rs")) return <FileCode2 className={`${base} ${active ? "text-brand" : "text-brand/70"}`} />
  if (name.endsWith(".toml")) return <FileCog className={`${base} text-warning/70`} />
  if (name.endsWith(".json")) return <FileJson className={`${base} text-info/70`} />
  return <File className={`${base} text-muted-foreground`} />
}

// Props each row needs — a subset of FileTreeProps plus tree-walk state. Note it
// intentionally omits `files`/`extraFolders` (only the top-level component needs
// those) so the recursive call sites don't have to thread them.
interface RowProps {
  node: TreeNode
  depth: number
  collapsed: Set<string>
  toggle: (p: string) => void
  activePath: string | null
  onSelect: (file: ProjectFile) => void
  onNewFileInDir: (dir: string) => void
  onNewFolderInDir: (dir: string) => void
  onRename: (file: ProjectFile) => void
  onDelete: (path: string) => void
  canDelete: boolean
}

export function FileTree(props: FileTreeProps) {
  const { files, extraFolders = [] } = props
  const tree = useMemo(() => buildFileTree(files, extraFolders), [files, extraFolders])

  // Directories are expanded by default (collapsed set starts empty); the user
  // can collapse any of them.
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const toggle = (path: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })

  const rowProps = {
    collapsed,
    toggle,
    activePath: props.activePath,
    onSelect: props.onSelect,
    onNewFileInDir: props.onNewFileInDir,
    onNewFolderInDir: props.onNewFolderInDir,
    onRename: props.onRename,
    onDelete: props.onDelete,
    canDelete: props.canDelete,
  }

  return (
    <div className="space-y-0.5" role="tree" aria-label="Project files">
      {tree.map((node) => (
        <TreeRow key={node.path} node={node} depth={0} {...rowProps} />
      ))}
    </div>
  )
}

function TreeRow({
  node,
  depth,
  collapsed,
  toggle,
  activePath,
  onSelect,
  onNewFileInDir,
  onNewFolderInDir,
  onRename,
  onDelete,
  canDelete,
}: RowProps) {
  const indent = { paddingLeft: `${depth * 12 + 8}px` }
  const isOpen = !collapsed.has(node.path)

  if (node.isDir) {
    return (
      <div>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <button
              onClick={() => toggle(node.path)}
              style={indent}
              className="group flex w-full items-center gap-1.5 rounded-md py-1.5 pr-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title={node.path}
            >
              <ChevronRight className={`h-3.5 w-3.5 shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`} />
              {isOpen ? (
                <FolderOpen className="h-4 w-4 shrink-0 text-warning/80" />
              ) : (
                <Folder className="h-4 w-4 shrink-0 text-warning/80" />
              )}
              <span className="truncate font-mono text-[13px]">{node.name}</span>
            </button>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-44">
            <ContextMenuItem onClick={() => onNewFileInDir(node.path)}>
              <FilePlus2 className="mr-2 h-3.5 w-3.5" /> New file…
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onNewFolderInDir(node.path)}>
              <FolderPlus className="mr-2 h-3.5 w-3.5" /> New folder…
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        {isOpen && (
          <div>
            {node.children.map((child) => (
              <TreeRow
                key={child.path}
                node={child}
                depth={depth + 1}
                collapsed={collapsed}
                toggle={toggle}
                activePath={activePath}
                onSelect={onSelect}
                onNewFileInDir={onNewFileInDir}
                onNewFolderInDir={onNewFolderInDir}
                onRename={onRename}
                onDelete={onDelete}
                canDelete={canDelete}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // File row
  const isActive = activePath === node.path
  const file = node.file!
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          style={indent}
          className={`group relative flex cursor-pointer items-center justify-between rounded-md py-1.5 pr-1.5 text-sm transition-colors ${
            isActive ? "bg-brand/10 text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          {isActive && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand" />}
          <button onClick={() => onSelect(file)} className="flex min-w-0 flex-1 items-center gap-1.5 text-left">
            <span className="w-3.5 shrink-0" />
            {fileIcon(node.name, isActive)}
            <span className="truncate font-mono text-[13px]">{node.name}</span>
          </button>
          <div className="ml-2 flex shrink-0 items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onRename(file) }}
              className="rounded p-1 text-muted-foreground opacity-0 transition-all hover:bg-accent hover:text-foreground group-hover:opacity-100 focus-visible:opacity-100"
              title={`Rename ${node.name}`}
              aria-label={`Rename ${node.name}`}
            >
              <Pencil className="h-3 w-3" />
            </button>
            {canDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(node.path) }}
                className="rounded p-1 text-muted-foreground opacity-0 transition-all hover:bg-destructive/15 hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100"
                title={`Delete ${node.path}`}
                aria-label={`Delete ${node.path}`}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-44">
        <ContextMenuItem onClick={() => onRename(file)}>
          <Pencil className="mr-2 h-3.5 w-3.5" /> Rename / move…
        </ContextMenuItem>
        {canDelete && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(pathOf(file))}>
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}
