"use client"

/**
 * Skills panel — manage Copilot knowledge/instruction packs (Cursor-style rules,
 * scoped to Soroban). Lists official + personal skills with per-user enable
 * toggles, a markdown editor (name / description / whenToUse / scope / visibility
 * / body) with live preview, and create / duplicate / delete.
 *
 * Skills are GUIDANCE the Copilot loads as context (index always, body on demand
 * via load_skill or @skill:slug). The server validates that a skill stays
 * in-domain and can't redefine the assistant.
 */
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  ArrowLeft, BookOpen, Copy, Eye, Loader2, Pencil, Plus, ShieldCheck, Trash2, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { aiApi, type Skill, type SkillScope, type SkillVisibility } from '@/lib/aiApi'
import { Markdown } from './markdown'

interface EditorState {
  id?: string
  name: string
  description: string
  whenToUse: string
  body: string
  scope: SkillScope
  visibility: SkillVisibility
}

const BLANK: EditorState = {
  name: '', description: '', whenToUse: '', body: '', scope: 'auto', visibility: 'private',
}

const SCOPE_HINT: Record<SkillScope, string> = {
  always: 'Body injected into every run (use sparingly — costs tokens).',
  auto: 'Listed in the index; the model loads the body when it’s relevant.',
  manual: 'Loads only when you @skill:slug-mention it in a message.',
}

