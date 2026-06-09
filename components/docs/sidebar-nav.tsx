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

function NavLink({ url, name, icon, pathname }: { url: string; name: ReactNode; icon?: ReactNode; pathname: string }) {
  const active = isActive(url, pathname)
  return (
    <Link
      href={url}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors",
        active
          ? "bg-brand/10 font-medium text-foreground"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
      )}
    >
      {icon && <span className={cn("shrink-0 [&_svg]:h-4 [&_svg]:w-4", active ? "text-brand" : "text-muted-foreground")}>{icon}</span>}
      <span className="truncate">{name}</span>
      {active && <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden />}
    </Link>
  )
}

function Folder({ node, pathname }: { node: PageTree.Folder; pathname: string }) {
  const [open, setOpen] = useState(() => treeHasActive(node, pathname) || node.defaultOpen === true)
  return (
    <div className="mt-5 first:mt-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm font-semibold tracking-tight text-foreground/80 transition-colors hover:text-foreground"
      >
        {node.icon && <span className="shrink-0 text-brand/80 [&_svg]:h-[18px] [&_svg]:w-[18px]">{node.icon}</span>}
        <span className="truncate">{node.name}</span>
        <ChevronRight className={cn("ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-90")} />
      </button>
      {open && (
        <div className="mt-1 space-y-0.5 border-l border-border pl-3">
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
    return <p className="px-2.5 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">{node.name}</p>
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
