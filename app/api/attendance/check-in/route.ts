import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Check-in API
export async function POST(request: NextRequest) {
  try {
    const session = getTokenFromRequest(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if already checked in today
    const existing = await prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId: session.userId, date: today } }
    })

    if (existing) {
      if (existing.checkIn) {
        return NextResponse.json({ error: 'You have already checked in today.' }, { status: 400 })
      }
    }

    const now = new Date()
    const attendance = existing
      ? await prisma.attendance.update({
          where: { id: existing.id },
          data: { checkIn: now, status: 'PRESENT' }
        })
      : await prisma.attendance.create({
          data: {
            employeeId: session.userId,
            date: today,
            checkIn: now,
            status: 'PRESENT',
          }
        })

    // Log activity
    await prisma.activityLog.create({
      data: {
        actorId: session.userId,
        action: 'CHECKED_IN',
        targetId: session.userId,
        targetType: 'ATTENDANCE',
        details: `Checked in at ${now.toISOString()}`,
      }
    })

    return NextResponse.json({ success: true, attendance })
  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
