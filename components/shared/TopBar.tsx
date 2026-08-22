'use client'

import Link from 'next/link'
import { Bell, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getGreeting, formatDate } from '@/lib/utils'

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

  const notifPath = ['ADMIN', 'HR'].includes(role) ? '/admin/notifications' : '/employee/notifications'

  return (
    <div className="flex items-center justify-between py-5 px-1">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {greeting}, <span className="text-indigo-600">{userName.split(' ')[0]}</span> 👋
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">{currentDate}</p>
      </div>

      <div className="flex items-center gap-3">
        {showSearch && (
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-56"
              onChange={e => onSearch?.(e.target.value)}
            />
          </div>
        )}

        <Link href={notifPath} className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </Link>
      </div>
    </div>
  )
}
