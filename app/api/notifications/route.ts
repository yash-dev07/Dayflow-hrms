import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = getTokenFromRequest(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const notifications = await prisma.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const unreadCount = notifications.filter(n => !n.read).length

    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    console.error('Notifications GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
