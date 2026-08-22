'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { TopBar } from '@/components/shared/TopBar'
import { toast } from '@/components/ui/toaster'
import { formatDate, formatTime, getStatusColor, calculateLeaveDays } from '@/lib/utils'

interface Attendance {
  id: string
  date: string
  checkIn: string | null
  checkOut: string | null
  status: string
  workedHours: number | null
}

interface LeaveRequest {
  id: string
  startDate: string
  endDate: string
  numberOfDays: number
  status: string
  leaveType: { name: string; color: string }
}

interface LeaveType {
  id: string
  name: string
  annualAllowance: number
  color: string
}

export default function EmployeeLeavePage() {
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'leaves' | 'attendance'>('leaves')

  // Leave form
  const [leaveForm, setLeaveForm] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [attRes, leavesRes, typesRes] = await Promise.all([
        fetch('/api/attendance?limit=30'),
        fetch('/api/leaves?limit=20'),
        fetch('/api/leave-types'),
      ])
      const [attData, leavesData, typesData] = await Promise.all([
        attRes.json(), leavesRes.json(), typesRes.json()
      ])
      setAttendance(attData.records ?? [])
      setLeaves(leavesData.requests ?? [])
      setLeaveTypes(typesData.leaveTypes ?? [])
    } catch {
      toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleApplyLeave = async () => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leaveForm),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
        return
      }
      toast({ title: 'Leave Submitted ✅', description: 'Your leave request is pending HR approval.', variant: 'success' })
      setShowApplyModal(false)
      setLeaveForm({ leaveTypeId: '', startDate: '', endDate: '', reason: '' })
      await loadData()
    } catch {
      toast({ title: 'Error', description: 'Failed to submit leave', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const numDays = leaveForm.startDate && leaveForm.endDate
    ? calculateLeaveDays(leaveForm.startDate, leaveForm.endDate)
    : 0

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'destructive' | 'secondary' | 'blue'> = {
      APPROVED: 'success',
      PENDING: 'warning',
      REJECTED: 'destructive',
      CANCELLED: 'secondary',
      LEAVE: 'blue',
    }
    return <Badge variant={variants[status] ?? 'secondary'}>{status}</Badge>
  }

  return (
    <div className="space-y-6 page-enter">
      <TopBar userName="Employee" role="EMPLOYEE" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-500 text-sm">Manage your leave requests and view attendance</p>
        </div>
        <Button onClick={() => setShowApplyModal(true)}>
          <Plus className="w-4 h-4" />
          Apply for Leave
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(['leaves', 'attendance'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'leaves' ? 'Leave Requests' : 'Attendance History'}
          </button>
        ))}
      </div>

      {activeTab === 'leaves' ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12 rounded-lg" />)}
              </div>
            ) : leaves.length === 0 ? (
              <div className="py-16 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No leave requests yet</p>
                <p className="text-gray-400 text-sm">Apply for a leave to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-medium text-gray-500 py-3 px-6">Leave Type</th>
                      <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Start Date</th>
                      <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">End Date</th>
                      <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Days</th>
                      <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map(leave => (
                      <tr key={leave.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: leave.leaveType.color }} />
                            <span className="text-sm font-medium text-gray-900">{leave.leaveType.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">{formatDate(leave.startDate)}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{formatDate(leave.endDate)}</td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{leave.numberOfDays}d</td>
                        <td className="py-3 px-4">{getStatusBadge(leave.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12 rounded-lg" />)}
              </div>
            ) : attendance.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-gray-500">No attendance records found</p>
              </div>
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
                    {attendance.map(record => (
                      <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-6 text-sm font-medium text-gray-900">{formatDate(record.date, 'EEE, MMM dd')}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{formatTime(record.checkIn)}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{formatTime(record.checkOut)}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{record.workedHours ? `${record.workedHours.toFixed(1)}h` : '—'}</td>
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
      )}

      {/* Apply Leave Modal */}
      <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Apply for Leave</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Leave Type</Label>
              <Select value={leaveForm.leaveTypeId} onValueChange={v => setLeaveForm(prev => ({ ...prev, leaveTypeId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map(lt => (
                    <SelectItem key={lt.id} value={lt.id}>
                      {lt.name} ({lt.annualAllowance} days/year)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <input
                  id="startDate"
                  type="date"
                  value={leaveForm.startDate}
                  onChange={e => setLeaveForm(prev => ({ ...prev, startDate: e.target.value }))}
                  className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <input
                  id="endDate"
                  type="date"
                  value={leaveForm.endDate}
                  min={leaveForm.startDate}
                  onChange={e => setLeaveForm(prev => ({ ...prev, endDate: e.target.value }))}
                  className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {numDays > 0 && (
              <div className="p-3 bg-indigo-50 rounded-lg text-sm text-indigo-700 font-medium">
                📅 Duration: {numDays} working day{numDays > 1 ? 's' : ''}
              </div>
            )}

            <div>
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                placeholder="Please provide a reason for your leave request..."
                value={leaveForm.reason}
                onChange={e => setLeaveForm(prev => ({ ...prev, reason: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowApplyModal(false)}>Cancel</Button>
            <Button
              onClick={handleApplyLeave}
              loading={isSubmitting}
              disabled={!leaveForm.leaveTypeId || !leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason}
            >
              Submit Leave Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Need to import Calendar for empty state
import { Calendar } from 'lucide-react'
