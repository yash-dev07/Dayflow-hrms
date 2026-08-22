import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Employee dashboard data
export async function GET(request: NextRequest) {
  try {
    const session = getTokenFromRequest(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    // Leave balance calculation - get approved leaves for this year
    const yearStart = new Date(currentYear, 0, 1)
    const yearEnd = new Date(currentYear, 11, 31)

    const [
      todayAttendance,
      leaveTypes,
      approvedLeaves,
      pendingLeaves,
      salary,
      recentNotifications,
    ] = await Promise.all([
      prisma.attendance.findUnique({
        where: { employeeId_date: { employeeId: session.userId, date: today } }
      }),
      prisma.leaveType.findMany(),
      prisma.leaveRequest.findMany({
        where: {
          employeeId: session.userId,
          status: 'APPROVED',
          startDate: { gte: yearStart },
          endDate: { lte: yearEnd },
        },
        include: { leaveType: true }
      }),
      prisma.leaveRequest.count({
        where: { employeeId: session.userId, status: 'PENDING' }
      }),
      prisma.salaryStructure.findUnique({ where: { employeeId: session.userId } }),
      prisma.notification.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ])

    // Calculate leave balance per type
    const leaveBalance = leaveTypes.map(lt => {
      const used = approvedLeaves
        .filter(al => al.leaveTypeId === lt.id)
        .reduce((sum, al) => sum + al.numberOfDays, 0)
      return {
        ...lt,
        used,
        remaining: Math.max(0, lt.annualAllowance - used),
      }
    })

    // Calculate this month worked hours
    const monthStart = new Date(currentYear, now.getMonth(), 1)
    const monthAttendance = await prisma.attendance.findMany({
      where: {
        employeeId: session.userId,
        date: { gte: monthStart },
        status: 'PRESENT',
      }
    })
    const totalWorkedHours = monthAttendance.reduce((sum, a) => sum + (a.workedHours ?? 0), 0)

    return NextResponse.json({
      todayAttendance,
      leaveBalance,
      pendingLeaves,
      salary,
      totalWorkedHours: parseFloat(totalWorkedHours.toFixed(1)),
      recentNotifications,
    })
  } catch (error) {
    console.error('Employee dashboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
