import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateWorkedHours } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const session = getTokenFromRequest(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const existing = await prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId: session.userId, date: today } }
    })

    if (!existing || !existing.checkIn) {
      return NextResponse.json({ error: 'You must check in before checking out.' }, { status: 400 })
    }

    if (existing.checkOut) {
      return NextResponse.json({ error: 'You have already checked out today.' }, { status: 400 })
    }

    const now = new Date()
    const workedHours = calculateWorkedHours(existing.checkIn, now)

    const attendance = await prisma.attendance.update({
      where: { id: existing.id },
      data: {
        checkOut: now,
        workedHours: workedHours ?? 0,
        status: workedHours && workedHours < 4 ? 'HALF_DAY' : 'PRESENT',
      }
    })

    // Notification for completed attendance
    await prisma.notification.create({
      data: {
        userId: session.userId,
        title: 'Attendance Completed',
        message: `Great job! You worked ${workedHours?.toFixed(1)} hours today.`,
        type: 'SUCCESS',
      }
    })

    await prisma.activityLog.create({
      data: {
        actorId: session.userId,
        action: 'CHECKED_OUT',
        targetId: session.userId,
        targetType: 'ATTENDANCE',
        details: `Checked out at ${now.toISOString()}. Worked ${workedHours?.toFixed(2)} hours.`,
      }
    })

    return NextResponse.json({ success: true, attendance })
  } catch (error) {
    console.error('Check-out error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
