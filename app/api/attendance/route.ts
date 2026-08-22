import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = getTokenFromRequest(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '30')

    // Employees can only see their own attendance
    const targetEmployeeId = ['ADMIN', 'HR'].includes(session.role) && employeeId
      ? employeeId
      : session.userId

    const where: Record<string, unknown> = { employeeId: targetEmployeeId }
    if (startDate || endDate) {
      where.date = {}
      if (startDate) (where.date as Record<string, Date>).gte = new Date(startDate)
      if (endDate) (where.date as Record<string, Date>).lte = new Date(endDate)
    }

    const [records, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          employee: {
            select: {
              employeeId: true,
              email: true,
              profile: { select: { firstName: true, lastName: true, department: true } }
            }
          }
        }
      }),
      prisma.attendance.count({ where })
    ])

    return NextResponse.json({ records, total, page, limit })
  } catch (error) {
    console.error('Attendance GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
