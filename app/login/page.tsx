'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/toaster'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed')
        return
      }

      toast({ title: 'Welcome back!', description: `Logged in as ${data.user.email}`, variant: 'success' })
      
      // Redirect based on role
      if (['ADMIN', 'HR'].includes(data.user.role)) {
        router.push('/admin/dashboard')
      } else {
        router.push('/employee/dashboard')
      }
      router.refresh()
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const demoLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail)
    setPassword(demoPass)
  }

  return (
    <div className="min-h-screen flex bg-transparent">
      {/* Left panel - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 border-r border-white/10 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" fill="white" />
            </div>
            <span className="text-white font-bold text-2xl">Dayflow</span>
          </div>
          <p className="text-indigo-300 text-sm">Every workday, perfectly aligned.</p>
        </div>

        <div className="relative space-y-6">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Your complete<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                HR platform
              </span>
            </h2>
            <p className="text-gray-400 mt-3 text-base leading-relaxed">
              Manage employees, track attendance, handle leave requests, and process payroll — all in one place.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { emoji: '👥', text: 'Employee Management' },
              { emoji: '⏰', text: 'Attendance Tracking' },
              { emoji: '📅', text: 'Leave Management' },
              { emoji: '💰', text: 'Payroll Processing' },
            ].map(f => (
              <div key={f.text} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
                <span className="text-xl">{f.emoji}</span>
                <span className="text-gray-300 text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <p className="text-gray-600 text-xs">© 2024 Dayflow HRMS. Built for the modern workplace.</p>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="flex-1 flex items-start justify-center p-8 pt-12 lg:pt-24 bg-transparent overflow-y-auto">
        <div className="w-full max-w-sm glass-card p-8 shadow-2xl">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="currentColor" />
            </div>
            <span className="font-bold text-xl text-foreground tracking-wide">DAYFLOW</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground mt-1">Sign in to your account to continue</p>
          </div>

          {/* Demo credentials */}
          <div className="mb-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 mb-2">🎯 Demo Accounts</p>
            <div className="space-y-1.5">
              {[
                { label: 'Admin', email: 'admin@dayflow.demo', pass: 'Admin@123', color: 'red' },
                { label: 'HR', email: 'hr@dayflow.demo', pass: 'Hr@12345', color: 'purple' },
                { label: 'Employee', email: 'employee@dayflow.demo', pass: 'Employee@123', color: 'green' },
              ].map(d => (
                <button
                  key={d.label}
                  onClick={() => demoLogin(d.email, d.pass)}
                  className="w-full text-left flex items-center justify-between text-xs p-2 rounded-lg hover:bg-indigo-500/20 transition-colors group"
                >
                  <span className="font-medium text-indigo-700 dark:text-indigo-300">{d.label}</span>
                  <span className="text-indigo-600/70 dark:text-indigo-400/70 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 truncate ml-2">{d.email}</span>
                  <span className="text-indigo-700 dark:text-indigo-300 ml-2 text-[10px] bg-indigo-500/20 px-1.5 py-0.5 rounded">click</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" loading={isLoading} size="lg">
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
