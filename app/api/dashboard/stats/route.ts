import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Dashboard stats for admin
export async function GET(request: NextRequest) {
  try {
    const session = getTokenFromRequest(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!['ADMIN', 'HR'].includes(session.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    const [
      totalEmployees,
      presentToday,
      onLeaveToday,
      pendingLeaveRequests,
      totalPayroll,
      recentActivities,
      attendanceOverview,
      departmentDistribution,
    ] = await Promise.all([
      prisma.user.count({ where: { isActive: true, role: 'EMPLOYEE' } }),
      prisma.attendance.count({ where: { date: today, status: 'PRESENT' } }),
      prisma.attendance.count({ where: { date: today, status: 'LEAVE' } }),
      prisma.leaveRequest.count({ where: { status: 'PENDING' } }),
      prisma.payrollRecord.aggregate({
        where: { payrollPeriod: { month: currentMonth, year: currentYear }, status: 'PAID' },
        _sum: { netSalary: true }
      }),
      prisma.activityLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          actor: { select: { profile: { select: { firstName: true, lastName: true } }, employeeId: true } },
          target: { select: { profile: { select: { firstName: true, lastName: true } } } }
        }
      }),
      // Last 7 days attendance overview
      prisma.attendance.groupBy({
        by: ['status'],
        where: { date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        _count: { status: true }
      }),
      // Department distribution
      prisma.employeeProfile.groupBy({
        by: ['department'],
        where: { department: { not: null }, user: { isActive: true, role: 'EMPLOYEE' } },
        _count: { department: true }
      })
    ])

    return NextResponse.json({
      stats: {
        totalEmployees,
        presentToday,
        onLeaveToday,
        pendingLeaveRequests,
        payroll: totalPayroll._sum?.netSalary ?? 0,
        absentToday: totalEmployees - presentToday - onLeaveToday,
      },
      recentActivities,
      attendanceOverview,
      departmentDistribution,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
