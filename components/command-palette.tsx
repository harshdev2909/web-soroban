'use client'

import { useEffect } from 'react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import type { LucideIcon } from 'lucide-react'

export interface PaletteCommand {
  id: string
  label: string
  hint?: string
  group: string
  icon?: LucideIcon
  keywords?: string[]
  disabled?: boolean
  perform: () => void
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  commands: PaletteCommand[]
}

/**
 * Cmd/Ctrl-K command palette — a signature surface. Raised, blurred backdrop,
 * grouped results (Files / Actions / Navigation), keyboard hints. Registers its
 * own global shortcut.
 */
export function CommandPalette({ open, onOpenChange, commands }: CommandPaletteProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onOpenChange])

  // Preserve declaration order within each group
  const groups: string[] = []
  for (const c of commands) if (!groups.includes(c.group)) groups.push(c.group)

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} className="max-w-xl">
      <CommandInput placeholder="Search files, run actions, navigate…" />
      <CommandList className="max-h-[60vh]">
        <CommandEmpty>
          <span className="text-muted-foreground">No results found.</span>
        </CommandEmpty>
        {groups.map((group, gi) => (
          <div key={group}>
            {gi > 0 && <CommandSeparator />}
            <CommandGroup heading={group}>
              {commands
                .filter((c) => c.group === group)
                .map((c) => {
                  const Icon = c.icon
                  return (
                    <CommandItem
                      key={c.id}
                      value={`${c.label} ${(c.keywords ?? []).join(' ')}`}
                      disabled={c.disabled}
                      onSelect={() => {
                        onOpenChange(false)
                        // defer so the dialog closes before side effects
                        requestAnimationFrame(() => c.perform())
                      }}
                      className="gap-2.5"
                    >
                      {Icon && (
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-border/60 bg-muted/40 text-muted-foreground">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                      )}
                      <span className="flex-1 truncate">{c.label}</span>
                      {c.hint && (
                        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                          {c.hint}
                        </kbd>
                      )}
                    </CommandItem>
                  )
                })}
            </CommandGroup>
          </div>
        ))}
      </CommandList>

      {/* Keyboard hint footer */}
      <div className="flex items-center justify-between border-t border-border px-3 py-2 font-mono text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <kbd className="rounded border border-border bg-muted px-1 py-0.5">↑</kbd>
          <kbd className="rounded border border-border bg-muted px-1 py-0.5">↓</kbd>
          navigate
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="rounded border border-border bg-muted px-1 py-0.5">↵</kbd>
          select
          <span className="text-border">·</span>
          <kbd className="rounded border border-border bg-muted px-1 py-0.5">esc</kbd>
          close
        </span>
      </div>
    </CommandDialog>
  )
}
