import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateEmployeeSchema } from '@/lib/validations'

export async function GET(
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
    const employee = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        employeeId: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        profile: true,
        salaryStructures: { take: 1, orderBy: { effectiveFrom: 'desc' } },
        documents: true,
        attendance: { orderBy: { date: 'desc' }, take: 30 },
        leaveRequests: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { leaveType: true }
        },
        payrollRecords: { orderBy: { createdAt: 'desc' }, take: 6 },
      }
    })

    if (!employee) return NextResponse.json({ error: 'Employee not found' }, { status: 404 })

    return NextResponse.json({ employee })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
    const validation = updateEmployeeSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }

    const { joiningDate, dateOfBirth, ...rest } = validation.data
    const updated = await prisma.employeeProfile.update({
      where: { userId: id },
      data: {
        ...rest,
        ...(joiningDate && { joiningDate: new Date(joiningDate) }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
      }
    })

    // Also update role if provided
    if (body.role) {
      await prisma.user.update({
        where: { id },
        data: { role: body.role }
      })
    }

    await prisma.activityLog.create({
      data: {
        actorId: session.userId,
        action: 'EMPLOYEE_UPDATED',
        targetId: id,
        targetType: 'USER',
        details: 'Employee profile updated by HR/Admin',
      }
    })

    return NextResponse.json({ success: true, profile: updated })
  } catch (error) {
    console.error('Employee PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getTokenFromRequest(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!['ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Only admins can deactivate employees' }, { status: 403 })
    }

    const { id } = await params
    if (id === session.userId) {
      return NextResponse.json({ error: 'You cannot deactivate yourself.' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: false }
    })

    await prisma.activityLog.create({
      data: {
        actorId: session.userId,
        action: 'EMPLOYEE_DEACTIVATED',
        targetId: id,
        targetType: 'USER',
        details: 'Employee deactivated by Admin',
      }
    })

    return NextResponse.json({ success: true, message: 'Employee deactivated.' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
