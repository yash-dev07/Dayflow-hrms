import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = registerSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { employeeId, fullName, email, password } = validation.data

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      )
    }

    // Check if employeeId already exists
    const existingEmployeeId = await prisma.user.findUnique({ where: { employeeId } })
    if (existingEmployeeId) {
      return NextResponse.json(
        { error: 'This Employee ID is already registered.' },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const nameParts = fullName.trim().split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(' ') || ''

    const user = await prisma.user.create({
      data: {
        employeeId,
        email,
        passwordHash,
        role: 'EMPLOYEE', // Public registration always creates EMPLOYEE
        emailVerified: true,
        profile: {
          create: {
            firstName,
            lastName,
          }
        }
      },
      include: { profile: true }
    })

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please login.',
      user: {
        id: user.id,
        employeeId: user.employeeId,
        email: user.email,
        role: user.role,
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
