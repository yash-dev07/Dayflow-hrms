import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PayrollCalculationService } from '@/lib/services/payroll.service'

export async function POST(request: NextRequest) {
  try {
    const session = getTokenFromRequest(request)
    if (!session || !['ADMIN', 'HR'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { month, year } = await request.json()
    if (!month || !year) {
      return NextResponse.json({ error: 'Month and year are required' }, { status: 400 })
    }

    // Check if period already exists
    const existing = await prisma.payrollPeriod.findFirst({
      where: { month, year }
    })
    
    if (existing) {
      return NextResponse.json({ error: 'Payroll period already exists for this month' }, { status: 409 })
    }

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)

    // Create Draft Period
    const period = await prisma.payrollPeriod.create({
      data: {
        month,
        year,
        startDate,
        endDate,
        status: 'DRAFT',
      }
    })

    // Get all active employees
    const employees = await prisma.user.findMany({
      where: { role: 'EMPLOYEE', isActive: true },
      select: { id: true }
    })

    let generatedCount = 0
    let skippedCount = 0

    // Generate records
    for (const emp of employees) {
      try {
        const calc = await PayrollCalculationService.calculatePayrollForEmployee(emp.id, startDate, endDate)
        
        await prisma.payrollRecord.create({
          data: {
            employeeId: emp.id,
            payrollPeriodId: period.id,
            status: 'DRAFT',
            ...calc
          }
        })
        generatedCount++
      } catch (err) {
        // Skip employees without salary structures or other errors
        console.error(`Skipping employee ${emp.id}:`, err)
        skippedCount++
      }
    }

    return NextResponse.json({ success: true, period, generatedCount, skippedCount })
  } catch (error) {
    console.error('Generate Payroll error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
