import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken, COOKIE_OPTIONS } from '@/lib/auth'
import { loginSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = loginSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    })

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      )
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash)
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      )
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
    })

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        employeeId: user.employeeId,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    })

    response.cookies.set(COOKIE_OPTIONS.name, token, COOKIE_OPTIONS)
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
