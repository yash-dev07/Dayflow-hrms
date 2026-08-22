'use client'

import Link from 'next/link'
import { Bell, Search, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getGreeting, formatDate } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'

interface TopBarProps {
  userName: string
  role: string
  notificationCount?: number
  showSearch?: boolean
  onSearch?: (query: string) => void
}

export function TopBar({ userName, role, notificationCount = 0, showSearch, onSearch }: TopBarProps) {
  const [greeting, setGreeting] = useState('')
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    setGreeting(getGreeting())
    setCurrentDate(formatDate(new Date(), 'EEEE, MMMM d, yyyy'))
  }, [])

  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch {
      setIsLoggingOut(false)
    }
  }

  const notifPath = ['ADMIN', 'HR'].includes(role) ? '/admin/notifications' : '/employee/notifications'

  return (
    <div className="flex items-center justify-between py-5 px-1">
      <div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">
          {greeting}, <span className="gradient-text">{userName.split(' ')[0]}</span> 👋
        </h2>
        <p className="text-sm text-gray-400 mt-0.5 font-medium">{currentDate}</p>
      </div>

      <div className="flex items-center gap-3">
        {showSearch && (
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              className="pl-9 pr-4 py-2 text-sm border border-border rounded-xl bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 w-56 backdrop-blur-md shadow-sm transition-all focus:bg-accent/10"
              onChange={e => onSearch?.(e.target.value)}
            />
          </div>
        )}

        <Link href={notifPath} className="relative p-2 rounded-xl bg-muted border border-border hover:bg-accent/10 transition-all shadow-sm backdrop-blur-md">
          <Bell className="w-5 h-5 text-foreground" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </Link>

        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all shadow-sm backdrop-blur-md"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
        <ThemeToggle />
      </div>
    </div>
  )
}
