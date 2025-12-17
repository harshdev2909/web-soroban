'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Code2, 
  Rocket, 
  TestTube, 
  Bot, 
  Shield, 
  Package, 
  Cloud, 
  Zap, 
  Star,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Github,
  Globe,
  Play,
  Settings,
  HelpCircle,
  FileText,
  GitBranch,
  Terminal,
  Database,
  Cpu,
  Network,
  Wallet,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'

export default function DocumentationPage() {
  const [expandedSections, setExpandedSections] = useState<string[]>(['getting-started'])

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Play,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-heading text-slate-900 mb-3">Quick Start Guide</h3>
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <span className="text-slate-700">Clone the repository and install dependencies</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <span className="text-slate-700">Set up MongoDB and environment variables</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <span className="text-slate-700">Start the development servers</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <span className="text-slate-700">Open the IDE and create your first project</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-heading text-slate-900 mb-3">Prerequisites</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Cpu className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">Node.js 18+</span>
                  </div>
                  <p className="text-sm text-slate-600">JavaScript runtime for development</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Database className="w-5 h-5 text-green-500" />
                    <span className="font-medium">MongoDB</span>
                  </div>
                  <p className="text-sm text-slate-600">Database for project storage</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <GitBranch className="w-5 h-5 text-purple-500" />
                    <span className="font-medium">Git</span>
                  </div>
                  <p className="text-sm text-slate-600">Version control system</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Terminal className="w-5 h-5 text-orange-500" />
                    <span className="font-medium">npm/pnpm</span>
                  </div>
                  <p className="text-sm text-slate-600">Package manager</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'features',
      title: 'Features Overview',
      icon: Star,
      content: (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Code2 className="w-5 h-5 text-blue-500" />
                  <span>Professional IDE</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Monaco Editor with Rust syntax highlighting</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Advanced file management with custom naming</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Real-time auto-save functionality</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Professional dark theme UI</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Rocket className="w-5 h-5 text-green-500" />
                  <span>Deployment</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>One-click deployment to Stellar testnet</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Cloud-based WASM compilation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Real-time deployment logs</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Contract address tracking</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TestTube className="w-5 h-5 text-purple-500" />
                  <span>Testing</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Dynamic contract testing</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Real-time test analysis</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Security validation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Performance monitoring</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-orange-500" />
                  <span>AI Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>AI Copilot for code completion</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Smart contract templates</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Security audits</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Code suggestions</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'api',
      title: 'API Reference',
      icon: FileText,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-heading text-slate-900 mb-3">Projects API</h3>
            <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-slate-200">
{`GET    /api/projects          # List all projects
POST   /api/projects          # Create new project
GET    /api/projects/:id      # Get single project
PUT    /api/projects/:id      # Update project
DELETE /api/projects/:id      # Delete project`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-heading text-slate-900 mb-3">Compilation API</h3>
            <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-slate-200">
{`POST /api/compile

Request Body:
{
  "projectId": "string",
  "files": [
    {
      "name": "lib.rs",
      "content": "#![no_std]..."
    }
  ]
}`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-heading text-slate-900 mb-3">Deployment API</h3>
            <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-slate-200">
{`POST /api/deploy

Request Body:
{
  "projectId": "string",
  "wasmBase64": "string",
  "network": "testnet"
}`}
              </pre>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'stellar',
      title: 'Stellar Integration',
      icon: Network,
      content: (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wallet className="w-5 h-5 text-blue-500" />
                  <span>Wallet Integration</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-3">
                  Connect your Stellar wallet to deploy contracts and manage transactions.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Freighter wallet support</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Secure transaction signing</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Account balance monitoring</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cloud className="w-5 h-5 text-green-500" />
                  <span>Network Support</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-3">
                  Deploy to Stellar testnet and mainnet with automated configuration.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Testnet deployment</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Mainnet support (planned)</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Network status monitoring</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="text-lg font-heading text-slate-900 mb-3">Soroban Development</h3>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-700 mb-3">
                Web Soroban IDE is built specifically for Stellar Soroban smart contract development.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white rounded-lg border">
                  <Code2 className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <h4 className="font-medium text-slate-900">Rust Development</h4>
                  <p className="text-xs text-slate-600">Write Soroban contracts in Rust</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <Package className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <h4 className="font-medium text-slate-900">WASM Compilation</h4>
                  <p className="text-xs text-slate-600">Compile to WebAssembly</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <Rocket className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <h4 className="font-medium text-slate-900">Stellar Deployment</h4>
                  <p className="text-xs text-slate-600">Deploy to Stellar network</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: HelpCircle,
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium text-slate-900 mb-2">Compilation Issues</h4>
              <p className="text-sm text-slate-600 mb-2">
                If you encounter compilation errors, check the following:
              </p>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Ensure your Rust code follows Soroban SDK patterns</li>
                <li>• Check that all dependencies are properly imported</li>
                <li>• Verify the contract structure is correct</li>
                <li>• Review the compilation logs in the bottom panel</li>
              </ul>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-medium text-slate-900 mb-2">Deployment Issues</h4>
              <p className="text-sm text-slate-600 mb-2">
                Common deployment problems and solutions:
              </p>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Ensure your wallet is connected and has sufficient XLM</li>
                <li>• Check that the contract compiles successfully first</li>
                <li>• Verify network connectivity and status</li>
                <li>• Review deployment logs for specific error messages</li>
              </ul>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-medium text-slate-900 mb-2">File Management</h4>
              <p className="text-sm text-slate-600 mb-2">
                Issues with file operations:
              </p>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Cannot delete the last file in a project</li>
                <li>• Cannot delete the currently active file</li>
                <li>• File names must be unique within a project</li>
                <li>• Files are automatically saved as you type</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Need Help?</h4>
                <p className="text-sm text-blue-700 mb-3">
                  If you're still experiencing issues, check our support channels:
                </p>
                <div className="space-y-2">
                  <a href="https://github.com/WebSoroban/IDE/issues" className="flex items-center space-x-2 text-sm text-blue-700 hover:text-blue-900">
                    <Github className="w-4 h-4" />
                    <span>GitHub Issues</span>
                  </a>
                  <a href="https://discord.gg/websoroban" className="flex items-center space-x-2 text-sm text-blue-700 hover:text-blue-900">
                    <Globe className="w-4 h-4" />
                    <span>Discord Community</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-display text-slate-900">Documentation</h1>
                <p className="text-slate-600">Complete guide to Web Soroban IDE</p>
              </div>
            </div>
            <Button 
              onClick={() => {
                // Always redirect to home where invite modal will appear
                window.location.href = '/'
              }}
              className="bg-gradient-to-r from-blue-600 to-slate-700 hover:from-blue-700 hover:to-slate-800 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Launch IDE
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <h2 className="text-lg font-heading text-slate-900 mb-4">Table of Contents</h2>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-3 text-left rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <section.icon className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-700">{section.title}</span>
                    </div>
                    {expandedSections.includes(section.id) ? (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-8">
              {sections.map((section) => (
                <div key={section.id} className="bg-white rounded-xl shadow-sm border border-slate-200">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <section.icon className="w-6 h-6 text-blue-600" />
                      <h2 className="text-xl font-heading text-slate-900">{section.title}</h2>
                    </div>
                    {expandedSections.includes(section.id) ? (
                      <ChevronDown className="w-6 h-6 text-slate-500" />
                    ) : (
                      <ChevronRight className="w-6 h-6 text-slate-500" />
                    )}
                  </button>
                  
                  {expandedSections.includes(section.id) && (
                    <div className="px-6 pb-6">
                      {section.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 