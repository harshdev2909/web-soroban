"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText, Code, Coins, Lock, ExternalLink } from "lucide-react"
import { templatesApi, Template, TemplateDoc } from "@/lib/api"
import { TemplatePurchaseModal } from "@/components/template-purchase-modal"

interface TemplateSelectorProps {
  onTemplateSelect: (template: Template) => void
  onClose: () => void
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

  const getTemplateIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'token':
        return <Coins className="w-6 h-6 text-yellow-500" />
      case 'basic':
        return <Code className="w-6 h-6 text-blue-500" />
      case 'governance':
        return <FileText className="w-6 h-6 text-purple-500" />
      case 'nft':
        return <FileText className="w-6 h-6 text-pink-500" />
      case 'defi':
        return <FileText className="w-6 h-6 text-green-500" />
      case 'security':
        return <FileText className="w-6 h-6 text-red-500" />
      case 'marketplace':
        return <FileText className="w-6 h-6 text-orange-500" />
      default:
        return <FileText className="w-6 h-6 text-gray-500" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'token':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'basic':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'governance':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      case 'nft':
        return 'bg-pink-500/10 text-pink-500 border-pink-500/20'
      case 'defi':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'security':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'marketplace':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-800 border-gray-700 text-gray-100 max-w-2xl flex max-h-[85vh] flex-col gap-0 p-0">
        <DialogHeader className="border-b border-gray-700 px-6 py-4">
          <DialogTitle>Choose a Template</DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[148px] animate-pulse rounded-lg border border-gray-600 bg-gray-700/60"
                />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => {
                  const locked = template.price !== undefined && template.price > 0 && !template.hasAccess
                  return (
                    <Card
                      key={template.id}
                      className={`bg-gray-700 border-gray-600 transition-colors ${locked ? 'opacity-90' : 'hover:border-gray-500 cursor-pointer'}`}
                      onClick={() => !locked && handleTemplateSelect(template)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getTemplateIcon(template.category)}
                            <CardTitle className="text-sm text-gray-200">{template.name}</CardTitle>
                            {locked && <Lock className="w-4 h-4 text-amber-500" />}
                          </div>
                          <div className="flex items-center gap-1">
                            {template.price !== undefined && template.price > 0 && (
                              <Badge variant="secondary" className="text-xs bg-gray-600 text-gray-300">
                                {template.price} XLM
                              </Badge>
                            )}
                            <Badge className={getCategoryColor(template.category)}>
                              {template.category}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-gray-400 text-sm mb-3">
                          {template.description}
                        </CardDescription>
                        <div className="flex flex-wrap gap-1">
                          {template.files.map((file) => (
                            <Badge key={file} variant="secondary" className="text-xs bg-gray-600 text-gray-300">
                              {file}
                            </Badge>
                          ))}
                        </div>
                        {locked && (
                          <Button
                            size="sm"
                            className="mt-3 w-full"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleTemplateSelect(template)
                            }}
                          >
                            Purchase to use
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </>
          )}
        </div>

        <div className="border-t border-gray-700 px-6 py-3">
          <Link href="/marketplace" target="_blank" className="text-xs text-gray-400 hover:text-gray-300 inline-flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            Browse template docs & marketplace
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