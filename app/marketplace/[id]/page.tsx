'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, ArrowLeft, Coins, Code } from 'lucide-react'
import { templatesApi, TemplateDoc } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { TemplatePurchaseModal } from '@/components/template-purchase-modal'

export default function TemplateDocPage() {
  const params = useParams()
  const id = typeof params?.id === 'string' ? params.id : ''
  const [template, setTemplate] = useState<TemplateDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (!id) return
    templatesApi.getTemplateDoc(id).then((res) => {
      if (res.success && res.template) setTemplate(res.template)
    }).catch(console.error).finally(() => setLoading(false))
  }, [id])

  const purchased = (user?.purchasedTemplates as string[] | undefined) || []
  const hasAccess = template ? (template.price === 0 || purchased.includes(template.id)) : false

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <p className="text-slate-500">Loading…</p>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <p className="text-slate-600">Template not found</p>
        <Link href="/marketplace">
          <Button variant="outline">Back to marketplace</Button>
        </Link>
      </div>
    )
  }

  const doc = template.documentation

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100">
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/marketplace" className="text-slate-600 hover:text-slate-900 inline-flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Marketplace
              </Link>
              <span className="text-slate-300">/</span>
              <h1 className="text-xl font-display text-slate-900">{template.name}</h1>
              <Badge variant="secondary">{template.category}</Badge>
              {template.price === 0 ? (
                <Badge className="bg-green-500/10 text-green-700 border-green-500/20">Free</Badge>
              ) : (
                <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/20">
                  {template.price} XLM
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {template.price > 0 && !hasAccess && user && (
                <Button size="sm" onClick={() => setPurchaseModalOpen(true)}>
                  <Coins className="w-4 h-4 mr-2" />
                  Purchase template
                </Button>
              )}
              {template.price > 0 && !hasAccess && !user && (
                <Link href="/">
                  <Button size="sm">Sign in to purchase</Button>
                </Link>
              )}
              <Link href="/">
                <Button size="sm" variant="outline">Open IDE</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-lg font-heading text-slate-900 mb-2">Overview</h2>
            <p className="text-slate-600">{template.description}</p>
            {doc?.summary && (
              <p className="text-slate-600 mt-2">{doc.summary}</p>
            )}
          </section>

          {doc?.usage && (
            <section>
              <h2 className="text-lg font-heading text-slate-900 mb-2">Usage</h2>
              <p className="text-slate-600">{doc.usage}</p>
            </section>
          )}

          {doc?.functions && doc.functions.length > 0 && (
            <section>
              <h2 className="text-lg font-heading text-slate-900 mb-3">Functions</h2>
              <div className="space-y-3">
                {doc.functions.map((fn) => (
                  <Card key={fn.name} className="border-slate-200">
                    <CardHeader className="py-3">
                      <CardTitle className="text-base font-mono flex items-center gap-2">
                        <Code className="w-4 h-4 text-slate-500" />
                        {fn.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-1 text-sm">
                      {fn.params?.length ? (
                        <p className="text-slate-600">
                          Params: <code className="bg-slate-100 px-1 rounded">{fn.params.join(', ')}</code>
                        </p>
                      ) : null}
                      {fn.returns && (
                        <p className="text-slate-600">
                          Returns: <code className="bg-slate-100 px-1 rounded">{fn.returns}</code>
                        </p>
                      )}
                      <p className="text-slate-600">{fn.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {doc?.readMore && (
            <section>
              <h2 className="text-lg font-heading text-slate-900 mb-2">Read more</h2>
              <p className="text-slate-600">{doc.readMore}</p>
            </section>
          )}

          <section>
            <h2 className="text-lg font-heading text-slate-900 mb-2">Files</h2>
            <div className="flex flex-wrap gap-2">
              {template.files.map((f) => (
                <Badge key={f} variant="secondary">{f}</Badge>
              ))}
            </div>
          </section>
        </div>
      </main>

      <TemplatePurchaseModal
        open={purchaseModalOpen}
        onOpenChange={setPurchaseModalOpen}
        template={template}
        onSuccess={() => setPurchaseModalOpen(false)}
      />
    </div>
  )
}
