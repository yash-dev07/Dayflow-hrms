'use client'

import { useState, useEffect, useCallback } from 'react'
import { Users, UserCheck, Clock, AlertCircle, TrendingUp, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TopBar } from '@/components/shared/TopBar'
import { toast } from '@/components/ui/toaster'
import { formatCurrency, formatDate, getDepartmentColor } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

interface DashboardStats {
  stats: {
    totalEmployees: number
    presentToday: number
    onLeaveToday: number
    pendingLeaveRequests: number
    totalPayroll: number
    absentToday: number
  }
  recentActivities: Array<{
    id: string
    action: string
    details: string | null
    createdAt: string
    actor: { profile: { firstName: string; lastName: string } | null; employeeId: string }
  }>
  attendanceOverview: Array<{ status: string; _count: { status: number } }>
  departmentDistribution: Array<{ department: string | null; _count: { department: number } }>
}

interface UserInfo {
  user: {
    profile: { firstName: string; lastName: string } | null
    email: string
    role: string
    employeeId: string
  }
}

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  const loadData = useCallback(async () => {
    try {
      const [statsRes, meRes, notifRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/auth/me'),
        fetch('/api/notifications'),
      ])
      const [statsData, meData, notifData] = await Promise.all([
        statsRes.json(), meRes.json(), notifRes.json()
      ])
      setStats(statsData)
      setUserInfo(meData)
      setUnreadCount(notifData.unreadCount ?? 0)
    } catch {
      toast({ title: 'Error', description: 'Failed to load dashboard', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-16 rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => <div key={i} className="skeleton h-64 rounded-xl" />)}
        </div>
      </div>
    )
  }

  const userName = userInfo?.user.profile
    ? `${userInfo.user.profile.firstName} ${userInfo.user.profile.lastName}`
    : userInfo?.user.email ?? 'Admin'

  const s = stats?.stats

  // Prepare chart data
  const attendanceChartData = [
    { name: 'Present', count: s?.presentToday ?? 0, color: '#10b981' },
    { name: 'Absent', count: s?.absentToday ?? 0, color: '#ef4444' },
    { name: 'Leave', count: s?.onLeaveToday ?? 0, color: '#6366f1' },
  ]

  const deptData = (stats?.departmentDistribution ?? [])
    .filter(d => d.department)
    .map((d, i) => ({
      name: d.department ?? 'Unknown',
      value: d._count.department,
      color: COLORS[i % COLORS.length]
    }))

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      EMPLOYEE_CREATED: '👤 Employee Created',
      EMPLOYEE_UPDATED: '✏️ Employee Updated',
      EMPLOYEE_DEACTIVATED: '🚫 Employee Deactivated',
      LEAVE_APPROVED: '✅ Leave Approved',
      LEAVE_REJECTED: '❌ Leave Rejected',
      LEAVE_SUBMITTED: '📋 Leave Submitted',
      SALARY_UPDATED: '💰 Salary Updated',
      ATTENDANCE_CORRECTED: '🔧 Attendance Corrected',
      CHECKED_IN: '🟢 Checked In',
      CHECKED_OUT: '🔴 Checked Out',
      PROFILE_UPDATED: '👤 Profile Updated',
    }
    return labels[action] ?? action
  }

  return (
    <div className="space-y-6 page-enter">
      <TopBar
        userName={userName}
        role={userInfo?.user.role ?? 'ADMIN'}
        notificationCount={unreadCount}
        showSearch={false}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Employees', value: s?.totalEmployees ?? 0, icon: Users, gradient: 'from-indigo-500 to-indigo-600', suffix: '' },
          { label: 'Present Today', value: s?.presentToday ?? 0, icon: UserCheck, gradient: 'from-emerald-500 to-emerald-600', suffix: '' },
          { label: 'On Leave', value: s?.onLeaveToday ?? 0, icon: Clock, gradient: 'from-blue-500 to-blue-600', suffix: '' },
          { label: 'Pending Leaves', value: s?.pendingLeaveRequests ?? 0, icon: AlertCircle, gradient: 'from-amber-500 to-amber-600', suffix: '' },
          { label: 'Monthly Payroll', value: s?.totalPayroll ?? 0, icon: TrendingUp, gradient: 'from-violet-500 to-violet-600', isCurrency: true },
        ].map(kpi => (
          <Card key={kpi.label} className={`border-0 shadow-sm bg-gradient-to-br ${kpi.gradient} text-white card-hover`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/70 text-xs font-medium">{kpi.label}</p>
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <kpi.icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-bold">
                {kpi.isCurrency ? formatCurrency(kpi.value as number) : kpi.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Overview Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Today&apos;s Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={attendanceChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {attendanceChartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {deptData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={deptData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {deptData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    formatter={(value: number) => [`${value} employees`, '']}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span style={{ fontSize: '11px', color: '#6b7280' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-52 flex items-center justify-center text-gray-400">
                No department data
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Absent Today</p>
                <p className="text-xl font-bold text-gray-900">{s?.absentToday ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Attendance Rate</p>
                <p className="text-xl font-bold text-gray-900">
                  {s?.totalEmployees
                    ? Math.round((s.presentToday / s.totalEmployees) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Leaves Need Review</p>
                <p className="text-xl font-bold text-gray-900">{s?.pendingLeaveRequests ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {(stats?.recentActivities ?? []).length === 0 ? (
            <div className="py-12 text-center text-gray-400">No recent activity</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {stats?.recentActivities.slice(0, 8).map(activity => (
                <div key={activity.id} className="flex gap-3 px-6 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0 w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{getActionLabel(activity.action)}</p>
                    {activity.details && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{activity.details}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      by {activity.actor.profile
                        ? `${activity.actor.profile.firstName} ${activity.actor.profile.lastName}`
                        : activity.actor.employeeId
                      } · {formatDate(activity.createdAt, 'MMM dd, hh:mm a')}
                    </p>
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
