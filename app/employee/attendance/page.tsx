'use client'

import { useState, useEffect } from 'react'
import { Clock, CheckCircle, XCircle, LogIn, LogOut } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TopBar } from '@/components/shared/TopBar'
import { toast } from '@/components/ui/toaster'
import { formatDate, formatTime, getStatusColor } from '@/lib/utils'

interface AttendanceRecord {
  id: string
  date: string
  checkIn: string | null
  checkOut: string | null
  status: string
  workedHours: number | null
}

export default function EmployeeAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const loadData = async () => {
    try {
      const [attRes, dashRes] = await Promise.all([
        fetch('/api/attendance?limit=30'),
        fetch('/api/dashboard/employee'),
      ])
      const [attData, dashData] = await Promise.all([attRes.json(), dashRes.json()])
      setRecords(attData.records ?? [])
      setTodayRecord(dashData.todayAttendance ?? null)
    } catch {
      toast({ title: 'Error', description: 'Failed to load attendance', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleCheckIn = async () => {
    setIsCheckingIn(true)
    try {
      const res = await fetch('/api/attendance/check-in', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { toast({ title: 'Error', description: data.error, variant: 'destructive' }); return }
      toast({ title: 'Checked In ✅', description: `Checked in at ${formatTime(data.attendance.checkIn)}`, variant: 'success' })
      await loadData()
    } finally { setIsCheckingIn(false) }
  }

  const handleCheckOut = async () => {
    setIsCheckingOut(true)
    try {
      const res = await fetch('/api/attendance/check-out', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { toast({ title: 'Error', description: data.error, variant: 'destructive' }); return }
      toast({ title: 'Checked Out 👋', description: `Worked ${data.attendance.workedHours?.toFixed(1)}h today`, variant: 'success' })
      await loadData()
    } finally { setIsCheckingOut(false) }
  }

  const hasCheckedIn = !!todayRecord?.checkIn
  const hasCheckedOut = !!todayRecord?.checkOut

  // Weekly summary
  const presentDays = records.filter(r => r.status === 'PRESENT').length
  const absentDays = records.filter(r => r.status === 'ABSENT').length
  const totalHours = records.reduce((sum, r) => sum + (r.workedHours ?? 0), 0)

  return (
    <div className="space-y-6 page-enter">
      <TopBar userName="Employee" role="EMPLOYEE" />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-500 text-sm">Track your daily attendance and work hours</p>
      </div>

      {/* Today's attendance card */}
      <Card className="border-0 shadow-sm bg-indigo-950 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-gray-400 text-sm">Today</p>
              <p className="text-xl font-bold mt-0.5">{formatDate(new Date())}</p>
            </div>
            {todayRecord && (
              <span className={`badge ${getStatusColor(todayRecord.status)}`}>
                {todayRecord.status.replace('_', ' ')}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-gray-400 text-xs">Check In</p>
              <p className="text-lg font-bold mt-1">{hasCheckedIn ? formatTime(todayRecord?.checkIn) : '—'}</p>
            </div>
            <div className="text-center border-x border-white/10">
              <p className="text-gray-400 text-xs">Check Out</p>
              <p className="text-lg font-bold mt-1">{hasCheckedOut ? formatTime(todayRecord?.checkOut) : '—'}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-xs">Hours Worked</p>
              <p className="text-lg font-bold mt-1">
                {todayRecord?.workedHours ? `${todayRecord.workedHours.toFixed(1)}h` : '—'}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleCheckIn}
              disabled={hasCheckedIn}
              loading={isCheckingIn}
              className="flex-1 bg-indigo-500 hover:bg-indigo-400 disabled:bg-white/10 disabled:text-white/40"
            >
              <LogIn className="w-4 h-4" />
              {hasCheckedIn ? 'Checked In' : 'Check In'}
            </Button>
            <Button
              onClick={handleCheckOut}
              disabled={!hasCheckedIn || hasCheckedOut}
              loading={isCheckingOut}
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/10 disabled:text-white/40"
            >
              <LogOut className="w-4 h-4" />
              {hasCheckedOut ? 'Checked Out' : 'Check Out'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{presentDays}</p>
            <p className="text-xs text-gray-500 mt-1">Days Present</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{absentDays}</p>
            <p className="text-xs text-gray-500 mt-1">Days Absent</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">{totalHours.toFixed(0)}h</p>
            <p className="text-xs text-gray-500 mt-1">Total Hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance History */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12 rounded-lg" />)}
            </div>
          ) : records.length === 0 ? (
            <div className="py-16 text-center text-gray-500">No attendance records found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-medium text-gray-500 py-3 px-6">Date</th>
                    <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Check In</th>
                    <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Check Out</th>
                    <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Hours</th>
                    <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(record => (
                    <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-6 text-sm font-medium text-gray-900">
                        {formatDate(record.date, 'EEE, MMM dd, yyyy')}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">{formatTime(record.checkIn)}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{formatTime(record.checkOut)}</td>
                      <td className="py-3 px-4 text-sm font-medium">
                        {record.workedHours ? `${record.workedHours.toFixed(1)}h` : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`badge ${getStatusColor(record.status)}`}>
                          {record.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
