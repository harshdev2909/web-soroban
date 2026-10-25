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

const kbd = 'rounded-sm border border-border bg-muted px-1 py-0.5 font-mono text-[0.62rem] text-muted-foreground'

/**
 * Cmd/Ctrl-K command palette — a signature surface. A raised hairline panel,
 * grouped results (Files / Actions / Navigation), mono keyboard hints.
 * Registers its own global shortcut.
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
    <CommandDialog open={open} onOpenChange={onOpenChange} className="max-w-xl rounded-lg border border-border bg-popover p-0 shadow-lg">
      <CommandInput placeholder="Search files, run actions, navigate…" />
      <CommandList className="max-h-[60vh]">
        <CommandEmpty>
          <span className="font-mono text-xs text-muted-foreground">No results.</span>
        </CommandEmpty>
        {groups.map((group, gi) => (
          <div key={group}>
            {gi > 0 && <CommandSeparator />}
            <CommandGroup heading={group} className="[&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[0.62rem] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.16em]">
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
                      className="gap-2.5 rounded-sm aria-selected:bg-accent aria-selected:text-foreground"
                    >
                      {Icon && (
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-sm border border-border bg-muted/40 text-muted-foreground">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                      )}
                      <span className="flex-1 truncate">{c.label}</span>
                      {c.hint && <kbd className={kbd}>{c.hint}</kbd>}
                    </CommandItem>
                  )
                })}
            </CommandGroup>
          </div>
        ))}
      </CommandList>

      {/* Keyboard hint footer */}
      <div className="flex items-center justify-between border-t border-border px-3 py-2 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <kbd className={kbd}>↑</kbd>
          <kbd className={kbd}>↓</kbd>
          navigate
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className={kbd}>↵</kbd>
          select
          <span className="text-border">·</span>
          <kbd className={kbd}>esc</kbd>
          close
        </span>
      </div>
    </CommandDialog>
  )
}
