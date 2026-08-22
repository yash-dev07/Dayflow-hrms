'use client'

import { useState, useEffect } from 'react'
import { Bell, CheckCheck, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TopBar } from '@/components/shared/TopBar'
import { toast } from '@/components/ui/toaster'
import { formatDate } from '@/lib/utils'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const loadNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      setNotifications(data.notifications ?? [])
      setUnreadCount(data.unreadCount ?? 0)
    } catch {
      toast({ title: 'Error', description: 'Failed to load notifications', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadNotifications() }, [])

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'PATCH' })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
      toast({ title: 'All marked as read', variant: 'success' })
    } catch {
      toast({ title: 'Error', description: 'Failed to update', variant: 'destructive' })
    }
  }

  const markRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch {}
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      SUCCESS: 'text-emerald-500',
      WARNING: 'text-amber-500',
      ERROR: 'text-red-500',
      INFO: 'text-blue-500',
    }
    return colors[type] ?? 'text-gray-500'
  }

  const getTypeBg = (type: string, read: boolean) => {
    if (read) return 'bg-gray-50 border-gray-100'
    const bgs: Record<string, string> = {
      SUCCESS: 'bg-emerald-50 border-emerald-100',
      WARNING: 'bg-amber-50 border-amber-100',
      ERROR: 'bg-red-50 border-red-100',
      INFO: 'bg-blue-50 border-blue-100',
    }
    return bgs[type] ?? 'bg-indigo-50 border-indigo-100'
  }

  return (
    <div className="space-y-6 page-enter">
      <TopBar userName="Employee" role="EMPLOYEE" notificationCount={unreadCount} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 text-sm">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-20 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">You&apos;re all caught up!</p>
              <p className="text-gray-400 text-sm">No notifications at this time</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`flex gap-4 p-4 border-l-4 transition-all ${getTypeBg(notif.type, notif.read)} ${!notif.read ? 'border-l-indigo-400' : 'border-l-transparent'}`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <Bell className={`w-5 h-5 ${getTypeColor(notif.type)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`text-sm font-semibold ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>
                          {notif.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(notif.createdAt, 'MMM dd, hh:mm a')}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notif.read && (
                          <Badge variant="default" className="text-[10px]">New</Badge>
                        )}
                        {!notif.read && (
                          <button
                            onClick={() => markRead(notif.id)}
                            className="p-1 hover:bg-white rounded-md transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-3 h-3 text-gray-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