export function SkillsPanel({ onClose }: { onClose: () => void }) {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [editor, setEditor] = useState<EditorState | null>(null)
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const res = await aiApi.listSkills()
      setSkills(res.skills)
    } catch (e: any) {
      toast.error(e.message || 'Failed to load skills')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  const { mine, official } = useMemo(() => {
    const mine = skills.filter((s) => s.owned)
    const official = skills.filter((s) => !s.owned)
    return { mine, official }
  }, [skills])
  const activeCount = skills.filter((s) => s.enabled).length

  const toggle = async (s: Skill) => {
    setBusy(s.id)
    // optimistic
    setSkills((prev) => prev.map((x) => (x.id === s.id ? { ...x, enabled: !x.enabled } : x)))
    try {
      await aiApi.toggleSkill(s.id, !s.enabled)
    } catch (e: any) {
      setSkills((prev) => prev.map((x) => (x.id === s.id ? { ...x, enabled: s.enabled } : x)))
      toast.error(e.message || 'Failed to toggle')
    } finally {
      setBusy(null)
    }
  }

  const duplicate = async (s: Skill) => {
    setBusy(s.id)
    try {
      const copy = await aiApi.duplicateSkill(s.id)
      setSkills((prev) => [copy, ...prev])
      toast.success(`Duplicated "${s.name}"`)
      openEdit(copy)
    } catch (e: any) {
      toast.error(e.message || 'Failed to duplicate')
    } finally {
      setBusy(null)
    }
  }

  const remove = async (s: Skill) => {
    if (!confirm(`Delete skill "${s.name}"? This can't be undone.`)) return
    setBusy(s.id)
    try {
      await aiApi.deleteSkill(s.id)
      setSkills((prev) => prev.filter((x) => x.id !== s.id))
      toast.success('Deleted')
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete')
    } finally {
      setBusy(null)
    }
  }

  const openNew = () => { setPreview(false); setEditor({ ...BLANK }) }
  const openEdit = (s: Skill) =>
    setEditor({
      id: s.id, name: s.name, description: s.description, whenToUse: s.whenToUse,
      body: s.body, scope: s.scope, visibility: s.visibility,
    })

  const save = async () => {
    if (!editor) return
    if (!editor.name.trim()) return toast.error('Name is required')
    if (!editor.body.trim()) return toast.error('Body is required')
    setSaving(true)
    try {
      const payload = {
        name: editor.name, description: editor.description, whenToUse: editor.whenToUse,
        body: editor.body, scope: editor.scope, visibility: editor.visibility,
      }
      const saved = editor.id
        ? await aiApi.updateSkill(editor.id, payload)
        : await aiApi.createSkill(payload)
      setSkills((prev) => {
        const exists = prev.some((x) => x.id === saved.id)
        return exists ? prev.map((x) => (x.id === saved.id ? saved : x)) : [saved, ...prev]
      })
      toast.success(editor.id ? 'Saved' : 'Skill created')
      setEditor(null)
    } catch (e: any) {
      // Server rejects off-domain / role-override content with a clear message.
      toast.error(e.message || 'Failed to save skill')
    } finally {
      setSaving(false)
    }
  }

  // ---- Editor view --------------------------------------------------------
  if (editor) {
    return (
      <div className="flex h-full flex-col bg-background">
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditor(null)} title="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold">{editor.id ? 'Edit skill' : 'New skill'}</span>
          <div className="ml-auto flex items-center gap-1.5">
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => setPreview((p) => !p)}>
              {preview ? <Pencil className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {preview ? 'Edit' : 'Preview'}
            </Button>
            <Button size="sm" className="h-7 gap-1 text-xs" onClick={save} disabled={saving}>
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
          <div className="grid grid-cols-1 gap-3">
            <label className="space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground">Name</span>
              <Input value={editor.name} onChange={(e) => setEditor({ ...editor, name: e.target.value })} placeholder="e.g. Our token conventions" />
            </label>
            <label className="space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground">Description (shown in the index)</span>
              <Input value={editor.description} onChange={(e) => setEditor({ ...editor, description: e.target.value })} placeholder="One line on what this skill covers" />
            </label>
            <label className="space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground">When to use (triggers loading)</span>
              <Input value={editor.whenToUse} onChange={(e) => setEditor({ ...editor, whenToUse: e.target.value })} placeholder="e.g. Building or reviewing a fungible token" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground">Scope</span>
                <Select value={editor.scope} onValueChange={(v) => setEditor({ ...editor, scope: v as SkillScope })}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="always">Always on</SelectItem>
                    <SelectItem value="auto">Auto (recommended)</SelectItem>
                    <SelectItem value="manual">Manual (@skill)</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              <label className="space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground">Visibility</span>
                <Select value={editor.visibility} onValueChange={(v) => setEditor({ ...editor, visibility: v as SkillVisibility })}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="public">Public (share)</SelectItem>
                  </SelectContent>
                </Select>
              </label>
            </div>
            <p className="text-[10px] text-muted-foreground">{SCOPE_HINT[editor.scope]}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">Body (markdown — Soroban patterns, rules, snippets)</span>
            {preview ? (
              <div className="rounded-lg border border-border bg-card/50 p-3">
                <Markdown content={editor.body || '_Nothing to preview yet._'} />
              </div>
            ) : (
              <Textarea
                value={editor.body}
                onChange={(e) => setEditor({ ...editor, body: e.target.value })}
                rows={16}
                placeholder={'# My pattern\\n\\nGuidance the Copilot should follow when building Soroban contracts…'}
                className="font-mono text-[12px]"
              />
            )}
          </div>
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            Skills are guidance the Copilot uses to write contracts more consistently. They can’t change its Soroban-only scope or safety rules — off-domain or role-changing content is rejected on save.
          </p>
        </div>
      </div>
    )
  }

  // ---- List view ----------------------------------------------------------
  const Row = ({ s }: { s: Skill }) => (
    <div className="flex items-start gap-2.5 rounded-lg border border-border/70 bg-card/40 p-2.5">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[13px] font-medium text-foreground">{s.name}</span>
          {s.official && <Badge variant="secondary" className="h-4 gap-0.5 px-1 text-[9px]"><ShieldCheck className="h-2.5 w-2.5" /> Official</Badge>}
          <Badge variant="outline" className="h-4 px-1 text-[9px] capitalize">{s.scope}</Badge>
        </div>
        {s.description && <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{s.description}</p>}
        <p className="mt-0.5 font-mono text-[10px] text-muted-foreground/70">@skill:{s.slug}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {busy === s.id ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <Switch checked={s.enabled} onCheckedChange={() => toggle(s)} title={s.enabled ? 'Enabled' : 'Disabled'} />
        )}
        {s.editable ? (
          <>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(s)} title="Edit"><Pencil className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(s)} title="Delete"><Trash2 className="h-3.5 w-3.5" /></Button>
          </>
        ) : (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => duplicate(s)} title="Duplicate to edit"><Copy className="h-3.5 w-3.5" /></Button>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <BookOpen className="h-4 w-4 text-brand" />
        <span className="text-sm font-semibold">Skills</span>
        <Badge variant="secondary" className="h-4 px-1 text-[9px]">{activeCount} active</Badge>
        <div className="ml-auto flex items-center gap-1">
          <Button size="sm" className="h-7 gap-1 text-xs" onClick={openNew}><Plus className="h-3.5 w-3.5" /> New</Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose} title="Close"><X className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3">
        {loading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : (
          <>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Reusable Soroban/Stellar knowledge the Copilot loads as context. Enable the ones you want; mention any with <span className="font-mono">@skill:slug</span> in a message to force-load it.
            </p>

            <section className="space-y-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Your skills</h3>
              {mine.length ? mine.map((s) => <Row key={s.id} s={s} />) : (
                <button onClick={openNew} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/70 py-4 text-[11px] text-muted-foreground transition hover:border-brand/40 hover:text-foreground">
                  <Plus className="h-3.5 w-3.5" /> Create your first skill
                </button>
              )}
            </section>

            <section className="space-y-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Official</h3>
              {official.length ? official.map((s) => <Row key={s.id} s={s} />) : (
                <p className="text-[11px] text-muted-foreground">No official skills available.</p>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}

export default SkillsPanel
