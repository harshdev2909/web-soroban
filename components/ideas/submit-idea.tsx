'use client'

import { useState, type FormEvent } from 'react'
import { CheckCircle2, Lightbulb, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { IdeaApiError, ideasApi, type IdeaForm } from '@/lib/ideasApi'

const empty: IdeaForm = {
  title: '',
  goal: '',
  description: '',
  alignment: '',
  author: '',
  contact: '',
  link: '',
  website: '',
}

const fields: {
  name: Exclude<keyof IdeaForm, 'website'>
  label: string
  hint?: string
  placeholder: string
  required?: boolean
  multiline?: boolean
  max: number
}[] = [
  { name: 'title', label: 'Title', placeholder: 'Passkey Smart Wallet', required: true, max: 90 },
  {
    name: 'goal',
    label: 'Goal',
    hint: 'One or two sentences: what it does and for whom.',
    placeholder: 'Let people sign in with Face ID instead of a seed phrase.',
    required: true,
    multiline: true,
    max: 400,
  },
  {
    name: 'description',
    label: 'Description',
    hint: 'How it works, key features, and the technical direction.',
    placeholder: 'A custom account contract that authorizes transactions with WebAuthn passkeys…',
    required: true,
    multiline: true,
    max: 5000,
  },
  {
    name: 'alignment',
    label: 'Stellar alignment',
    hint: 'Optional. Why this matters for the Stellar ecosystem.',
    placeholder: 'Removes the biggest onboarding barrier for mainstream users.',
    multiline: true,
    max: 1500,
  },
  { name: 'author', label: 'Your name or team', placeholder: 'Ada (Lumen Loop)', required: true, max: 80 },
  {
    name: 'contact',
    label: 'Email or Discord',
    hint: 'Only the WebSoroban team sees this.',
    placeholder: 'you@example.com',
    required: true,
    max: 120,
  },
  {
    name: 'link',
    label: 'Link',
    hint: 'Optional. A Discord thread, doc, or repo.',
    placeholder: 'https://',
    max: 300,
  },
]

const buttonClass =
  'inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60'
const solidClass = 'bg-primary text-primary-foreground hover:bg-primary/90'
const outlineClass = 'border border-border text-foreground hover:border-foreground/30'

export function SubmitIdeaButton({ variant = 'outline' }: { variant?: 'solid' | 'outline' }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<IdeaForm>(empty)
  const [error, setError] = useState<{ message: string; field?: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  function onOpenChange(next: boolean) {
    setOpen(next)
    if (!next && done) {
      setForm(empty)
      setDone(false)
    }
    setError(null)
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await ideasApi.submit(form)
      setDone(true)
    } catch (err) {
      const field = err instanceof IdeaApiError ? err.field : undefined
      setError({
        message: err instanceof Error ? err.message : 'Could not send your idea. Try again.',
        field,
      })
      if (field) requestAnimationFrame(() => document.getElementById(`idea-${field}`)?.focus())
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={
            variant === 'solid'
              ? `${buttonClass} lit ${solidClass}`
              : `${buttonClass} ${outlineClass}`
          }
        >
          <Lightbulb className="h-4 w-4" />
          Submit an idea
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        {done ? (
          <div className="py-4">
            <span className="grid h-12 w-12 place-items-center rounded-md border border-success/40 text-success">
              <CheckCircle2 className="h-6 w-6" />
            </span>
            <DialogTitle className="font-display mt-6 text-xl font-medium">Thanks, we got it.</DialogTitle>
            <DialogDescription className="mt-2 leading-6">
              The team reviews every idea. If it’s a fit for the Idea Bank, we’ll feature it here and credit you.
            </DialogDescription>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className={`${buttonClass} lit mt-6 ${solidClass}`}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-xl font-medium">Submit an idea</DialogTitle>
              <DialogDescription>
                Pitch something worth building on Stellar. Ideas the team accepts are featured in the Idea Bank with
                your name on them.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={onSubmit} className="mt-2 space-y-4" noValidate>
              {fields.map((field) => {
                const id = `idea-${field.name}`
                const invalid = error?.field === field.name
                const describedBy = [field.hint && `${id}-hint`, invalid && `${id}-error`].filter(Boolean).join(' ')
                const common = {
                  id,
                  name: field.name,
                  value: form[field.name],
                  placeholder: field.placeholder,
                  maxLength: field.max,
                  required: field.required,
                  'aria-invalid': invalid || undefined,
                  'aria-describedby': describedBy || undefined,
                  onChange: (e: { target: { value: string } }) =>
                    setForm((prev) => ({ ...prev, [field.name]: e.target.value })),
                }
                return (
                  <div key={field.name} className="space-y-1.5">
                    <Label htmlFor={id}>
                      {field.label}
                      {field.required && <span className="text-brand"> *</span>}
                    </Label>
                    {field.multiline ? (
                      <Textarea {...common} rows={field.name === 'description' ? 6 : 3} />
                    ) : (
                      <Input {...common} type={field.name === 'link' ? 'url' : 'text'} />
                    )}
                    {field.hint && (
                      <p id={`${id}-hint`} className="text-xs text-muted-foreground">
                        {field.hint}
                      </p>
                    )}
                    {invalid && (
                      <p id={`${id}-error`} className="text-xs text-destructive">
                        {error?.message}
                      </p>
                    )}
                  </div>
                )
              })}

              <div className="hidden" aria-hidden>
                <label htmlFor="idea-website">Website</label>
                <input
                  id="idea-website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.website}
                  onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))}
                />
              </div>

              {error && !error.field && (
                <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
                  {error.message}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className={`${buttonClass} ${outlineClass}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`${buttonClass} lit ${solidClass}`}
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {submitting ? 'Sending…' : 'Send for review'}
                </button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
