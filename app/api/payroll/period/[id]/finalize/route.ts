import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getTokenFromRequest(request)
    if (!session || !['ADMIN', 'HR'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: periodId } = await params
    const period = await prisma.payrollPeriod.findUnique({ where: { id: periodId } })

    if (!period) return NextResponse.json({ error: 'Period not found' }, { status: 404 })
    if (period.status !== 'DRAFT') return NextResponse.json({ error: 'Can only finalize DRAFT periods' }, { status: 400 })

    await prisma.$transaction([
      prisma.payrollPeriod.update({
        where: { id: periodId },
        data: { status: 'FINALIZED' }
      }),
      prisma.payrollRecord.updateMany({
        where: { payrollPeriodId: periodId, status: 'DRAFT' },
        data: { status: 'GENERATED' }
      })
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Finalize Payroll error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
