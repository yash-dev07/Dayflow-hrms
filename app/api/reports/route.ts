import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = getTokenFromRequest(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!['ADMIN', 'HR'].includes(session.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const startDateStr = searchParams.get('startDate')
    const endDateStr = searchParams.get('endDate')

    const startDate = startDateStr ? new Date(startDateStr) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const endDate = endDateStr ? new Date(endDateStr) : new Date()

    const [
      attendanceStats,
      leaveStats,
      payrollStats,
      monthlyPayrollTrend,
    ] = await Promise.all([
      // Attendance analytics
      prisma.attendance.groupBy({
        by: ['status'],
        where: { date: { gte: startDate, lte: endDate } },
        _count: { status: true }
      }),
      // Leave analytics
      prisma.leaveRequest.groupBy({
        by: ['status'],
        where: { createdAt: { gte: startDate, lte: endDate } },
        _count: { status: true }
      }),
      // Payroll analytics
      prisma.salaryStructure.aggregate({
        _sum: { netSalary: true, grossSalary: true },
        _avg: { netSalary: true },
        _count: { id: true }
      }),
      // Monthly payroll trend (last 6 months)
      prisma.payrollRecord.groupBy({
        by: ['month', 'year'],
        _sum: { netSalary: true },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        take: 6
      }),
    ])

    // Leave by type
    const leaveByType = await prisma.leaveRequest.groupBy({
      by: ['leaveTypeId'],
      where: { createdAt: { gte: startDate, lte: endDate }, status: 'APPROVED' },
      _count: { leaveTypeId: true },
      _sum: { numberOfDays: true }
    })

    const leaveTypes = await prisma.leaveType.findMany()

    return NextResponse.json({
      attendanceStats,
      leaveStats,
      payrollStats,
      monthlyPayrollTrend: monthlyPayrollTrend.reverse(),
      leaveByType: leaveByType.map(lb => ({
        ...lb,
        leaveType: leaveTypes.find(lt => lt.id === lb.leaveTypeId)
      }))
    })
  } catch (error) {
    console.error('Reports error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
