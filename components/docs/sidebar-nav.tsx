"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, type ReactNode } from "react"
import { ChevronRight } from "lucide-react"
import type { PageTree } from "fumadocs-core/server"
import { cn } from "@/lib/utils"

function isActive(url: string, pathname: string) {
  return url === pathname
}

function treeHasActive(node: PageTree.Node, pathname: string): boolean {
  if (node.type === "page") return isActive(node.url, pathname)
  if (node.type === "folder") {
    if (node.index && isActive(node.index.url, pathname)) return true
    return node.children.some((c) => treeHasActive(c, pathname))
  }
  return false
}

/** A quiet row; the active page carries a 2px iris bar on the left rail. */
function NavLink({ url, name, icon, pathname }: { url: string; name: ReactNode; icon?: ReactNode; pathname: string }) {
  const active = isActive(url, pathname)
  return (
    <Link
      href={url}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex min-h-9 items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[0.8125rem] transition-colors duration-150",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {active && <span aria-hidden className="absolute -left-[calc(0.75rem+1px)] top-1.5 bottom-1.5 w-0.5 bg-brand" />}
      {icon && (
        <span className={cn("shrink-0 [&_svg]:h-3.5 [&_svg]:w-3.5", active ? "text-brand" : "text-muted-foreground/70")}>
          {icon}
        </span>
      )}
      <span className="truncate">{name}</span>
    </Link>
  )
}

function Folder({ node, pathname }: { node: PageTree.Folder; pathname: string }) {
  const [open, setOpen] = useState(() => treeHasActive(node, pathname) || node.defaultOpen === true)
  return (
    <div className="mt-1 first:mt-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex min-h-9 w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[0.8125rem] font-medium text-foreground/85 transition-colors duration-150 hover:text-foreground"
      >
        {node.icon && <span className="shrink-0 text-muted-foreground [&_svg]:h-3.5 [&_svg]:w-3.5">{node.icon}</span>}
        <span className="truncate">{node.name}</span>
        <ChevronRight
          className={cn("ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground/70 transition-transform duration-150", open && "rotate-90")}
        />
      </button>
      {open && (
        <div className="ml-3 mt-0.5 space-y-0.5 border-l border-border pl-3">
          {node.index && <NavLink url={node.index.url} name={node.index.name} pathname={pathname} />}
          {node.children.map((child, i) => (
            <NavNode key={i} node={child} pathname={pathname} />
          ))}
        </div>
      )}
    </div>
  )
}

function NavNode({ node, pathname }: { node: PageTree.Node; pathname: string }) {
  if (node.type === "separator")
    return <p className="eyebrow px-2.5 pb-2 pt-6 first:pt-0">{node.name}</p>
  if (node.type === "folder") return <Folder node={node} pathname={pathname} />
  return <NavLink url={node.url} name={node.name} icon={node.icon} pathname={pathname} />
}

export function SidebarNav({ tree }: { tree: PageTree.Root }) {
  const pathname = usePathname()
  return (
    <nav className="space-y-0.5" aria-label="Documentation">
      {tree.children.map((node, i) => (
        <NavNode key={i} node={node} pathname={pathname} />
      ))}
    </nav>
  )
}
