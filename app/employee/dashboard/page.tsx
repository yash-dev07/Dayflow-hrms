'use client'

import { useState, useEffect, useCallback } from 'react'
import { Clock, Calendar, DollarSign, TrendingUp, LogIn, LogOut, CheckCircle, User, FileText, Bell } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TopBar } from '@/components/shared/TopBar'
import { toast } from '@/components/ui/toaster'
import { formatTime, formatCurrency, formatDate } from '@/lib/utils'

interface DashboardData {
  todayAttendance: {
    id: string
    checkIn: string | null
    checkOut: string | null
    status: string
    workedHours: number | null
  } | null
  leaveBalance: Array<{ id: string; name: string; annualAllowance: number; used: number; remaining: number; color: string }>
  pendingLeaves: number
  salary: { netSalary: number; grossSalary: number } | null
  totalWorkedHours: number
  recentNotifications: Array<{ id: string; title: string; message: string; read: boolean; createdAt: string }>
}

interface UserInfo {
  id: string
  employeeId: string
  email: string
  role: string
  profile: { firstName: string; lastName: string; department: string; designation: string } | null
}

export default function EmployeeDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const [dashRes, meRes] = await Promise.all([
        fetch('/api/dashboard/employee'),
        fetch('/api/auth/me'),
      ])
      const [dashData, meData] = await Promise.all([dashRes.json(), meRes.json()])
      setData(dashData)
      setUser(meData.user)
    } catch {
      toast({ title: 'Error', description: 'Failed to load dashboard', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleCheckIn = async () => {
    setIsCheckingIn(true)
    try {
      const res = await fetch('/api/attendance/check-in', { method: 'POST' })
      const result = await res.json()
      if (!res.ok) {
        toast({ title: 'Check-in Failed', description: result.error, variant: 'destructive' })
        return
      }
      toast({ title: 'Checked In! ✅', description: `Welcome! Checked in at ${formatTime(result.attendance.checkIn)}`, variant: 'success' })
      await loadData()
    } catch {
      toast({ title: 'Error', description: 'Failed to check in', variant: 'destructive' })
    } finally {
      setIsCheckingIn(false)
    }
  }

  const handleCheckOut = async () => {
    setIsCheckingOut(true)
    try {
      const res = await fetch('/api/attendance/check-out', { method: 'POST' })
      const result = await res.json()
      if (!res.ok) {
        toast({ title: 'Check-out Failed', description: result.error, variant: 'destructive' })
        return
      }
      toast({ title: 'Checked Out! 👋', description: `Worked ${result.attendance.workedHours?.toFixed(1)} hours today`, variant: 'success' })
      await loadData()
    } catch {
      toast({ title: 'Error', description: 'Failed to check out', variant: 'destructive' })
    } finally {
      setIsCheckingOut(false)
    }
  }

  const attendance = data?.todayAttendance
  const hasCheckedIn = !!attendance?.checkIn
  const hasCheckedOut = !!attendance?.checkOut
  const userName = user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user?.email ?? 'User'
  const unreadCount = data?.recentNotifications?.filter((n: any) => !n.read).length ?? 0

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-16 w-full rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
        <div className="skeleton h-48 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 page-enter">
      <TopBar userName={userName} role={user?.role ?? 'EMPLOYEE'} notificationCount={unreadCount} />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-hover border-0 shadow-sm bg-indigo-500 text-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-200 text-xs font-medium">Today's Status</p>
                <p className="text-2xl font-bold mt-1">
                  {hasCheckedOut ? 'Done' : hasCheckedIn ? 'Active' : 'Not In'}
                </p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-indigo-200 text-xs mt-2">
              {hasCheckedIn ? `In: ${formatTime(attendance?.checkIn)}` : 'Not yet checked in'}
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover border-0 shadow-sm bg-emerald-500 text-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-200 text-xs font-medium">Leave Balance</p>
                <p className="text-2xl font-bold mt-1">
                  {data?.leaveBalance.find(l => l.name === 'Paid Leave')?.remaining ?? 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <p className="text-emerald-200 text-xs mt-2">Paid leave days remaining</p>
          </CardContent>
        </Card>

        <Card className="card-hover border-0 shadow-sm bg-violet-500 text-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-200 text-xs font-medium">Hours This Month</p>
                <p className="text-2xl font-bold mt-1">{data?.totalWorkedHours ?? 0}h</p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-violet-200 text-xs mt-2">Total working hours</p>
          </CardContent>
        </Card>

        <Card className="card-hover border-0 shadow-sm bg-amber-500 text-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-200 text-xs font-medium">Net Salary</p>
                <p className="text-2xl font-bold mt-1">
                  {data?.salary ? formatCurrency(data.salary.netSalary) : '—'}
                </p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-amber-200 text-xs mt-2">Current month salary</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Card */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-gray-900 text-base">Today&apos;s Work</h3>
                <p className="text-gray-500 text-sm">{formatDate(new Date())}</p>
              </div>
              {attendance && (
                <Badge variant={
                  attendance.status === 'PRESENT' ? 'success' :
                  attendance.status === 'LEAVE' ? 'blue' :
                  attendance.status === 'HALF_DAY' ? 'warning' : 'secondary'
                }>
                  {attendance.status.replace('_', ' ')}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Check In</p>
                <p className="text-lg font-bold text-gray-900">{hasCheckedIn ? formatTime(attendance?.checkIn) : '—'}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Check Out</p>
                <p className="text-lg font-bold text-gray-900">{hasCheckedOut ? formatTime(attendance?.checkOut) : '—'}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Worked Hours</p>
                <p className="text-lg font-bold text-gray-900">
                  {attendance?.workedHours ? `${attendance.workedHours.toFixed(1)}h` : '—'}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleCheckIn}
                disabled={hasCheckedIn}
                loading={isCheckingIn}
                className="flex-1"
                variant={hasCheckedIn ? 'secondary' : 'default'}
              >
                <LogIn className="w-4 h-4" />
                {hasCheckedIn ? 'Checked In' : 'Check In'}
              </Button>
              <Button
                onClick={handleCheckOut}
                disabled={!hasCheckedIn || hasCheckedOut}
                loading={isCheckingOut}
                className="flex-1"
                variant={hasCheckedOut ? 'secondary' : hasCheckedIn ? 'success' : 'outline'}
              >
                <LogOut className="w-4 h-4" />
                {hasCheckedOut ? 'Checked Out' : 'Check Out'}
              </Button>
            </div>

            {hasCheckedOut && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <p className="text-sm text-emerald-700 font-medium">
                  Great work today! You worked {attendance?.workedHours?.toFixed(1)} hours.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leave Balance */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 text-base mb-4">Leave Balance</h3>
            <div className="space-y-4">
              {data?.leaveBalance.map(leave => (
                <div key={leave.id}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-700 font-medium">{leave.name}</span>
                    <span className="text-gray-500">{leave.remaining}/{leave.annualAllowance}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(leave.remaining / leave.annualAllowance) * 100}%`,
                        backgroundColor: leave.color,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{leave.used} used</p>
                </div>
              ))}
            </div>

            {data?.pendingLeaves ? (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-xs text-amber-700 font-medium">
                  📋 {data.pendingLeaves} leave request{data.pendingLeaves > 1 ? 's' : ''} pending
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { href: '/employee/profile', icon: User, label: 'My Profile', color: 'bg-indigo-50 text-indigo-600' },
            { href: '/employee/attendance', icon: Clock, label: 'Attendance', color: 'bg-blue-50 text-blue-600' },
            { href: '/employee/leave', icon: Calendar, label: 'Apply Leave', color: 'bg-emerald-50 text-emerald-600' },
            { href: '/employee/payroll', icon: DollarSign, label: 'Payroll', color: 'bg-amber-50 text-amber-600' },
            { href: '/employee/documents', icon: FileText, label: 'Documents', color: 'bg-purple-50 text-purple-600' },
          ].map(action => (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col items-center gap-2 p-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center`}>
                <action.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-gray-700">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Notifications */}
      {data?.recentNotifications && data.recentNotifications.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 text-base">Recent Activity</h3>
              <Link href="/employee/notifications" className="text-sm text-indigo-600 hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {data.recentNotifications.slice(0, 4).map(notif => (
                <div key={notif.id} className={`flex gap-3 p-3 rounded-xl ${notif.read ? 'bg-gray-50' : 'bg-indigo-50 border border-indigo-100'}`}>
                  <Bell className={`w-4 h-4 mt-0.5 flex-shrink-0 ${notif.read ? 'text-gray-400' : 'text-indigo-500'}`} />
                  <div>
                    <p className={`text-sm font-medium ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>{notif.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(notif.createdAt, 'MMM dd, hh:mm a')}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
