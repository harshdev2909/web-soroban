"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, AlertCircle } from "lucide-react"
import {
  CUSTOM_ARG_TYPES,
  type CustomArgType,
  type CustomFunction,
  type CustomReturnType,
} from "@/lib/wizard"
import { validateCustomFunction } from "@/lib/wizard/custom-fn"

const RETURN_OPTIONS: { value: CustomReturnType; label: string }[] = [
  { value: "", label: "No return" },
  ...CUSTOM_ARG_TYPES.map((t) => ({ value: t, label: t })),
]

function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `fn_${Date.now()}_${Math.round(performance.now())}`
}

export function CustomFunctionEditor({
  functions,
  onChange,
  reserved,
}: {
  functions: CustomFunction[]
  onChange: (fns: CustomFunction[]) => void
  reserved: Set<string>
}) {
  const update = (id: string, patch: Partial<CustomFunction>) =>
    onChange(functions.map((f) => (f.id === id ? { ...f, ...patch } : f)))

  const addFn = () =>
    onChange([...functions, { id: newId(), name: "", args: [], returnType: "" }])

  const removeFn = (id: string) => onChange(functions.filter((f) => f.id !== id))

  // Validate each function against reserved names plus the names before it.
  const seen = new Set(reserved)
  const errorFor = (fn: CustomFunction): string | null => {
    const err = validateCustomFunction(fn, seen)
    if (fn.name.trim()) seen.add(fn.name.trim())
    return err
  }

  return (
    <div className="space-y-3">
      {functions.map((fn) => {
        const error = errorFor(fn)
        return (
          <div key={fn.id} className="rounded-lg border border-border bg-muted/20 p-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">pub fn</span>
              <Input
                value={fn.name}
                onChange={(e) => update(fn.id, { name: e.target.value })}
                placeholder="function_name"
                className="h-8 flex-1 font-mono text-sm"
              />
              <Select
                value={fn.returnType || "__unit__"}
                onValueChange={(v) => update(fn.id, { returnType: (v === "__unit__" ? "" : v) as CustomReturnType })}
              >
                <SelectTrigger className="h-8 w-32 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RETURN_OPTIONS.map((o) => (
                    <SelectItem key={o.value || "unit"} value={o.value || "__unit__"} className="text-xs">
                      {o.value ? `→ ${o.label}` : o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeFn(fn.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Arguments */}
            <div className="mt-2 space-y-1.5 pl-1">
              {fn.args.map((arg, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={arg.name}
                    onChange={(e) => {
                      const args = [...fn.args]
                      args[i] = { ...arg, name: e.target.value }
                      update(fn.id, { args })
                    }}
                    placeholder="arg_name"
                    className="h-7 flex-1 font-mono text-xs"
                  />
                  <Select
                    value={arg.type}
                    onValueChange={(v) => {
                      const args = [...fn.args]
                      args[i] = { ...arg, type: v as CustomArgType }
                      update(fn.id, { args })
                    }}
                  >
                    <SelectTrigger className="h-7 w-28 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CUSTOM_ARG_TYPES.map((t) => (
                        <SelectItem key={t} value={t} className="text-xs">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => update(fn.id, { args: fn.args.filter((_, j) => j !== i) })}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <button
                onClick={() => update(fn.id, { args: [...fn.args, { name: "", type: "u32" }] })}
                className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-brand"
              >
                <Plus className="h-3 w-3" /> Add argument
              </button>
            </div>

            <Input
              value={fn.doc ?? ""}
              onChange={(e) => update(fn.id, { doc: e.target.value })}
              placeholder="Doc comment (optional)"
              className="mt-2 h-7 text-xs"
            />

            {error && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </p>
            )}
          </div>
        )
      })}

      <Button variant="outline" size="sm" onClick={addFn} className="w-full border-dashed">
        <Plus className="mr-1.5 h-4 w-4" /> Add custom function
      </Button>
    </div>
  )
}
