'use client'

import { useState, useEffect, useCallback } from 'react'
import { Clock, Search, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TopBar } from '@/components/shared/TopBar'
import { toast } from '@/components/ui/toaster'
import { formatDate, formatTime, getInitials, getStatusColor } from '@/lib/utils'

interface AttendanceRecord {
  id: string
  date: string
  checkIn: string | null
  checkOut: string | null
  status: string
  workedHours: number | null
  employee: {
    employeeId: string
    profile: { firstName: string; lastName: string; department: string | null } | null
  }
}

const DEPARTMENTS = ['Engineering', 'Human Resources', 'Finance', 'Marketing', 'Sales', 'Operations']
const STATUSES = ['PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE', 'HOLIDAY']

export default function AdminAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0])
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  const loadAttendance = useCallback(async () => {
    const params = new URLSearchParams({ all: 'true', date: dateFilter, limit: '100' })
    if (statusFilter) params.set('status', statusFilter)

    try {
      const res = await fetch(`/api/attendance?${params}`)
      const data = await res.json()
      setRecords(data.records ?? [])
    } catch {
      toast({ title: 'Error', description: 'Failed to load attendance', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }, [dateFilter, statusFilter])

  useEffect(() => { loadAttendance() }, [loadAttendance])

  const filtered = records.filter(r => {
    if (!search) return true
    const name = r.employee.profile ? `${r.employee.profile.firstName} ${r.employee.profile.lastName}` : ''
    return name.toLowerCase().includes(search.toLowerCase()) ||
      r.employee.employeeId.toLowerCase().includes(search.toLowerCase())
  })

  const presentCount = records.filter(r => r.status === 'PRESENT').length
  const absentCount = records.filter(r => r.status === 'ABSENT').length
  const leaveCount = records.filter(r => r.status === 'LEAVE').length

  return (
    <div className="space-y-6 page-enter">
      <TopBar userName="Admin" role="ADMIN" />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance Tracker</h1>
        <p className="text-gray-500 text-sm">Monitor real-time attendance across all employees</p>
      </div>

      {/* Date Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{presentCount}</p>
            <p className="text-xs text-gray-500 mt-1">Present</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{absentCount}</p>
            <p className="text-xs text-gray-500 mt-1">Absent</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">{leaveCount}</p>
            <p className="text-xs text-gray-500 mt-1">On Leave</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search employee..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <input
          type="date"
          value={dateFilter}
          onChange={e => { setDateFilter(e.target.value); setIsLoading(true) }}
          className="h-10 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setIsLoading(true) }}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>)}
          </SelectContent>
        </Select>
        {statusFilter && (
          <Button variant="ghost" size="sm" onClick={() => setStatusFilter('')}>Clear</Button>
        )}
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14 rounded-lg" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No attendance records for this date</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-medium text-gray-500 py-3 px-6">Employee</th>
                    <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Check In</th>
                    <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Check Out</th>
                    <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Hours</th>
                    <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(record => {
                    const fullName = record.employee.profile
                      ? `${record.employee.profile.firstName} ${record.employee.profile.lastName}`
                      : record.employee.employeeId
                    const initials = record.employee.profile
                      ? getInitials(record.employee.profile.firstName, record.employee.profile.lastName) : '?'
                    return (
                      <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-600 text-xs font-bold">{initials}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{fullName}</p>
                              <p className="text-xs text-gray-500">{record.employee.profile?.department ?? ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">{formatTime(record.checkIn)}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{formatTime(record.checkOut)}</td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">
                          {record.workedHours ? `${record.workedHours.toFixed(1)}h` : '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`badge ${getStatusColor(record.status)}`}>
                            {record.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
