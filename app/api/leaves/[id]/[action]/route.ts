import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { leaveReviewSchema } from '@/lib/validations'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  try {
    const session = getTokenFromRequest(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!['ADMIN', 'HR'].includes(session.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const userId = session.userId || (session as any).id
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 })
    }

    const { id, action } = await params
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const { hrComment } = leaveReviewSchema.parse({
      status: action === 'approve' ? 'APPROVED' : 'REJECTED',
      hrComment: body.hrComment
    })

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
      include: { leaveType: true }
    })

    if (!leaveRequest) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 })
    }
    if (leaveRequest.status !== 'PENDING') {
      return NextResponse.json({ error: 'This leave request has already been reviewed.' }, { status: 400 })
    }

    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED'
    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: newStatus,
        hrComment,
        reviewedBy: userId,
        reviewedAt: new Date(),
      }
    })

    // If approved, mark attendance dates as LEAVE
    if (newStatus === 'APPROVED') {
      const dates: Date[] = []
      const current = new Date(leaveRequest.startDate)
      const end = new Date(leaveRequest.endDate)
      while (current <= end) {
        dates.push(new Date(current))
        current.setDate(current.getDate() + 1)
      }

      for (const date of dates) {
        const d = new Date(date)
        d.setHours(0, 0, 0, 0)
        await prisma.attendance.upsert({
          where: { employeeId_date: { employeeId: leaveRequest.employeeId, date: d } },
          create: { employeeId: leaveRequest.employeeId, date: d, status: 'LEAVE' },
          update: { status: 'LEAVE' },
        })
      }
    }

    // Notify the employee
    await prisma.notification.create({
      data: {
        userId: leaveRequest.employeeId,
        title: newStatus === 'APPROVED' ? 'Leave Approved ✅' : 'Leave Rejected ❌',
        message: newStatus === 'APPROVED'
          ? `Your ${leaveRequest.leaveType.name} request has been approved.`
          : `Your ${leaveRequest.leaveType.name} request was rejected. ${hrComment ? `Reason: ${hrComment}` : ''}`,
        type: newStatus === 'APPROVED' ? 'SUCCESS' : 'WARNING',
      }
    })

    await prisma.activityLog.create({
      data: {
        actorId: userId,
        action: `LEAVE_${newStatus}`,
        targetId: leaveRequest.employeeId,
        targetType: 'LEAVE_REQUEST',
        details: `Leave request ${newStatus.toLowerCase()}. ${hrComment ?? ''}`,
      }
    })

    return NextResponse.json({ success: true, leaveRequest: updated })
  } catch (error) {
    console.error('Leave review error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
