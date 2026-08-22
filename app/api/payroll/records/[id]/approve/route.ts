import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: recordId } = await params
    const session = getTokenFromRequest(request)
    if (!session || !['ADMIN', 'HR'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const record = await prisma.payrollRecord.update({
      where: { id: recordId },
      data: { 
        status: 'APPROVED',
        approvedById: session.userId,
        approvedAt: new Date()
      }
    })

    await prisma.payrollAuditLog.create({
      data: {
        action: 'RECORD_APPROVED',
        actorId: session.userId,
        payrollRecordId: recordId,
        comment: `Approved payroll record for employee ${record.employeeId}`
      }
    })

    return NextResponse.json({ success: true, record })
  } catch (error) {
    console.error('Approve Record error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
