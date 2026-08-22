import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = getTokenFromRequest(request)
    if (!session || !['ADMIN', 'HR'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const periods = await prisma.payrollPeriod.findMany({
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: {
        _count: { select: { records: true } },
        records: {
          select: { netSalary: true }
        }
      }
    })

    const formatted = periods.map(p => ({
      ...p,
      totalPayroll: p.records.reduce((sum, r) => sum + r.netSalary, 0),
      records: undefined
    }))

    return NextResponse.json({ periods: formatted })
  } catch (error) {
    console.error('Get Periods error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
