"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { 
  Mail, 
  Send, 
  Users, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Plus,
  Search,
  Copy,
  RefreshCw,
  Download,
  Loader2,
  Lock
} from 'lucide-react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-ide-production.up.railway.app/api'
const HARDCODED_PIN = '204099'

interface Invite {
  _id: string
  email: string
  inviteCode: string
  sent: boolean
  sentAt: string | null
  used: boolean
  usedAt: string | null
  usedBy: string | null
  createdAt: string
  updatedAt: string
}

export default function AdminDashboard() {
  const [isPinVerified, setIsPinVerified] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')
  const [invites, setInvites] = useState<Invite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [bulkEmails, setBulkEmails] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'sent' | 'unsent' | 'used' | 'unused'>('all')

  // Statistics
  const stats = {
    total: invites.length,
    sent: invites.filter(i => i.sent).length,
    unsent: invites.filter(i => !i.sent).length,
    used: invites.filter(i => i.used).length,
    unused: invites.filter(i => !i.used && i.sent).length,
  }

  // Check PIN verification on mount
  useEffect(() => {
    const verified = sessionStorage.getItem('akash_pin_verified')
    if (verified === 'true') {
      setIsPinVerified(true)
      loadInvites()
    }
  }, [])

  // Handle PIN verification
  const handlePinSubmit = () => {
    if (pinInput === HARDCODED_PIN) {
      setIsPinVerified(true)
      sessionStorage.setItem('akash_pin_verified', 'true')
      setPinError('')
      setPinInput('')
      loadInvites()
      toast.success('Access granted')
    } else {
      setPinError('Incorrect PIN. Please try again.')
      setPinInput('')
    }
  }

  // Load invites
  const loadInvites = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/invites?limit=1000`)
      if (!response.ok) throw new Error('Failed to load invites')
      const data = await response.json()
      setInvites(data.invites || [])
    } catch (error) {
      console.error('Failed to load invites:', error)
      toast.error('Failed to load invites')
    } finally {
      setIsLoading(false)
    }
  }

  // Send invite to single email
  const handleSendInvite = async () => {
    if (!emailInput || !emailInput.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsSending(true)
    try {
      const response = await fetch(`${API_BASE_URL}/invites/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput }),
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success(`Invite sent to ${emailInput}`)
        setEmailInput('')
        await loadInvites()
      } else {
        toast.error(data.error || 'Failed to send invite')
      }
    } catch (error) {
      console.error('Failed to send invite:', error)
      toast.error('Failed to send invite')
    } finally {
      setIsSending(false)
    }
  }

  // Send invites to multiple emails
  const handleSendBulk = async () => {
    const emails = bulkEmails
      .split('\n')
      .map(e => e.trim())
      .filter(e => e && e.includes('@'))

    if (emails.length === 0) {
      toast.error('Please enter at least one valid email address')
      return
    }

    setIsSending(true)
    try {
      const response = await fetch(`${API_BASE_URL}/invites/send-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails }),
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success(`Sent ${data.results.success} invites, ${data.results.failed} failed`)
        setBulkEmails('')
        await loadInvites()
      } else {
        toast.error(data.error || 'Failed to send bulk invites')
      }
    } catch (error) {
      console.error('Failed to send bulk invites:', error)
      toast.error('Failed to send bulk invites')
    } finally {
      setIsSending(false)
    }
  }

  // Generate bulk invites
  const handleGenerateBulk = async (count: number) => {
    setIsGenerating(true)
    try {
      const response = await fetch(`${API_BASE_URL}/invites/generate-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success(`Generated ${data.total} invite codes`)
        await loadInvites()
      } else {
        toast.error(data.error || 'Failed to generate invites')
      }
    } catch (error) {
      console.error('Failed to generate invites:', error)
      toast.error('Failed to generate invites')
    } finally {
      setIsGenerating(false)
    }
  }

  // Copy invite code
  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Invite code copied!')
  }

  // Filter invites
  const filteredInvites = invites.filter(invite => {
    const matchesSearch = 
      invite.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invite.inviteCode.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'sent' && invite.sent) ||
      (filter === 'unsent' && !invite.sent) ||
      (filter === 'used' && invite.used) ||
      (filter === 'unused' && !invite.used && invite.sent)
    
    return matchesSearch && matchesFilter
  })

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Email', 'Invite Code', 'Sent', 'Sent At', 'Used', 'Used At', 'Used By', 'Created At']
    const rows = filteredInvites.map(invite => [
      invite.email,
      invite.inviteCode,
      invite.sent ? 'Yes' : 'No',
      invite.sentAt || '',
      invite.used ? 'Yes' : 'No',
      invite.usedAt || '',
      invite.usedBy || '',
      invite.createdAt
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invites-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Invites exported to CSV')
  }

  // Show PIN dialog if not verified
  if (!isPinVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 flex items-center justify-center p-8">
        <Dialog open={true}>
          <DialogContent className="bg-slate-800 border-slate-700 text-gray-100 sm:max-w-[425px]">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-400" />
                <DialogTitle className="text-white">Access Restricted</DialogTitle>
              </div>
              <DialogDescription className="text-gray-400">
                Please enter the PIN to access the admin dashboard
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="pin" className="text-gray-300">PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  placeholder="Enter PIN"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value)
                    setPinError('')
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handlePinSubmit()
                    }
                  }}
                  className="bg-slate-900 border-slate-600 text-white"
                  autoFocus
                />
                {pinError && (
                  <Alert variant="destructive" className="bg-red-900/20 border-red-500/50">
                    <AlertDescription className="text-red-400">{pinError}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handlePinSubmit}
                disabled={!pinInput}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Verify
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Manage invite codes and user access</p>
          </div>
          <Button
            onClick={loadInvites}
            className="bg-slate-700 hover:bg-slate-600 text-white border-0"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Invites</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Sent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{stats.sent}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Unsent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{stats.unsent}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{stats.used}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Unused</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">{stats.unused}</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Send Single Invite */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Send className="w-5 h-5" />
                Send Invite
              </CardTitle>
              <CardDescription className="text-gray-400">
                Send an invite code to a single email address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                    onKeyDown={(e) => e.key === 'Enter' && handleSendInvite()}
                  />
                  <Button
                    onClick={handleSendInvite}
                    disabled={isSending || !emailInput}
                    className="bg-blue-600 hover:bg-blue-700 text-white border-0 min-w-[80px]"
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generate Bulk Invites */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Generate Invites
              </CardTitle>
              <CardDescription className="text-gray-400">
                Generate multiple invite codes (not sent yet)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  onClick={() => handleGenerateBulk(10)}
                  disabled={isGenerating}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white border-0"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Generate 10'
                  )}
                </Button>
                <Button
                  onClick={() => handleGenerateBulk(50)}
                  disabled={isGenerating}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white border-0"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Generate 50'
                  )}
                </Button>
                <Button
                  onClick={() => handleGenerateBulk(100)}
                  disabled={isGenerating}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white border-0"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Generate 100'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Send Section */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              Send Bulk Invites
            </CardTitle>
            <CardDescription className="text-gray-400">
              Send invites to multiple email addresses (one per line)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-emails" className="text-gray-300">Email Addresses</Label>
              <textarea
                id="bulk-emails"
                placeholder="user1@example.com&#10;user2@example.com&#10;user3@example.com"
                value={bulkEmails}
                onChange={(e) => setBulkEmails(e.target.value)}
                className="w-full h-32 p-3 bg-slate-900 border border-slate-600 rounded-md text-white placeholder-gray-500 resize-none"
              />
            </div>
            <Button
              onClick={handleSendBulk}
              disabled={isSending || !bulkEmails.trim()}
              className="w-full bg-green-600 hover:bg-green-700 text-white border-0 font-semibold"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Bulk Invites
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Invites Table */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">All Invites</CardTitle>
                <CardDescription className="text-gray-400">
                  {filteredInvites.length} invite{filteredInvites.length !== 1 ? 's' : ''} shown
                </CardDescription>
              </div>
              <Button
                onClick={exportToCSV}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white border-0"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search and Filter */}
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by email or invite code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-900 border-slate-600 text-white"
                />
              </div>
              <div className="flex gap-2">
                {(['all', 'sent', 'unsent', 'used', 'unused'] as const).map((f) => (
                  <Button
                    key={f}
                    onClick={() => setFilter(f)}
                    size="sm"
                    className={
                      filter === f 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white border-0' 
                        : 'bg-slate-700 hover:bg-slate-600 text-white border-0'
                    }
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : filteredInvites.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No invites found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-slate-800/50">
                      <TableHead className="text-gray-300">Email</TableHead>
                      <TableHead className="text-gray-300">Invite Code</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Sent At</TableHead>
                      <TableHead className="text-gray-300">Used At</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvites.map((invite) => (
                      <TableRow key={invite._id} className="border-slate-700 hover:bg-slate-800/50">
                        <TableCell className="text-white font-mono text-sm">{invite.email}</TableCell>
                        <TableCell className="font-mono text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-blue-400">{invite.inviteCode}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyInviteCode(invite.inviteCode)}
                              className="h-6 w-6 p-0 text-gray-300 hover:text-white hover:bg-slate-700"
                              title="Copy invite code"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {invite.sent ? (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/50 w-fit">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Sent
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 w-fit">
                                <Clock className="w-3 h-3 mr-1" />
                                Not Sent
                              </Badge>
                            )}
                            {invite.used ? (
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50 w-fit">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Used
                              </Badge>
                            ) : invite.sent && (
                              <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50 w-fit">
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-400 text-sm">
                          {invite.sentAt ? new Date(invite.sentAt).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell className="text-gray-400 text-sm">
                          {invite.usedAt ? new Date(invite.usedAt).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          {!invite.sent && (
                            <Button
                              onClick={async () => {
                                setEmailInput(invite.email)
                                await handleSendInvite()
                              }}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                            >
                              <Send className="w-3 h-3 mr-1" />
                              Send
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

