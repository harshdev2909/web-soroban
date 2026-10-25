"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, FileText, Code, Coins, Lock, ExternalLink, WalletCards, Landmark, Sparkles, TrendingUp, ShieldCheck, Store } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { templatesApi, Template, TemplateDoc } from "@/lib/api"
import { TemplatePurchaseModal } from "@/components/template-purchase-modal"
import { cn } from "@/lib/utils"

interface TemplateSelectorProps {
  onTemplateSelect: (template: Template) => void
  onClose: () => void
}

const CATEGORY_META: Record<string, { icon: LucideIcon; chip: string }> = {
  token: { icon: Coins, chip: "border-warning/25 text-warning" },
  basic: { icon: Code, chip: "border-brand/25 text-brand" },
  governance: { icon: Landmark, chip: "border-cosmic/25 text-cosmic" },
  nft: { icon: Sparkles, chip: "border-info/25 text-info" },
  defi: { icon: TrendingUp, chip: "border-success/25 text-success" },
  security: { icon: ShieldCheck, chip: "border-destructive/25 text-destructive" },
  marketplace: { icon: Store, chip: "border-warning/25 text-warning" },
  payments: { icon: WalletCards, chip: "border-brand/25 text-brand" },
}

function categoryMeta(category: string) {
  return CATEGORY_META[category.toLowerCase()] ?? { icon: FileText, chip: "border-border text-muted-foreground" }
}

export function TemplateSelector({ onTemplateSelect, onClose }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false)
  const [purchaseTemplate, setPurchaseTemplate] = useState<TemplateDoc | null>(null)

  const loadTemplates = async () => {
    setIsLoading(true)
    try {
      const templatesData = await templatesApi.getTemplates()
      setTemplates(templatesData)
    } catch (error) {
      console.error("Failed to load templates:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isDialogOpen) loadTemplates()
  }, [isDialogOpen])

  const handleTemplateSelect = (template: Template) => {
    if (template.price !== undefined && template.price > 0 && !template.hasAccess) {
      templatesApi.getTemplateDoc(template.id).then((res) => {
        if (res.success && res.template) {
          setPurchaseTemplate(res.template)
          setPurchaseModalOpen(true)
        }
      }).catch(console.error)
      return
    }
    onTemplateSelect(template)
    setIsDialogOpen(false)
    onClose()
  }

  const handlePurchaseSuccess = () => {
    loadTemplates()
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col gap-0 p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle className="font-display font-medium">Choose a template</DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[148px] rounded-md" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {templates.map((template, index) => {
                const locked = template.price !== undefined && template.price > 0 && !template.hasAccess
                const meta = categoryMeta(template.category)
                const Icon = meta.icon
                return (
                  <div
                    key={template.id}
                    className={cn(
                      "flex flex-col rounded-md border border-border bg-card p-4 transition-colors duration-150",
                      locked ? "opacity-90" : "cursor-pointer hover:border-foreground/30",
                    )}
                    onClick={() => !locked && handleTemplateSelect(template)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-3">
                        <span className="font-mono text-[0.62rem] tracking-[0.14em] text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
                        {locked && <Lock className="h-3.5 w-3.5 text-warning" aria-label="Premium template" />}
                      </span>
                      <span className="flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.14em]">
                        {template.price !== undefined && template.price > 0 && (
                          <span className="rounded-sm border border-border px-1.5 py-0.5 text-muted-foreground">
                            {template.price} XLM
                          </span>
                        )}
                        <span className={cn("rounded-sm border px-1.5 py-0.5", meta.chip)}>
                          {template.category}
                        </span>
                      </span>
                    </div>
                    <h3 className="mt-4 font-display text-base font-medium text-foreground">{template.name}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                      {template.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {template.files.map((file) => (
                        <span key={file} className="rounded-sm border border-border px-1.5 py-0.5 font-mono text-[0.62rem] text-muted-foreground">
                          {file}
                        </span>
                      ))}
                    </div>
                    {locked && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-4 w-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTemplateSelect(template)
                        }}
                      >
                        Purchase to use
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="border-t border-border px-6 py-3">
          <Link href="/marketplace" target="_blank" className="inline-flex min-h-9 items-center gap-1.5 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground transition-colors duration-150 hover:text-foreground">
            <ExternalLink className="h-3 w-3" />
            Browse template docs &amp; marketplace
          </Link>
        </div>
      </DialogContent>
      <TemplatePurchaseModal
        open={purchaseModalOpen}
        onOpenChange={setPurchaseModalOpen}
        template={purchaseTemplate}
        onSuccess={handlePurchaseSuccess}
      />
    </Dialog>
  )
}
