import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateProfileSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const session = getTokenFromRequest(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        profile: true,
        salaryStructure: true,
        documents: true,
      }
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    return NextResponse.json({
      id: user.id,
      employeeId: user.employeeId,
      email: user.email,
      role: user.role,
      profile: user.profile,
      salary: user.salaryStructure,
      documents: user.documents,
    })
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = getTokenFromRequest(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const validation = updateProfileSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }

    const updated = await prisma.employeeProfile.update({
      where: { userId: session.userId },
      data: validation.data,
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        actorId: session.userId,
        action: 'PROFILE_UPDATED',
        targetId: session.userId,
        targetType: 'USER',
        details: 'Updated personal profile information',
      }
    })

    // Create notification
    await prisma.notification.create({
      data: {
        userId: session.userId,
        title: 'Profile Updated',
        message: 'Your profile information has been updated successfully.',
        type: 'SUCCESS',
      }
    })

    return NextResponse.json({ success: true, profile: updated })
  } catch (error) {
    console.error('Profile PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
