'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/toaster'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (countdown > 0) return
    
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setIsSent(true)
      setCountdown(30)
      toast({ title: 'Recovery email sent', description: 'Check your inbox for instructions to reset your password.', variant: 'success' })
    }, 1500)
  }

  return (
    <div className="min-h-screen flex bg-transparent items-center justify-center p-8">
      <div className="w-full max-w-sm glass-card p-8 shadow-2xl relative">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <Zap className="w-5 h-5 text-indigo-400" fill="currentColor" />
          </div>
          <span className="font-bold text-xl text-white tracking-wide">DAYFLOW</span>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          <p className="text-gray-400 mt-2 text-sm">Enter your email and we'll send you a recovery link</p>
        </div>

        {!isSent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <Button type="submit" className="w-full" loading={isLoading} size="lg">
              {isLoading ? 'Sending...' : 'Send Recovery Link'}
            </Button>
          </form>
        ) : (
          <div className="text-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-4">
            <div>
              <p className="text-emerald-400 font-medium">Email Sent!</p>
              <p className="text-sm text-gray-300 mt-2">Check your inbox at <strong>{email}</strong> for instructions.</p>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleSubmit} 
              disabled={isLoading || countdown > 0}
            >
              {countdown > 0 ? `Resend available in ${countdown}s` : 'Resend Email'}
            </Button>
          </div>
        )}

        <p className="text-center text-sm text-gray-400 mt-8">
          Remembered your password?{' '}
          <Link href="/login" className="text-indigo-400 font-medium hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}
