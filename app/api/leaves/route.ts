import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { leaveRequestSchema } from '@/lib/validations'
import { calculateLeaveDays } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const session = getTokenFromRequest(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const employeeId = searchParams.get('employeeId')
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '20')

    const isAdmin = ['ADMIN', 'HR'].includes(session.role)
    const where: Record<string, unknown> = {}

    if (!isAdmin) {
      where.employeeId = session.userId
    } else if (employeeId) {
      where.employeeId = employeeId
    }

    if (status) where.status = status

    const [requests, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          leaveType: true,
          employee: {
            select: {
              employeeId: true,
              email: true,
              profile: { select: { firstName: true, lastName: true, department: true, profilePicture: true } }
            }
          },
          reviewer: {
            select: {
              profile: { select: { firstName: true, lastName: true } }
            }
          }
        }
      }),
      prisma.leaveRequest.count({ where })
    ])

    return NextResponse.json({ requests, total, page, limit })
  } catch (error) {
    console.error('Leave GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = getTokenFromRequest(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const validation = leaveRequestSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }

    const { leaveTypeId, startDate, endDate, reason, employeeComment } = validation.data
    const numberOfDays = calculateLeaveDays(startDate, endDate)

    if (numberOfDays <= 0) {
      return NextResponse.json({ error: 'Invalid date range.' }, { status: 400 })
    }

    // Check for overlapping approved/pending leaves
    const overlapping = await prisma.leaveRequest.findFirst({
      where: {
        employeeId: session.userId,
        status: { in: ['PENDING', 'APPROVED'] },
        OR: [
          { startDate: { lte: new Date(endDate) }, endDate: { gte: new Date(startDate) } }
        ]
      }
    })

    if (overlapping) {
      return NextResponse.json({
        error: 'Your leave request overlaps with an existing approved or pending leave.'
      }, { status: 400 })
    }

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId: session.userId,
        leaveTypeId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        numberOfDays,
        reason,
        employeeComment,
        status: 'PENDING',
      },
      include: { leaveType: true }
    })

    // Notify all HR/Admin users
    const hrUsers = await prisma.user.findMany({
      where: { role: { in: ['HR', 'ADMIN'] }, isActive: true }
    })

    await prisma.notification.createMany({
      data: hrUsers.map(hr => ({
        userId: hr.id,
        title: 'New Leave Request',
        message: `A leave request has been submitted and needs your review.`,
        type: 'INFO' as const,
      }))
    })

    await prisma.activityLog.create({
      data: {
        actorId: session.userId,
        action: 'LEAVE_SUBMITTED',
        targetId: leaveRequest.id,
        targetType: 'LEAVE_REQUEST',
        details: `Applied for ${numberOfDays} day(s) of ${leaveRequest.leaveType.name}`,
      }
    })

    return NextResponse.json({ success: true, leaveRequest }, { status: 201 })
  } catch (error) {
    console.error('Leave POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
