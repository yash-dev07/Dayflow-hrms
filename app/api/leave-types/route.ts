import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Get all leave types
export async function GET(request: NextRequest) {
  try {
    const session = getTokenFromRequest(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const leaveTypes = await prisma.leaveType.findMany({
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ leaveTypes })
  } catch (error) {
    console.error('Leave types GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
