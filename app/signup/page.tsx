'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Zap, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/toaster'

const passwordRequirements = [
  { label: 'At least 8 characters', regex: /.{8,}/ },
  { label: 'One uppercase letter', regex: /[A-Z]/ },
  { label: 'One lowercase letter', regex: /[a-z]/ },
  { label: 'One number', regex: /[0-9]/ },
  { label: 'One special character', regex: /[^A-Za-z0-9]/ },
]

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    employeeId: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Registration failed')
        return
      }

      toast({ title: 'Account created!', description: 'Please sign in with your new account.', variant: 'success' })
      router.push('/login')
    } catch {
      setError('An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-8">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <Zap className="w-5 h-5 text-indigo-400" fill="currentColor" />
          </div>
          <span className="font-bold text-xl text-white tracking-wide">DAYFLOW</span>
        </div>

        <div className="glass-card shadow-2xl p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-white">Create account</h1>
            <p className="text-gray-400 mt-1 text-sm">Join Dayflow as an employee</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input id="employeeId" placeholder="DF-EMP-XXX" value={form.employeeId} onChange={handleChange('employeeId')} required />
              </div>
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" placeholder="John Doe" value={form.fullName} onChange={handleChange('fullName')} required />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="you@company.com" value={form.email} onChange={handleChange('email')} required />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={handleChange('password')}
                  required
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password requirements */}
              {form.password && (
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map(req => {
                    const met = req.regex.test(form.password)
                    return (
                      <div key={req.label} className={`flex items-center gap-2 text-xs ${met ? 'text-emerald-600' : 'text-gray-400'}`}>
                        <CheckCircle2 className={`w-3 h-3 ${met ? 'text-emerald-500' : 'text-gray-300'}`} />
                        {req.label}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={handleChange('confirmPassword')}
                required
                className={form.confirmPassword && form.password !== form.confirmPassword ? 'border-red-300' : ''}
              />
            </div>

            <div className="text-xs text-gray-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
              ℹ️ Public registration creates an Employee account. Contact your HR for HR/Admin access.
            </div>

            <Button type="submit" className="w-full btn-3d" loading={isLoading} size="lg">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-400 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
