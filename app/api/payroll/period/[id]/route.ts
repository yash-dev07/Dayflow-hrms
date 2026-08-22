import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = getTokenFromRequest(request)
    if (!session || !['ADMIN', 'HR'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const period = await prisma.payrollPeriod.findUnique({
      where: { id },
      include: {
        records: {
          include: {
            employee: {
              select: {
                employeeId: true,
                email: true,
                profile: { select: { firstName: true, lastName: true, department: true } }
              }
            }
          }
        }
      }
    })

    if (!period) return NextResponse.json({ error: 'Period not found' }, { status: 404 })

    return NextResponse.json({ period })
  } catch (error) {
    console.error('Get Period error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
