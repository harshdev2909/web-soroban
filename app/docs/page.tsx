'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BookOpen, Play } from 'lucide-react'

export default function DocumentationPage() {
  // Docs page commented out – full content preserved below in block comment for restoration
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <BookOpen className="w-16 h-16 text-blue-600 mx-auto mb-4 opacity-80" />
        <h1 className="text-2xl font-display text-slate-900 mb-2">Documentation</h1>
        <p className="text-slate-600 mb-6">Documentation is currently unavailable.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/marketplace">
            <Button variant="outline" size="sm">Template Library</Button>
          </Link>
          <Link href="/">
            <Button size="sm">
              <Play className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

/*
ORIGINAL DOCS PAGE CONTENT (commented out – uncomment and remove the return above to restore):

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Code2, Rocket, TestTube, Bot, Shield, Package, Cloud, Zap, Star,
  ArrowRight, ChevronRight, ChevronDown, ExternalLink, Github, Globe,
  Settings, HelpCircle, FileText, GitBranch, Terminal, Database, Cpu,
  Network, Wallet, CheckCircle, AlertCircle, Info
} from 'lucide-react'

  const [expandedSections, setExpandedSections] = useState<string[]>(['getting-started'])
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }
  const sections = [ ... full sections array and JSX from original file ... ]
  return ( ... full original JSX ... )
*/
