'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Calendar, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TopBar } from '@/components/shared/TopBar'
import { toast } from '@/components/ui/toaster'
import { formatCurrency } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts'

interface ReportsData {
  attendanceStats: Array<{ status: string; _count: { status: number } }>
  leaveStats: Array<{ status: string; _count: { status: number } }>
  payrollStats: { _sum: { netSalary: number; grossSalary: number }; _avg: { netSalary: number }; _count: { id: number } }
  monthlyPayrollTrend: Array<{ month: number; year: number; _sum: { netSalary: number } }>
  leaveByType: Array<{ leaveTypeId: string; _count: { leaveTypeId: number }; _sum: { numberOfDays: number }; leaveType: { name: string; color: string } }>
}

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function AdminReportsPage() {
  const [data, setData] = useState<ReportsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30') // days

  useEffect(() => {
    setIsLoading(true)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(dateRange))
    
    fetch(`/api/reports?startDate=${startDate.toISOString()}`)
      .then(r => r.json())
      .then(setData)
      .catch(() => toast({ title: 'Error', description: 'Failed to load reports', variant: 'destructive' }))
      .finally(() => setIsLoading(false))
  }, [dateRange])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-16 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-80 rounded-xl" />)}
        </div>
      </div>
    )
  }

  // Format charts data
  const attendanceData = (data?.attendanceStats ?? []).map(d => ({
    name: d.status.replace('_', ' '),
    count: d._count.status,
    fill: d.status === 'PRESENT' ? '#10b981' : d.status === 'ABSENT' ? '#ef4444' : '#6366f1'
  }))

  const payrollTrend = (data?.monthlyPayrollTrend ?? []).map(d => ({
    name: `${MONTHS[d.month - 1]} ${d.year}`,
    total: d._sum.netSalary
  }))

  const leaveTypesData = (data?.leaveByType ?? []).map(d => ({
    name: d.leaveType.name,
    value: d._sum.numberOfDays,
    color: d.leaveType.color
  }))

  return (
    <div className="space-y-6 page-enter">
      <TopBar userName="Admin" role="ADMIN" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 text-sm">Comprehensive view of HR metrics</p>
        </div>
        <select
          value={dateRange}
          onChange={e => setDateRange(e.target.value)}
          className="h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-40"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 3 Months</option>
          <option value="180">Last 6 Months</option>
          <option value="365">Last Year</option>
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-indigo-500 text-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-indigo-200 text-xs font-medium">Total Payroll</p>
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(data?.payrollStats._sum.netSalary ?? 0)}</p>
            <p className="text-indigo-200 text-xs mt-1">
              Avg {formatCurrency(data?.payrollStats._avg.netSalary ?? 0)} per employee
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-emerald-500 text-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-emerald-200 text-xs font-medium">Total Leave Days</p>
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">
              {data?.leaveByType.reduce((sum, l) => sum + l._sum.numberOfDays, 0) ?? 0}
            </p>
            <p className="text-emerald-200 text-xs mt-1">Approved days off</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-amber-500 text-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-amber-200 text-xs font-medium">Leave Requests</p>
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">
              {data?.leaveStats.reduce((sum, s) => sum + s._count.status, 0) ?? 0}
            </p>
            <p className="text-amber-200 text-xs mt-1">Total requests in period</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Attendance Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {attendanceData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">No data</div>
            )}
          </CardContent>
        </Card>

        {/* Payroll Trend Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Payroll Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {payrollTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={payrollTrend} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px' }}
                    formatter={(val: any) => [formatCurrency(val), 'Net Salary']}
                  />
                  <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">No data</div>
            )}
          </CardContent>
        </Card>

        {/* Leave Type Distribution */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle>Leave Days by Type</CardTitle>
          </CardHeader>
          <CardContent>
            {leaveTypesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={leaveTypesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent ? (percent * 100).toFixed(0) : 0)}%`}
                    labelLine={false}
                  >
                    {leaveTypesData.map((entry, index) => (
                      <Cell key={index} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value} days`, 'Duration']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">No data</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
