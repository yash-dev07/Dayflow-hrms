import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { addEmployeeSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const session = getTokenFromRequest(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!['ADMIN', 'HR'].includes(session.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') ?? ''
    const department = searchParams.get('department') ?? ''
    const role = searchParams.get('role') ?? ''
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '20')

    const where: Record<string, unknown> = { isActive: true }
    if (role) where.role = role
    if (search || department) {
      where.OR = search
        ? [
            { email: { contains: search, mode: 'insensitive' } },
            { employeeId: { contains: search, mode: 'insensitive' } },
            { profile: { firstName: { contains: search, mode: 'insensitive' } } },
            { profile: { lastName: { contains: search, mode: 'insensitive' } } },
            { profile: { department: { contains: search, mode: 'insensitive' } } },
          ]
        : undefined
      if (department) where.profile = { department: { contains: department, mode: 'insensitive' } }
    }

    const [employees, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          employeeId: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          profile: true,
          salaryStructures: { select: { netSalary: true }, take: 1, orderBy: { effectiveFrom: 'desc' } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where })
    ])

    return NextResponse.json({ employees, total, page, limit })
  } catch (error) {
    console.error('Employees GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = getTokenFromRequest(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!['ADMIN', 'HR'].includes(session.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const validation = addEmployeeSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }

    const { employeeId, email, password, firstName, lastName, role, department, designation, joiningDate, employmentType, phone } = validation.data

    const [existingEmail, existingId] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      prisma.user.findUnique({ where: { employeeId } })
    ])

    if (existingEmail) return NextResponse.json({ error: 'Email already registered.' }, { status: 409 })
    if (existingId) return NextResponse.json({ error: 'Employee ID already exists.' }, { status: 409 })

    const passwordHash = await bcrypt.hash(password, 12)
    const employee = await prisma.user.create({
      data: {
        employeeId,
        email,
        passwordHash,
        role: role ?? 'EMPLOYEE',
        emailVerified: true,
        profile: {
          create: {
            firstName,
            lastName,
            phone,
            department,
            designation,
            joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
            employmentType,
          }
        },
        salaryStructures: {
          create: {
            basicSalary: 0,
            hra: 0,
            allowances: 0,
            deductions: 0,
            bonuses: 0,
            grossSalary: 0,
            netSalary: 0,
          }
        }
      },
      include: { profile: true }
    })

    await prisma.activityLog.create({
      data: {
        actorId: session.userId,
        action: 'EMPLOYEE_CREATED',
        targetId: employee.id,
        targetType: 'USER',
        details: `Created employee ${firstName} ${lastName} (${employeeId})`,
      }
    })

    return NextResponse.json({
      success: true,
      employee: { id: employee.id, employeeId: employee.employeeId, email: employee.email, role: employee.role, profile: employee.profile }
    }, { status: 201 })
  } catch (error) {
    console.error('Employee POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
