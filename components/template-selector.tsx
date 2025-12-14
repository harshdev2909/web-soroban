"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText, Code, Coins } from "lucide-react"
import { templatesApi, Template } from "@/lib/api"

interface TemplateSelectorProps {
  onTemplateSelect: (template: Template) => void
  onClose: () => void
}

export function TemplateSelector({ onTemplateSelect, onClose }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    loadTemplates()
  }, [])

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

  const handleTemplateSelect = (template: Template) => {
    onTemplateSelect(template)
    setIsDialogOpen(false)
    onClose()
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
      <DialogContent className="bg-gray-800 border-gray-700 text-gray-100 max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center text-gray-400">Loading templates...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className="bg-gray-700 border-gray-600 hover:border-gray-500 cursor-pointer transition-colors"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getTemplateIcon(template.category)}
                        <CardTitle className="text-sm text-gray-200">{template.name}</CardTitle>
                      </div>
                      <Badge className={getCategoryColor(template.category)}>
                        {template.category}
                      </Badge>
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
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 