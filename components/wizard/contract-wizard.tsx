"use client"

import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Wand2, Loader2, Lock, Info, AlertTriangle, ChevronDown, Save, FileDown, FileArchive, Rocket } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { projectApi, userTemplateApi, type Project } from "@/lib/api"
import {
  CONTRACT_TYPES,
  getContractType,
  resolveFeatures,
  generate,
  newStateFor,
  reservedNames,
  type WizardState,
  type ParamSpec,
} from "@/lib/wizard"
import { validateCustomFunctions } from "@/lib/wizard/custom-fn"
import { downloadSingleFile, downloadBundleZip } from "@/lib/wizard/export"
import { WizardPreview } from "./wizard-preview"
import { CustomFunctionEditor } from "./custom-function-editor"

export interface ContractWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProjectCreate: (project: Project) => void
  /** Restore a saved template's state (from "My Templates"). */
  initialState?: WizardState | null
}

export function ContractWizard({ open, onOpenChange, onProjectCreate, initialState }: ContractWizardProps) {
  const [state, setState] = useState<WizardState>(() => initialState ?? newStateFor(CONTRACT_TYPES[0].id))
  const [name, setName] = useState<string>("")
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)

  // Reset state when the dialog opens (fresh, or restoring a saved template).
  useEffect(() => {
    if (!open) return
    const init = initialState ?? newStateFor(CONTRACT_TYPES[0].id)
    setState(init)
    setName(String(init.params.name || "My Contract"))
  }, [open, initialState])

  const spec = getContractType(state.type) ?? CONTRACT_TYPES[0]

  // Debounce generation so rapid toggles don't thrash the preview editor.
  const [debounced, setDebounced] = useState(state)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(state), 180)
    return () => clearTimeout(t)
  }, [state])

  const gen = useMemo(() => generate(debounced), [debounced])
  const resolved = useMemo(() => resolveFeatures(spec, state), [spec, state])
  const reserved = useMemo(() => reservedNames(state), [state])

  const setType = (typeId: string) => {
    const next = newStateFor(typeId)
    setState(next)
    setName(String(next.params.name || "My Contract"))
  }

  const setParam = (id: string, value: string | number) =>
    setState((s) => {
      const params = { ...s.params, [id]: value }
      // Keep the project/design name in sync with the contract name field.
      if (id === "name") setName(String(value || "My Contract"))
      return { ...s, params }
    })

  const toggleFeature = (id: string, on: boolean) =>
    setState((s) => ({ ...s, features: { ...s.features, [id]: on } }))

  const customError = useMemo(
    () => validateCustomFunctions(state.customFunctions, reserved),
    [state.customFunctions, reserved],
  )

  const canBuild = !gen.error && !customError && !!gen.bundle

  const guardedBundle = () => {
    if (gen.error) {
      toast.error(gen.error)
      return null
    }
    if (customError) {
      toast.error(`Custom function: ${customError.error}`)
      return null
    }
    return gen.bundle ?? null
  }

  const handleCreate = async () => {
    const bundle = guardedBundle()
    if (!bundle) return
    setCreating(true)
    try {
      const files = bundle.files.map((f) => ({ path: f.path, name: f.path.split("/").pop() || f.path, type: "file", content: f.content }))
      const project = await projectApi.createProject(name.trim() || "My Contract", files, undefined, false, {
        manifestPath: bundle.manifestPath,
        deployTarget: bundle.deployTarget,
      })
      toast.success(`Created "${project.name}"`)
      onProjectCreate(project)
      onOpenChange(false)
    } catch (e: any) {
      toast.error(e?.message || "Failed to create project")
    } finally {
      setCreating(false)
    }
  }

  const handleSaveTemplate = async () => {
    const bundle = guardedBundle()
    if (!bundle) return
    setSaving(true)
    try {
      await userTemplateApi.create({
        name: name.trim() || "My Contract",
        type: state.type,
        engine: spec.engine,
        config: { ...state, features: resolved.features },
        bundle,
      })
      toast.success("Saved to My Templates")
    } catch (e: any) {
      toast.error(e?.message || "Failed to save template")
    } finally {
      setSaving(false)
    }
  }

  const handleExportFile = () => {
    const bundle = guardedBundle()
    if (bundle) downloadSingleFile(bundle, name)
  }
  const handleExportZip = async () => {
    const bundle = guardedBundle()
    if (bundle) await downloadBundleZip(bundle, name)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[88vh] w-[96vw] max-w-[1180px] flex-col gap-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">Customise a contract</DialogTitle>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand/15 text-brand">
            <Wand2 className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-sm font-semibold leading-tight">Contract wizard</p>
            <p className="truncate text-xs text-muted-foreground">Toggle features, preview the code, scaffold a project.</p>
          </div>
          <div className="ml-auto w-56">
            <Select value={state.type} onValueChange={setType}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTRACT_TYPES.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Body: controls + preview */}
        <div className="flex min-h-0 flex-1">
          {/* Left: controls */}
          <ScrollArea className="w-[400px] shrink-0 border-r border-border">
            <div className="space-y-6 p-4">
              <p className="text-xs text-muted-foreground">{spec.description}</p>

              {/* Parameters */}
              <section className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Parameters</h3>
                {spec.params.map((p) => (
                  <ParamField key={p.id} param={p} value={state.params[p.id]} onChange={(v) => setParam(p.id, v)} />
                ))}
              </section>

              {/* Features */}
              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Features</h3>
                <TooltipProvider delayDuration={150}>
                  <div className="space-y-1">
                    {spec.features.map((f) => {
                      const lock = resolved.locked[f.id]
                      const on = resolved.features[f.id]
                      const requiresLabels = f.requires
                        ?.map((r) => spec.features.find((x) => x.id === r)?.label ?? r)
                        .join(", ")
                      return (
                        <div
                          key={f.id}
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-accent/40"
                        >
                          <Switch
                            checked={on}
                            disabled={!!lock}
                            onCheckedChange={(v) => toggleFeature(f.id, v)}
                            aria-label={f.label}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm">{f.label}</span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button type="button" className="text-muted-foreground/70 hover:text-foreground">
                                    <Info className="h-3.5 w-3.5" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-xs text-xs">
                                  {f.tooltip}
                                </TooltipContent>
                              </Tooltip>
                              {lock && <Lock className="h-3 w-3 text-muted-foreground" />}
                            </div>
                            {requiresLabels && (
                              <p className="text-[11px] text-muted-foreground">Requires {requiresLabels}</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </TooltipProvider>

                {resolved.warnings.map((w, i) => (
                  <p key={i} className="flex items-start gap-1.5 rounded-md bg-amber-500/10 px-2 py-1.5 text-[11px] text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                    {w}
                  </p>
                ))}
              </section>

              {/* Custom functions */}
              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Custom functions</h3>
                <p className="text-[11px] text-muted-foreground">
                  Append typed function stubs. They compile with a <span className="font-mono">TODO</span> body.
                </p>
                <CustomFunctionEditor
                  functions={state.customFunctions}
                  onChange={(fns) => setState((s) => ({ ...s, customFunctions: fns }))}
                  reserved={reserved}
                />
              </section>
            </div>
          </ScrollArea>

          {/* Right: live preview */}
          <div className="min-w-0 flex-1">
            <WizardPreview files={gen.bundle?.files ?? []} error={gen.error} />
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-3 border-t border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="wizard-name" className="text-xs text-muted-foreground">
              Name
            </Label>
            <Input
              id="wizard-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 w-56"
              placeholder="My Contract"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={!canBuild || saving}>
                  {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <ChevronDown className="mr-1.5 h-4 w-4" />}
                  Save / Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSaveTemplate}>
                  <Save className="mr-2 h-4 w-4" /> Save as my template
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExportFile}>
                  <FileDown className="mr-2 h-4 w-4" /> Download contract file
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportZip}>
                  <FileArchive className="mr-2 h-4 w-4" /> Download project (.zip)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={handleCreate} disabled={!canBuild || creating}>
              {creating ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Rocket className="mr-1.5 h-4 w-4" />}
              Create project
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ParamField({
  param,
  value,
  onChange,
}: {
  param: ParamSpec
  value: string | number | undefined
  onChange: (v: string | number) => void
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{param.label}</Label>
      {param.kind === "select" ? (
        <Select value={String(value ?? param.default)} onValueChange={(v) => onChange(v)}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {param.options?.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          type={param.kind === "number" ? "number" : "text"}
          value={value ?? ""}
          min={param.min}
          placeholder={param.placeholder}
          onChange={(e) => onChange(param.kind === "number" ? Number(e.target.value) : e.target.value)}
          className="h-9"
        />
      )}
      {param.help && <p className="text-[11px] text-muted-foreground">{param.help}</p>}
    </div>
  )
}
