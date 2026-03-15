'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Coins, Code, FileText, Lock, Sparkles, ArrowRight } from 'lucide-react'
import { templatesApi, TemplateDoc } from '@/lib/api'

function getCategoryIcon(cat: string) {
  switch (cat.toLowerCase()) {
    case 'token': return <Coins className="w-5 h-5 text-amber-500" />
    case 'basic': return <Code className="w-5 h-5 text-blue-500" />
    case 'governance': return <FileText className="w-5 h-5 text-purple-500" />
    case 'nft': return <Sparkles className="w-5 h-5 text-pink-500" />
    case 'defi': return <FileText className="w-5 h-5 text-green-500" />
    case 'security': return <Lock className="w-5 h-5 text-red-500" />
    case 'marketplace': return <Coins className="w-5 h-5 text-orange-500" />
    default: return <FileText className="w-5 h-5 text-slate-500" />
  }
}

function getCategoryBadge(cat: string) {
  const map: Record<string, string> = {
    token: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    basic: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    governance: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    nft: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
    defi: 'bg-green-500/10 text-green-600 border-green-500/20',
    security: 'bg-red-500/10 text-red-600 border-red-500/20',
    marketplace: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  }
  return map[cat.toLowerCase()] || 'bg-slate-500/10 text-slate-600 border-slate-500/20'
}

export default function MarketplacePage() {
  const [templates, setTemplates] = useState<TemplateDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    templatesApi.getMarketplace().then((res) => {
      if (res.success && res.templates) setTemplates(res.templates)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100">
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-display text-slate-900">Template Library</h1>
                <p className="text-slate-600 text-sm">Public documentation & marketplace</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/docs">
                <Button variant="outline" size="sm">Docs</Button>
              </Link>
              <Link href="/">
                <Button size="sm">Launch IDE</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <p className="text-slate-600 mb-8 max-w-2xl">
          Browse smart contract templates. Free templates are available to everyone; premium templates use the same XLM payment as subscription plans. Each template includes full public documentation.
        </p>

        {loading ? (
          <div className="text-slate-500">Loading templates…</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((t) => (
              <Link key={t.id} href={`/marketplace/${t.id}`}>
                <Card className="h-full transition-shadow hover:shadow-lg border-slate-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(t.category)}
                        <CardTitle className="text-lg text-slate-900">{t.name}</CardTitle>
                      </div>
                      <Badge className={getCategoryBadge(t.category)}>{t.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <CardDescription className="text-slate-600 line-clamp-2">
                      {t.description}
                    </CardDescription>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {t.price === 0 ? 'Free' : `${t.price} XLM`}
                      </span>
                      <span className="text-slate-500 text-sm inline-flex items-center gap-1">
                        View docs <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
