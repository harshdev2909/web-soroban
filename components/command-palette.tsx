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
 * Cmd/Ctrl-K command palette. Groups commands and runs the selected action.
 * Registers its own global keyboard shortcut.
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
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search files, run actions, navigate…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
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
                      className="gap-2"
                    >
                      {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                      <span className="flex-1 truncate">{c.label}</span>
                      {c.hint && (
                        <span className="font-mono text-[11px] text-muted-foreground">{c.hint}</span>
                      )}
                    </CommandItem>
                  )
                })}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  )
}
