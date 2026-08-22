import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = getTokenFromRequest(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Employees see only their own payroll
    const isAdmin = ['ADMIN', 'HR'].includes(session.role)
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')

    if (!isAdmin) {
      // Employee: own payroll only
      const [salary, payroll] = await Promise.all([
        prisma.salaryStructure.findUnique({ where: { employeeId: session.userId } }),
        prisma.payrollRecord.findMany({
          where: { employeeId: session.userId },
          orderBy: [{ year: 'desc' }, { month: 'desc' }],
          take: 12,
        })
      ])
      return NextResponse.json({ salary, payroll })
    }

    // Admin: can view any employee or all
    const targetId = employeeId ?? undefined
    const [salaries, payroll] = await Promise.all([
      prisma.salaryStructure.findMany({
        where: targetId ? { employeeId: targetId } : undefined,
        include: {
          employee: {
            select: {
              employeeId: true,
              email: true,
              profile: { select: { firstName: true, lastName: true, department: true } }
            }
          }
        },
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.payrollRecord.findMany({
        where: targetId ? { employeeId: targetId } : undefined,
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        include: {
          employee: {
            select: {
              employeeId: true,
              profile: { select: { firstName: true, lastName: true, department: true } }
            }
          }
        },
        take: 50,
      })
    ])

    return NextResponse.json({ salaries, payroll })
  } catch (error) {
    console.error('Payroll GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
