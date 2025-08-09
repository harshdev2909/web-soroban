'use client'

import { Mail, CheckCircle, XCircle, Sparkles } from 'lucide-react'
import { useState } from 'react'

type Status = 'success' | 'error' | null

export default function PlaygroundSubscription() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<Status>(null)
  const [message, setMessage] = useState('')

  const handleSubmit = async () => {
    console.log('handleSubmit called with email:', email)

    if (!email || isSubmitting) {
      console.log('Early return - no email or already submitting')
      return
    }

    setIsSubmitting(true)
    setStatus(null)
    setMessage('')

    try {
      console.log('Making API call to /api/subscribe')

      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      console.log('Response status:', response.status)

      const data = await response.json()
      console.log('Response data:', data)

      if (response.ok) {
        setStatus('success')
        setMessage('Successfully subscribed! Check your email for confirmation.')
        setEmail('')
      } else {
        setStatus('error')
        if (data.details && data.details.title === 'Member Exists') {
          setMessage('This email is already subscribed.')
        } else {
          setMessage(data.error || 'Subscription failed. Please try again.')
        }
      }
    } catch (err) {
      console.error('Network error details:', err)
      setStatus('error')
      setMessage(`Network error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 w-6 h-6 bg-[#A3FF12] rounded-full animate-float animation-delay-1000 opacity-30"></div>
      <div className="absolute top-40 right-20 w-4 h-4 bg-[#FF4CF0] rounded-full animate-float animation-delay-1500 opacity-40"></div>
      <div className="absolute bottom-20 left-1/4 w-5 h-5 bg-[#F9F871] rounded-full animate-float animation-delay-2000 opacity-35"></div>
      <div className="absolute bottom-40 right-1/3 w-3 h-3 bg-purple-500 rounded-full animate-float animation-delay-2500 opacity-25"></div>

      <div className="max-w-5xl h-[25rem] w-full text-center bg-gradient-to-br from-gray-900/40 via-purple-900/20 to-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col items-center justify-center px-8 relative shadow-[10px_10px_30px_rgba(160,32,240,0.3),inset_-20px_-20px_60px_rgba(255,255,255,0.05)] hover:shadow-[15px_15px_40px_rgba(160,32,240,0.4)] transition-all duration-500 group">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#A3FF12]/5 via-[#FF4CF0]/5 to-[#F9F871]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-[#A3FF12] animate-pulse mr-3" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent animate-fade-in-up">
              Start Building
            </h1>
            <Sparkles className="w-8 h-8 text-[#FF4CF0] animate-pulse ml-3 animation-delay-500" />
          </div>

          <p className="text-gray-400 text-lg md:text-xl mb-12 max-w-lg mx-auto animate-fade-in-up animation-delay-200 hover:text-gray-300 transition-colors duration-300">
            No clutter. No delays. No dev drama.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-6 animate-fade-in-up animation-delay-400">
            <div className="relative flex-1 group/input">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within/input:text-[#A3FF12] transition-colors duration-300 z-10" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
                placeholder="Your mail address"
                className="w-full pl-12 pr-4 py-4 bg-black/20 backdrop-blur-sm border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#A3FF12] focus:shadow-[0_0_20px_rgba(163,255,18,0.3)] transition-all duration-300 hover:border-gray-500 hover:bg-black/30"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#A3FF12]/0 via-[#A3FF12]/5 to-[#A3FF12]/0 rounded-lg opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !email}
              className="px-8 py-4 bg-gradient-to-r from-[#A3FF12] to-[#A3FF12]/80 text-black font-semibold rounded-lg hover:from-[#A3FF12]/90 hover:to-[#A3FF12]/70 focus:outline-none focus:ring-2 focus:ring-[#A3FF12] focus:ring-offset-2 focus:ring-offset-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:shadow-[0_0_25px_rgba(163,255,18,0.5)] active:scale-95 relative overflow-hidden group/button"
            >
              {/* Button shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/button:translate-x-full transition-transform duration-700"></div>

              <span className="relative z-10 flex items-center justify-center">
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2"></div>
                    Getting Started...
                  </>
                ) : (
                  'Get Started'
                )}
              </span>
            </button>
          </div>

          {/* Status Messages */}
          {status && (
            <div
              className={`flex items-center justify-center gap-2 p-4 rounded-lg animate-fade-in-up backdrop-blur-sm border transition-all duration-500 transform ${
                status === 'success'
                  ? 'bg-[#A3FF12]/10 border-[#A3FF12]/30 text-[#A3FF12] shadow-[0_0_20px_rgba(163,255,18,0.2)]'
                  : 'bg-[#FF4CF0]/10 border-[#FF4CF0]/30 text-[#FF4CF0] shadow-[0_0_20px_rgba(255,76,240,0.2)]'
              }`}
            >
              {status === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0 animate-bounce" />
              ) : (
                <XCircle className="w-5 h-5 flex-shrink-0 animate-pulse" />
              )}
              <span className="text-sm font-medium">{message}</span>
            </div>
          )}
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 w-2 h-2 bg-[#F9F871] rounded-full animate-ping opacity-60"></div>
        <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-[#FF4CF0] rounded-full animate-ping animation-delay-1000 opacity-40"></div>
      </div>
    </div>
  )
}