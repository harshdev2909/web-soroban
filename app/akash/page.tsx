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
  Lock,
  Gift,
  Crown
} from 'lucide-react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-ide-production.up.railway.app/api'
const HARDCODED_PIN = '204099'

interface PremiumUser {
  email: string
  name?: string
  picture?: string
  subscription: {
    plan: string
    status: string
    startDate: string
    endDate: string | null
  }
  createdAt: string
}

interface GiftSuccessDetails {
  email: string
  isNewUser: boolean
  durationDays: number
  endDate: string | null
  emailSent: boolean
}

export default function AdminDashboard() {
  const [isPinVerified, setIsPinVerified] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')
  const [premiumUsers, setPremiumUsers] = useState<PremiumUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGifting, setIsGifting] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [bulkEmails, setBulkEmails] = useState('')
  const [durationDays, setDurationDays] = useState('30')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successDetails, setSuccessDetails] = useState<GiftSuccessDetails | null>(null)
  const [bulkSuccessDetails, setBulkSuccessDetails] = useState<{ success: number; failed: number; total: number } | null>(null)

  // Statistics
  const stats = {
    total: premiumUsers.length,
    active: premiumUsers.filter(u => u.subscription.status === 'active' && (!u.subscription.endDate || new Date(u.subscription.endDate) > new Date())).length,
    expired: premiumUsers.filter(u => u.subscription.status !== 'active' || (u.subscription.endDate && new Date(u.subscription.endDate) <= new Date())).length,
  }

  // Check PIN verification on mount
  useEffect(() => {
    const verified = sessionStorage.getItem('akash_pin_verified')
    if (verified === 'true') {
      setIsPinVerified(true)
      loadPremiumUsers()
    }
  }, [])

  // Handle PIN verification
  const handlePinSubmit = () => {
    if (pinInput === HARDCODED_PIN) {
      setIsPinVerified(true)
      sessionStorage.setItem('akash_pin_verified', 'true')
      setPinError('')
      setPinInput('')
      loadPremiumUsers()
      toast.success('Access granted')
    } else {
      setPinError('Incorrect PIN. Please try again.')
      setPinInput('')
    }
  }

  // Load premium users
  const loadPremiumUsers = async () => {
    try {
      setIsLoading(true)
      // Try to get token from various sources
      let token = localStorage.getItem('token')
      if (!token) {
        const cookieToken = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]
        if (cookieToken) token = cookieToken
      }
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(`${API_BASE_URL}/premium-gifts/list?limit=1000`, {
        headers,
        credentials: 'include'
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Authentication required. Please log in to your account first.')
          return
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to load premium users')
      }
      
      const data = await response.json()
      setPremiumUsers(data.users || [])
    } catch (error: any) {
      console.error('Failed to load premium users:', error)
      toast.error(error.message || 'Failed to load premium users')
    } finally {
      setIsLoading(false)
    }
  }

  // Gift premium to single email
  const handleGiftPremium = async () => {
    if (!emailInput || !emailInput.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsGifting(true)
    try {
      // Try to get token from various sources
      let token = localStorage.getItem('token')
      if (!token) {
        const cookieToken = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]
        if (cookieToken) token = cookieToken
      }
      
      if (!token) {
        toast.error('Please log in to your account first to gift premium subscriptions')
        setIsGifting(false)
        return
      }
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
      
      const response = await fetch(`${API_BASE_URL}/premium-gifts/gift`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ 
          email: emailInput.trim(),
          durationDays: parseInt(durationDays) || 30
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to gift premium`)
      }

      const data = await response.json()
      
      if (data.success) {
        // Show success modal
        setSuccessDetails({
          email: emailInput,
          isNewUser: data.isNewUser || false,
          durationDays: parseInt(durationDays) || 30,
          endDate: data.user?.subscription?.endDate || null,
          emailSent: data.emailSent || false
        })
        setShowSuccessModal(true)
        setEmailInput('')
        await loadPremiumUsers()
      } else {
        toast.error(data.error || 'Failed to gift premium')
      }
    } catch (error: any) {
      console.error('Failed to gift premium:', error)
      toast.error(error.message || 'Failed to gift premium')
    } finally {
      setIsGifting(false)
    }
  }

  // Gift premium to multiple emails
  const handleGiftBulk = async () => {
    const emails = bulkEmails
      .split('\n')
      .map(e => e.trim())
      .filter(e => e && e.includes('@'))

    if (emails.length === 0) {
      toast.error('Please enter at least one valid email address')
      return
    }

    setIsGifting(true)
    try {
      // Try to get token from various sources
      let token = localStorage.getItem('token')
      if (!token) {
        const cookieToken = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]
        if (cookieToken) token = cookieToken
      }
      
      if (!token) {
        toast.error('Please log in to your account first to gift premium subscriptions')
        setIsGifting(false)
        return
      }
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
      
      const response = await fetch(`${API_BASE_URL}/premium-gifts/gift-bulk`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ 
          emails: emails.map(e => e.trim()),
          durationDays: parseInt(durationDays) || 30
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to gift bulk premium`)
      }

      const data = await response.json()
      
      if (data.success) {
        // Show success modal for bulk
        setBulkSuccessDetails({
          success: data.results.success,
          failed: data.results.failed,
          total: emails.length
        })
        setShowSuccessModal(true)
        if (data.details && data.details.failed && data.details.failed.length > 0) {
          console.warn('Failed gifts:', data.details.failed)
        }
        setBulkEmails('')
        await loadPremiumUsers()
      } else {
        toast.error(data.error || 'Failed to gift bulk premium')
      }
    } catch (error: any) {
      console.error('Failed to gift bulk premium:', error)
      toast.error(error.message || 'Failed to gift bulk premium')
    } finally {
      setIsGifting(false)
    }
  }

  // Filter premium users
  const filteredUsers = premiumUsers.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesSearch
  })

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Email', 'Name', 'Plan', 'Status', 'Start Date', 'End Date', 'Created At']
    const rows = filteredUsers.map(user => [
      user.email,
      user.name || '',
      user.subscription.plan,
      user.subscription.status,
      user.subscription.startDate ? new Date(user.subscription.startDate).toLocaleDateString() : '',
      user.subscription.endDate ? new Date(user.subscription.endDate).toLocaleDateString() : '',
      new Date(user.createdAt).toLocaleDateString()
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `premium-users-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Premium users exported to CSV')
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
      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="bg-slate-800 border-slate-700 text-gray-100 sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
              <DialogTitle className="text-white text-2xl">Premium Gifted Successfully!</DialogTitle>
            </div>
            <DialogDescription className="text-gray-400">
              {successDetails 
                ? `Premium subscription has been gifted to ${successDetails.email}`
                : bulkSuccessDetails
                ? `Bulk premium gifting completed`
                : 'Premium subscription gifted successfully'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {successDetails ? (
              <>
                <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-2 border-yellow-500/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Crown className="w-6 h-6 text-yellow-400" />
                    <div>
                      <p className="text-white font-semibold">Premium Subscription Active</p>
                      <p className="text-gray-300 text-sm">{successDetails.email}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">User Type:</span>
                      <span className="text-white font-medium">
                        {successDetails.isNewUser ? 'New User' : 'Existing User'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Duration:</span>
                      <span className="text-white font-medium">{successDetails.durationDays} days</span>
                    </div>
                    {successDetails.endDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Valid Until:</span>
                        <span className="text-white font-medium">
                          {new Date(successDetails.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email Sent:</span>
                      <span className={successDetails.emailSent ? 'text-green-400 font-medium' : 'text-yellow-400 font-medium'}>
                        {successDetails.emailSent ? '✓ Yes' : '⚠ Failed'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <p className="text-sm text-gray-300 mb-2">Premium Benefits:</p>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>✓ Unlimited contract compilations</li>
                    <li>✓ Unlimited contract deployments</li>
                    <li>✓ Unlimited function testing calls</li>
                    <li>✓ Priority support</li>
                  </ul>
                </div>
              </>
            ) : bulkSuccessDetails ? (
              <>
                <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 border-2 border-purple-500/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="w-6 h-6 text-purple-400" />
                    <div>
                      <p className="text-white font-semibold">Bulk Premium Gifting Complete</p>
                      <p className="text-gray-300 text-sm">{bulkSuccessDetails.total} total emails processed</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Successful:</span>
                      <span className="text-green-400 font-medium">{bulkSuccessDetails.success}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Failed:</span>
                      <span className={bulkSuccessDetails.failed > 0 ? 'text-red-400 font-medium' : 'text-gray-400 font-medium'}>
                        {bulkSuccessDetails.failed}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Success Rate:</span>
                      <span className="text-white font-medium">
                        {Math.round((bulkSuccessDetails.success / bulkSuccessDetails.total) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
                {bulkSuccessDetails.failed > 0 && (
                  <Alert className="bg-red-900/20 border-red-500/50">
                    <AlertDescription className="text-red-400 text-sm">
                      Some emails failed to receive premium. Check the console for details.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            ) : null}
          </div>
          
          <DialogFooter>
            <Button
              onClick={() => {
                setShowSuccessModal(false)
                setSuccessDetails(null)
                setBulkSuccessDetails(null)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Crown className="w-8 h-8 text-yellow-400" />
              Premium Gifting Dashboard
            </h1>
            <p className="text-gray-400">Gift premium subscriptions to new and existing users</p>
          </div>
          <Button
            onClick={loadPremiumUsers}
            className="bg-slate-700 hover:bg-slate-600 text-white border-0"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Premium Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Active Premium</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{stats.active}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Expired</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{stats.expired}</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gift Single Premium */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Gift className="w-5 h-5 text-yellow-400" />
                Gift Premium
              </CardTitle>
              <CardDescription className="text-gray-400">
                Gift premium subscription to a single user (new or existing)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="bg-slate-900 border-slate-600 text-white"
                  onKeyDown={(e) => e.key === 'Enter' && handleGiftPremium()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-gray-300">Duration (days)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="30"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  className="bg-slate-900 border-slate-600 text-white"
                  min="1"
                />
              </div>
              <Button
                onClick={handleGiftPremium}
                disabled={isGifting || !emailInput}
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white border-0"
              >
                {isGifting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gifting...
                  </>
                ) : (
                  <>
                    <Gift className="w-4 h-4 mr-2" />
                    Gift Premium
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Bulk Gift Premium */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Bulk Gift Premium
              </CardTitle>
              <CardDescription className="text-gray-400">
                Gift premium to multiple users at once (one email per line)
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
              <div className="space-y-2">
                <Label htmlFor="bulk-duration" className="text-gray-300">Duration (days)</Label>
                <Input
                  id="bulk-duration"
                  type="number"
                  placeholder="30"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  className="bg-slate-900 border-slate-600 text-white"
                  min="1"
                />
              </div>
              <Button
                onClick={handleGiftBulk}
                disabled={isGifting || !bulkEmails.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white border-0 font-semibold"
              >
                {isGifting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gifting...
                  </>
                ) : (
                  <>
                    <Gift className="w-4 h-4 mr-2" />
                    Gift Premium to All
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Premium Users Table */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Premium Users</CardTitle>
                <CardDescription className="text-gray-400">
                  {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} shown
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
            {/* Search */}
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by email or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-900 border-slate-600 text-white"
                />
              </div>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No premium users found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-slate-800/50">
                      <TableHead className="text-gray-300">Email</TableHead>
                      <TableHead className="text-gray-300">Name</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Start Date</TableHead>
                      <TableHead className="text-gray-300">End Date</TableHead>
                      <TableHead className="text-gray-300">Days Remaining</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => {
                      const endDate = user.subscription.endDate ? new Date(user.subscription.endDate) : null
                      const now = new Date()
                      const isActive = user.subscription.status === 'active' && (!endDate || endDate > now)
                      const daysRemaining = endDate ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null
                      
                      return (
                        <TableRow key={user.email} className="border-slate-700 hover:bg-slate-800/50">
                          <TableCell className="text-white font-mono text-sm">{user.email}</TableCell>
                          <TableCell className="text-gray-300">{user.name || '-'}</TableCell>
                          <TableCell>
                            {isActive ? (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/50 w-fit">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge className="bg-red-500/20 text-red-400 border-red-500/50 w-fit">
                                <XCircle className="w-3 h-3 mr-1" />
                                Expired
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-gray-400 text-sm">
                            {user.subscription.startDate ? new Date(user.subscription.startDate).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell className="text-gray-400 text-sm">
                            {endDate ? endDate.toLocaleDateString() : 'Never'}
                          </TableCell>
                          <TableCell className="text-gray-400 text-sm">
                            {daysRemaining !== null ? (
                              daysRemaining > 0 ? (
                                <span className="text-green-400">{daysRemaining} days</span>
                              ) : (
                                <span className="text-red-400">Expired</span>
                              )
                            ) : (
                              <span className="text-yellow-400">Lifetime</span>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
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
