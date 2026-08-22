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

    const all = searchParams.get('all') === 'true'
    const isAdmin = ['ADMIN', 'HR'].includes(session.role)

    // Employees can only see their own attendance
    // Admin/HR can see specific employee, or all if all=true
    let where: Record<string, unknown> = {}
    
    if (!isAdmin) {
      where.employeeId = session.userId
    } else if (employeeId) {
      where.employeeId = employeeId
    } else if (!all) {
      where.employeeId = session.userId
    }

    if (startDate || endDate) {
      where.date = {}
      if (startDate) (where.date as Record<string, Date>).gte = new Date(startDate)
      if (endDate) (where.date as Record<string, Date>).lte = new Date(endDate)
    }

    // Support single date filtering (from admin page)
    const exactDate = searchParams.get('date')
    if (exactDate) {
      where.date = new Date(exactDate)
    }

    // Support status filter
    const status = searchParams.get('status')
    if (status) {
      where.status = status
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
