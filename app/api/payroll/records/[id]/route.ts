import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = getTokenFromRequest(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const record = await prisma.payrollRecord.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            employeeId: true,
            email: true,
            profile: true
          }
        },
        payrollPeriod: true
      }
    })

    if (!record) return NextResponse.json({ error: 'Record not found' }, { status: 404 })

    // If employee, they can only view their own record
    if (session.role === 'EMPLOYEE' && record.employeeId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ record })
  } catch (error) {
    console.error('Get Record error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
