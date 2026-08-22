'use client'

import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, XCircle, Clock, Filter, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TopBar } from '@/components/shared/TopBar'
import { toast } from '@/components/ui/toaster'
import { formatDate, getInitials } from '@/lib/utils'

interface LeaveRequest {
  id: string
  startDate: string
  endDate: string
  numberOfDays: number
  status: string
  reason: string
  createdAt: string
  leaveType: { name: string; color: string }
  employee: {
    employeeId: string
    profile: { firstName: string; lastName: string; department: string | null } | null
  }
}

export default function AdminLeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [reviewAction, setReviewAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED')
  const [hrComment, setHrComment] = useState('')
  const [isReviewing, setIsReviewing] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null)

  const loadLeaves = useCallback(async () => {
    const params = new URLSearchParams({ status: statusFilter, limit: '50', all: 'true' })
    try {
      const res = await fetch(`/api/leaves?${params}`)
      const data = await res.json()
      setLeaves(data.requests ?? [])
    } catch {
      toast({ title: 'Error', description: 'Failed to load leave requests', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { loadLeaves() }, [loadLeaves])

  const handleReview = async () => {
    if (!reviewingId) return
    setIsReviewing(true)
    try {
      const actionPath = reviewAction.toLowerCase()
      const res = await fetch(`/api/leaves/${reviewingId}/${actionPath}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hrComment }),
      })
      const data = await res.json()
      if (!res.ok) { toast({ title: 'Error', description: data.error, variant: 'destructive' }); return }
      toast({
        title: reviewAction === 'APPROVED' ? 'Leave Approved ✅' : 'Leave Rejected ❌',
        description: `Leave request has been ${reviewAction.toLowerCase()}.`,
        variant: reviewAction === 'APPROVED' ? 'success' : 'destructive'
      })
      setReviewingId(null)
      setHrComment('')
      setSelectedLeave(null)
      await loadLeaves()
    } finally { setIsReviewing(false) }
  }

  const openReview = (leave: LeaveRequest, action: 'APPROVED' | 'REJECTED') => {
    setSelectedLeave(leave)
    setReviewingId(leave.id)
    setReviewAction(action)
    setHrComment('')
  }

  const pendingCount = leaves.filter(l => l.status === 'PENDING').length

  return (
    <div className="space-y-6 page-enter">
      <TopBar userName="Admin" role="ADMIN" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Requests</h1>
          <p className="text-gray-500 text-sm">Review and manage employee leave requests</p>
        </div>
        {pendingCount > 0 && statusFilter === 'PENDING' && (
          <Badge variant="warning" className="text-sm px-3 py-1">
            {pendingCount} pending
          </Badge>
        )}
      </div>

      {/* Status Filter */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { value: 'PENDING', label: 'Pending' },
          { value: 'APPROVED', label: 'Approved' },
          { value: 'REJECTED', label: 'Rejected' },
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => { setStatusFilter(tab.value); setIsLoading(true) }}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              statusFilter === tab.value ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-lg" />)}
            </div>
          ) : leaves.length === 0 ? (
            <div className="py-16 text-center">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No {statusFilter.toLowerCase()} leave requests</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-medium text-gray-500 py-3 px-6">Employee</th>
                    <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Leave Type</th>
                    <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Duration</th>
                    <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Reason</th>
                    <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Applied</th>
                    <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Status</th>
                    {statusFilter === 'PENDING' && (
                      <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {leaves.map(leave => {
                    const fullName = leave.employee.profile
                      ? `${leave.employee.profile.firstName} ${leave.employee.profile.lastName}`
                      : leave.employee.employeeId
                    const initials = leave.employee.profile
                      ? getInitials(leave.employee.profile.firstName, leave.employee.profile.lastName) : '?'

                    return (
                      <tr key={leave.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-600 text-xs font-bold">{initials}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{fullName}</p>
                              <p className="text-xs text-gray-500">{leave.employee.profile?.department ?? ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: leave.leaveType.color }} />
                            <span className="text-sm text-gray-700">{leave.leaveType.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-gray-900">{leave.numberOfDays}d</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(leave.startDate, 'MMM dd')} – {formatDate(leave.endDate, 'MMM dd')}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-gray-700 max-w-[180px] truncate" title={leave.reason}>
                            {leave.reason}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {formatDate(leave.createdAt, 'MMM dd')}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={
                            leave.status === 'APPROVED' ? 'success' :
                            leave.status === 'REJECTED' ? 'destructive' : 'warning'
                          }>
                            {leave.status}
                          </Badge>
                        </td>
                        {statusFilter === 'PENDING' && (
                          <td className="py-3 px-4">
                            <div className="flex gap-1">
                              <Button
                                variant="success"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => openReview(leave, 'APPROVED')}
                              >
                                <CheckCircle className="w-3 h-3" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => openReview(leave, 'REJECTED')}
                              >
                                <XCircle className="w-3 h-3" />
                                Reject
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      <Dialog open={!!reviewingId} onOpenChange={() => setReviewingId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'APPROVED' ? '✅ Approve Leave Request' : '❌ Reject Leave Request'}
            </DialogTitle>
          </DialogHeader>
          {selectedLeave && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <p className="text-sm font-medium text-gray-900">
                  {selectedLeave.employee.profile
                    ? `${selectedLeave.employee.profile.firstName} ${selectedLeave.employee.profile.lastName}`
                    : selectedLeave.employee.employeeId}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedLeave.leaveType.name} · {selectedLeave.numberOfDays} day(s)
                </p>
                <p className="text-sm text-gray-500">
                  {formatDate(selectedLeave.startDate)} to {formatDate(selectedLeave.endDate)}
                </p>
                <p className="text-xs text-gray-500 mt-2">{selectedLeave.reason}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  HR Comment {reviewAction === 'REJECTED' ? '*' : '(Optional)'}
                </label>
                <Textarea
                  placeholder={reviewAction === 'REJECTED'
                    ? 'Please provide a reason for rejection...'
                    : 'Optional comment for the employee...'
                  }
                  value={hrComment}
                  onChange={e => setHrComment(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReviewingId(null)}>Cancel</Button>
            <Button
              variant={reviewAction === 'APPROVED' ? 'success' : 'destructive'}
              onClick={handleReview}
              loading={isReviewing}
              disabled={reviewAction === 'REJECTED' && !hrComment}
            >
              {reviewAction === 'APPROVED' ? 'Approve Leave' : 'Reject Leave'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
