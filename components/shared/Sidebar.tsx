'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, User, Clock, Calendar, DollarSign, Bell, Settings,
  LogOut, FileText, Users, ClipboardList, BarChart3, X, Menu, Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/toaster'

const employeeNavItems = [
  { href: '/employee/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/employee/profile', icon: User, label: 'My Profile' },
  { href: '/employee/attendance', icon: Clock, label: 'Attendance' },
  { href: '/employee/leave', icon: Calendar, label: 'Leave' },
  { href: '/employee/payroll', icon: DollarSign, label: 'Payroll' },
  { href: '/employee/documents', icon: FileText, label: 'Documents' },
  { href: '/employee/notifications', icon: Bell, label: 'Notifications' },
  { href: '/employee/settings', icon: Settings, label: 'Settings' },
]

const adminNavItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/employees', icon: Users, label: 'Employees' },
  { href: '/admin/attendance', icon: Clock, label: 'Attendance' },
  { href: '/admin/leaves', icon: Calendar, label: 'Leave Requests' },
  { href: '/admin/payroll', icon: DollarSign, label: 'Payroll' },
  { href: '/admin/reports', icon: BarChart3, label: 'Reports' },
  { href: '/admin/notifications', icon: Bell, label: 'Notifications' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
]

interface SidebarProps {
  role: 'EMPLOYEE' | 'HR' | 'ADMIN'
  userName: string
  employeeId: string
  profilePicture?: string
}

export function Sidebar({ role, userName, employeeId, profilePicture }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const navItems = ['ADMIN', 'HR'].includes(role) ? adminNavItems : employeeNavItems

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch {
      toast({ title: 'Error', description: 'Failed to logout', variant: 'destructive' })
      setIsLoggingOut(false)
    }
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
          <Zap className="w-5 h-5 text-indigo-400" fill="currentColor" />
        </div>
        <div>
          <h1 className="text-foreground font-bold text-base leading-tight tracking-wide">DAYFLOW</h1>
          <p className="text-indigo-400/70 text-xs font-medium">HRMS Platform</p>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center overflow-hidden">
            {profilePicture ? (
              <img src={profilePicture} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-indigo-400 text-sm font-semibold">
                {userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-foreground text-sm font-medium truncate">{userName}</p>
            <p className="text-gray-500 text-xs">{employeeId}</p>
          </div>
          <span className={cn(
            'text-xs px-1.5 py-0.5 rounded font-medium',
            role === 'ADMIN' ? 'bg-red-500/20 text-red-400' :
            role === 'HR' ? 'bg-purple-500/20 text-purple-400' :
            'bg-emerald-500/20 text-emerald-400'
          )}>
            {role}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                'sidebar-item',
                isActive && 'active'
              )}
            >
              <item.icon className={cn('w-4 h-4', isActive ? 'text-indigo-400' : 'text-gray-500')} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="sidebar-item w-full text-left hover:bg-red-900/20 hover:text-red-400"
        >
          <LogOut className="w-4 h-4 text-gray-500" />
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 sidebar h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-xl bg-card backdrop-blur-md border border-border text-foreground shadow-[0_4px_15px_rgba(0,0,0,0.1)] transition-all hover:bg-muted"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile sidebar */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setIsMobileOpen(false)} />
          <aside className="relative w-60 sidebar h-full z-50">
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  )
}
