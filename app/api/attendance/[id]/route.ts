import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { attendanceCorrectionSchema } from '@/lib/validations'
import { calculateWorkedHours } from '@/lib/utils'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getTokenFromRequest(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!['ADMIN', 'HR'].includes(session.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const validation = attendanceCorrectionSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }

    const data = validation.data
    let workedHours: number | undefined
    
    if (data.checkIn && data.checkOut) {
      workedHours = calculateWorkedHours(new Date(data.checkIn), new Date(data.checkOut)) ?? 0
    }

    const updated = await prisma.attendance.update({
      where: { id },
      data: {
        ...(data.checkIn && { checkIn: new Date(data.checkIn) }),
        ...(data.checkOut && { checkOut: new Date(data.checkOut) }),
        ...(data.status && { status: data.status }),
        ...(data.remarks && { remarks: data.remarks }),
        ...(workedHours !== undefined && { workedHours }),
      }
    })

    await prisma.activityLog.create({
      data: {
        actorId: session.userId,
        action: 'ATTENDANCE_CORRECTED',
        targetId: updated.employeeId,
        targetType: 'ATTENDANCE',
        details: `Attendance record corrected by HR/Admin`,
      }
    })

    return NextResponse.json({ success: true, attendance: updated })
  } catch (error) {
    console.error('Attendance PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
