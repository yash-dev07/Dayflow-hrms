import { prisma } from '@/lib/prisma'
import { AttendanceStatus, LeaveStatus } from '@prisma/client'

export class PayrollCalculationService {
  
  static async getPayrollPolicy() {
    let policy = await prisma.payrollPolicy.findFirst()
    if (!policy) {
      policy = await prisma.payrollPolicy.create({ data: {} })
    }
    return policy
  }

  static async calculatePayrollForEmployee(employeeId: string, startDate: Date, endDate: Date) {
    const policy = await this.getPayrollPolicy()
    
    // 1. Get Employee
    const employee = await prisma.user.findUnique({
      where: { id: employeeId, isActive: true },
      include: { profile: true }
    })

    if (!employee) {
      throw new Error('Employee not found or inactive')
    }

    // 2. Get Active Salary Structure
    const salary = await prisma.salaryStructure.findFirst({
      where: { employeeId, effectiveFrom: { lte: endDate } },
      orderBy: { effectiveFrom: 'desc' }
    })

    if (!salary) {
      throw new Error('No active salary structure found for period')
    }

    // 3. Get Attendance
    const attendances = await prisma.attendance.findMany({
      where: {
        employeeId,
        date: { gte: startDate, lte: endDate }
      }
    })

    // 4. Get Leave Requests
    const leaves = await prisma.leaveRequest.findMany({
      where: {
        employeeId,
        status: 'APPROVED',
        OR: [
          { startDate: { lte: endDate, gte: startDate } },
          { endDate: { lte: endDate, gte: startDate } },
          { startDate: { lte: startDate }, endDate: { gte: endDate } }
        ]
      },
      include: { leaveType: true }
    })

    // 5. Calculate attendance stats
    let presentDays = 0
    let halfDays = 0
    let absentDays = 0

    for (const a of attendances) {
      if (a.status === 'PRESENT') presentDays++
      else if (a.status === 'HALF_DAY') halfDays++
      else if (a.status === 'ABSENT') absentDays++
    }

    // Calculate leaves taken in this period
    let paidLeaveDays = 0
    let unpaidLeaveDays = 0

    for (const leave of leaves) {
      // Find overlap days between leave and period
      const overlapStart = leave.startDate > startDate ? leave.startDate : startDate
      const overlapEnd = leave.endDate < endDate ? leave.endDate : endDate
      const days = Math.max(0, Math.round((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1)
      
      if (leave.leaveType.name.toLowerCase().includes('unpaid')) {
        unpaidLeaveDays += days
      } else {
        paidLeaveDays += days
      }
    }

    const attendanceDays = presentDays + (halfDays * 0.5) + paidLeaveDays + unpaidLeaveDays + absentDays

    // 6. Calculate Salary Components
    let unpaidLeaveDeduction = 0
    if (policy.unpaidLeaveDeductionEnabled) {
      const dailySalary = salary.grossSalary / policy.workingDaysPerMonth
      unpaidLeaveDeduction = Math.round(dailySalary * unpaidLeaveDays * 100) / 100
    }

    const otherDeductions = salary.deductions
    const totalDeductions = unpaidLeaveDeduction + otherDeductions

    const netSalary = Math.round((salary.grossSalary - totalDeductions) * 100) / 100

    // Validate
    if (netSalary < 0) {
      throw new Error('Net salary cannot be negative')
    }

    return {
      basicSalary: salary.basicSalary,
      hra: salary.hra,
      allowances: salary.allowances,
      bonus: salary.bonuses,
      grossSalary: salary.grossSalary,
      attendanceDays,
      presentDays,
      halfDays,
      paidLeaveDays,
      unpaidLeaveDays,
      absentDays,
      leaveDeduction: unpaidLeaveDeduction,
      otherDeductions,
      totalDeductions,
      netSalary
    }
  }

}
