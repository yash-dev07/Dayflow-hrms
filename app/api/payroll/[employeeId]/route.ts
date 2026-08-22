import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { salarySchema } from '@/lib/validations'
import { calculateSalary } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  try {
    const session = getTokenFromRequest(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { employeeId } = await params
    
    // Employees can only view their own salary
    if (!['ADMIN', 'HR'].includes(session.role) && session.userId !== employeeId) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const salary = await prisma.salaryStructure.findUnique({
      where: { employeeId },
      include: {
        employee: {
          select: {
            employeeId: true,
            email: true,
            profile: { select: { firstName: true, lastName: true, department: true } }
          }
        }
      }
    })

    return NextResponse.json({ salary })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  try {
    const session = getTokenFromRequest(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!['ADMIN', 'HR'].includes(session.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { employeeId } = await params
    const body = await request.json()
    const validation = salarySchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }

    const { grossSalary, netSalary } = calculateSalary(validation.data)

    const salary = await prisma.salaryStructure.upsert({
      where: { employeeId },
      create: {
        employeeId,
        ...validation.data,
        grossSalary,
        netSalary,
        effectiveFrom: new Date(),
      },
      update: {
        ...validation.data,
        grossSalary,
        netSalary,
        effectiveFrom: new Date(),
      }
    })

    // Create payroll record for current month
    const now = new Date()
    await prisma.payrollRecord.upsert({
      where: { employeeId_month_year: { employeeId, month: now.getMonth() + 1, year: now.getFullYear() } },
      create: {
        employeeId,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        basicSalary: validation.data.basicSalary,
        grossSalary,
        deductions: validation.data.deductions,
        netSalary,
        paymentStatus: 'PENDING',
      },
      update: {
        basicSalary: validation.data.basicSalary,
        grossSalary,
        deductions: validation.data.deductions,
        netSalary,
      }
    })

    // Notify the employee
    await prisma.notification.create({
      data: {
        userId: employeeId,
        title: 'Salary Updated',
        message: `Your salary structure has been updated. New net salary: ₹${netSalary.toLocaleString()}.`,
        type: 'INFO',
      }
    })

    await prisma.activityLog.create({
      data: {
        actorId: session.userId,
        action: 'SALARY_UPDATED',
        targetId: employeeId,
        targetType: 'USER',
        details: `Salary updated. Gross: ₹${grossSalary}, Net: ₹${netSalary}`,
      }
    })

    return NextResponse.json({ success: true, salary })
  } catch (error) {
    console.error('Salary PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
