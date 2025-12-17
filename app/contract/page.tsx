'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { InviteModal } from '@/components/invite-modal'

export default function ContractPage() {
  const router = useRouter()
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string>('')

  useEffect(() => {
    // Always show invite modal - no localStorage dependency
    setIsInviteModalOpen(true)
  }, [router])

  const handleInviteSuccess = () => {
    // No localStorage - just redirect to IDE after successful validation
    setIsInviteModalOpen(false)
    router.push('/ide')
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <InviteModal
        open={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
        userEmail={userEmail}
        onSuccess={handleInviteSuccess}
      />
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Access Required</h1>
          <p className="text-gray-400">Please enter your invite code to access the IDE</p>
        </div>
      </div>
    </div>
  )
}