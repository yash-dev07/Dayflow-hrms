import { PrismaClient, Role, AttendanceStatus, LeaveStatus, PayrollPeriodStatus, PayrollRecordStatus } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const departments = ['Engineering', 'Human Resources', 'Finance', 'Marketing', 'Sales', 'Operations']
const designations: Record<string, string[]> = {
  Engineering: ['Software Engineer', 'Senior Engineer', 'Tech Lead', 'DevOps Engineer', 'QA Engineer'],
  'Human Resources': ['HR Manager', 'HR Executive', 'Recruiter', 'HR Analyst'],
  Finance: ['Finance Manager', 'Accountant', 'Finance Analyst', 'CFO'],
  Marketing: ['Marketing Manager', 'Content Writer', 'SEO Specialist', 'Brand Manager'],
  Sales: ['Sales Manager', 'Sales Executive', 'Business Development', 'Account Manager'],
  Operations: ['Operations Manager', 'Project Manager', 'Operations Analyst', 'Coordinator'],
}

const employeeNames = [
  { firstName: 'Arjun', lastName: 'Sharma' },
  { firstName: 'Priya', lastName: 'Patel' },
  { firstName: 'Rahul', lastName: 'Kumar' },
  { firstName: 'Sneha', lastName: 'Reddy' },
  { firstName: 'Vikram', lastName: 'Singh' },
  { firstName: 'Ananya', lastName: 'Gupta' },
  { firstName: 'Kiran', lastName: 'Nair' },
  { firstName: 'Deepa', lastName: 'Joshi' },
  { firstName: 'Amit', lastName: 'Verma' },
  { firstName: 'Pooja', lastName: 'Iyer' },
  { firstName: 'Suresh', lastName: 'Mishra' },
  { firstName: 'Divya', lastName: 'Pillai' },
  { firstName: 'Ravi', lastName: 'Rao' },
  { firstName: 'Meera', lastName: 'Shah' },
  { firstName: 'Aditya', lastName: 'Bose' },
]

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing data (in order of dependencies)
  await prisma.activityLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.document.deleteMany()
  await prisma.payrollAuditLog.deleteMany()
  await prisma.payrollRecord.deleteMany()
  await prisma.payrollPeriod.deleteMany()
  await prisma.payrollPolicy.deleteMany()
  await prisma.salaryStructure.deleteMany()
  await prisma.leaveRequest.deleteMany()
  await prisma.attendance.deleteMany()
  await prisma.leaveType.deleteMany()
  await prisma.employeeProfile.deleteMany()
  await prisma.user.deleteMany()

  console.log('✅ Cleared existing data')

  // Create Payroll Policy
  await prisma.payrollPolicy.create({
    data: {
      workingDaysPerMonth: 26,
      unpaidLeaveDeductionEnabled: true,
      overtimeEnabled: false,
      taxCalculationEnabled: false,
      pfEnabled: false,
      esiEnabled: false,
      professionalTaxEnabled: false,
    }
  })
  console.log('✅ Created payroll policy')

  // Create Leave Types
  const leaveTypes = await Promise.all([
    prisma.leaveType.create({
      data: { name: 'Paid Leave', description: 'Annual paid time off', annualAllowance: 20, color: '#6366f1' }
    }),
    prisma.leaveType.create({
      data: { name: 'Sick Leave', description: 'Medical or health-related leave', annualAllowance: 10, color: '#ec4899' }
    }),
    prisma.leaveType.create({
      data: { name: 'Unpaid Leave', description: 'Unpaid time off', annualAllowance: 30, color: '#f59e0b' }
    }),
  ])
  console.log('✅ Created leave types')

  const hashPassword = async (password: string) => bcrypt.hash(password, 12)

  // Create ADMIN
  const adminUser = await prisma.user.create({
    data: {
      employeeId: 'DF-ADMIN-001',
      email: 'admin@dayflow.demo',
      passwordHash: await hashPassword('Admin@123'),
      role: 'ADMIN',
      emailVerified: true,
      profile: {
        create: {
          firstName: 'Alex',
          lastName: 'Johnson',
          phone: '+91 98765 43210',
          department: 'Operations',
          designation: 'System Administrator',
          joiningDate: new Date('2022-01-15'),
          employmentType: 'Full-time',
          gender: 'Male',
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'India',
        }
      }
    }
  })

  // Create HR users
  const hrUsers = []
  const hrData = [
    { id: 'DF-HR-001', email: 'hr@dayflow.demo', password: 'Hr@12345', firstName: 'Sarah', lastName: 'Williams', designation: 'HR Manager' },
    { id: 'DF-HR-002', email: 'hr2@dayflow.demo', password: 'Hr@12345', firstName: 'Michael', lastName: 'Chen', designation: 'HR Executive' },
    { id: 'DF-HR-003', email: 'hr3@dayflow.demo', password: 'Hr@12345', firstName: 'Emma', lastName: 'Davis', designation: 'Recruiter' },
  ]

  for (const hr of hrData) {
    const u = await prisma.user.create({
      data: {
        employeeId: hr.id,
        email: hr.email,
        passwordHash: await hashPassword(hr.password),
        role: 'HR',
        emailVerified: true,
        profile: {
          create: {
            firstName: hr.firstName,
            lastName: hr.lastName,
            department: 'Human Resources',
            designation: hr.designation,
            joiningDate: new Date('2022-03-01'),
            employmentType: 'Full-time',
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India',
          }
        }
      }
    })
    hrUsers.push(u)
  }

  console.log('✅ Created admin and HR users')

  // Create EMPLOYEE - demo account
  const demoEmployee = await prisma.user.create({
    data: {
      employeeId: 'DF-EMP-001',
      email: 'employee@dayflow.demo',
      passwordHash: await hashPassword('Employee@123'),
      role: 'EMPLOYEE',
      emailVerified: true,
      profile: {
        create: {
          firstName: 'Rohan',
          lastName: 'Mehra',
          phone: '+91 99887 76655',
          department: 'Engineering',
          designation: 'Software Engineer',
          joiningDate: new Date('2023-06-01'),
          employmentType: 'Full-time',
          gender: 'Male',
          city: 'Hyderabad',
          state: 'Telangana',
          country: 'India',
          address: '42, Tech Park Colony',
        }
      },
      salaryStructures: {
        create: {
          basicSalary: 50000,
          hra: 15000,
          allowances: 8000,
          deductions: 5000,
          bonuses: 2000,
          grossSalary: 75000,
          netSalary: 70000,
          effectiveFrom: new Date('2023-06-01'),
        }
      }
    }
  })

  // Create 15 more employees
  const employees = [demoEmployee]
  for (let i = 0; i < employeeNames.length; i++) {
    const name = employeeNames[i]
    const dept = departments[i % departments.length]
    const desig = designations[dept][Math.floor(Math.random() * designations[dept].length)]
    const salary = 30000 + Math.floor(Math.random() * 70000)
    const hra = Math.floor(salary * 0.2)
    const allowances = Math.floor(salary * 0.1)
    const deductions = Math.floor(salary * 0.08)
    const bonuses = Math.floor(Math.random() * 5000)
    const gross = salary + hra + allowances + bonuses
    const net = gross - deductions

    const emp = await prisma.user.create({
      data: {
        employeeId: `DF-EMP-${String(i + 2).padStart(3, '0')}`,
        email: `${name.firstName.toLowerCase()}.${name.lastName.toLowerCase()}@dayflow.demo`,
        passwordHash: await hashPassword('Employee@123'),
        role: 'EMPLOYEE',
        emailVerified: true,
        profile: {
          create: {
            firstName: name.firstName,
            lastName: name.lastName,
            department: dept,
            designation: desig,
            joiningDate: new Date(2022 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28)),
            employmentType: Math.random() > 0.2 ? 'Full-time' : 'Part-time',
            gender: Math.random() > 0.5 ? 'Male' : 'Female',
            city: ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune'][Math.floor(Math.random() * 6)],
            state: 'India',
            country: 'India',
            phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          }
        },
        salaryStructures: {
          create: {
            basicSalary: salary,
            hra,
            allowances,
            deductions,
            bonuses,
            grossSalary: gross,
            netSalary: net,
            effectiveFrom: new Date('2023-01-01'),
          }
        }
      }
    })
    employees.push(emp)
  }
  console.log('✅ Created employees')

  // Generate attendance history (last 60 days)
  const allUsers = [adminUser, ...hrUsers, ...employees]
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (const user of employees) {
    for (let d = 60; d >= 0; d--) {
      const date = new Date(today)
      date.setDate(today.getDate() - d)
      const dayOfWeek = date.getDay()
      if (dayOfWeek === 0 || dayOfWeek === 6) continue // Skip weekends

      const rand = Math.random()
      let status: AttendanceStatus = 'PRESENT'
      let checkIn: Date | null = null
      let checkOut: Date | null = null
      let workedHours: number | null = null

      if (rand < 0.75) {
        status = 'PRESENT'
        const checkInHour = 8 + Math.floor(Math.random() * 2)
        const checkInMin = Math.floor(Math.random() * 60)
        checkIn = new Date(date)
        checkIn.setHours(checkInHour, checkInMin, 0, 0)
        checkOut = new Date(date)
        checkOut.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0)
        workedHours = parseFloat(((checkOut.getTime() - checkIn.getTime()) / 3600000).toFixed(2))
      } else if (rand < 0.85) {
        status = 'ABSENT'
      } else if (rand < 0.95) {
        status = 'HALF_DAY'
        checkIn = new Date(date)
        checkIn.setHours(9, 0, 0, 0)
        checkOut = new Date(date)
        checkOut.setHours(13, 0, 0, 0)
        workedHours = 4
      } else {
        status = 'LEAVE'
      }

      // Don't create attendance for today if it's a future date
      if (date > new Date()) continue

      await prisma.attendance.create({
        data: {
          employeeId: user.id,
          date,
          checkIn,
          checkOut,
          status,
          workedHours,
        }
      }).catch(() => {}) // Skip duplicates
    }
  }
  console.log('✅ Created attendance records')

  // Create leave requests
  const leaveStatuses: LeaveStatus[] = ['APPROVED', 'REJECTED', 'PENDING', 'APPROVED', 'APPROVED']
  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i]
    const numLeaves = 2 + Math.floor(Math.random() * 3)
    
    for (let l = 0; l < numLeaves; l++) {
      const leaveType = leaveTypes[Math.floor(Math.random() * leaveTypes.length)]
      const daysAgo = Math.floor(Math.random() * 50) + 5
      const startDate = new Date(today)
      startDate.setDate(today.getDate() - daysAgo)
      const numDays = 1 + Math.floor(Math.random() * 3)
      const endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + numDays - 1)
      const status = leaveStatuses[l % leaveStatuses.length]

      try {
        await prisma.leaveRequest.create({
          data: {
            employeeId: emp.id,
            leaveTypeId: leaveType.id,
            startDate,
            endDate,
            numberOfDays: numDays,
            reason: `Personal ${leaveType.name.toLowerCase()} request for ${numDays} day(s).`,
            status,
            reviewedBy: status !== 'PENDING' ? hrUsers[0].id : null,
            reviewedAt: status !== 'PENDING' ? new Date(startDate.getTime() - 2 * 24 * 60 * 60 * 1000) : null,
            hrComment: status === 'REJECTED' ? 'Insufficient notice period. Please plan in advance.' : null,
          }
        })
      } catch {
        // Skip if date conflicts
      }
    }
  }
  console.log('✅ Created leave requests')

  // Create payroll periods and records (June, July, August 2026)
  const monthsToSeed = [
    { m: 6, y: 2026, status: 'PAID' as PayrollPeriodStatus },
    { m: 7, y: 2026, status: 'PAID' as PayrollPeriodStatus },
    { m: 8, y: 2026, status: 'DRAFT' as PayrollPeriodStatus }
  ]

  for (const pd of monthsToSeed) {
    const startDate = new Date(pd.y, pd.m - 1, 1)
    const endDate = new Date(pd.y, pd.m, 0)
    
    const period = await prisma.payrollPeriod.create({
      data: {
        month: pd.m,
        year: pd.y,
        startDate,
        endDate,
        status: pd.status
      }
    })

    for (const emp of employees) {
      const salary = await prisma.salaryStructure.findFirst({
        where: { employeeId: emp.id },
        orderBy: { effectiveFrom: 'desc' }
      })
      
      if (!salary) continue;

      const recordStatus = pd.status === 'PAID' ? 'PAID' as PayrollRecordStatus : 'GENERATED' as PayrollRecordStatus;

      const unpaidLeaveDays = Math.floor(Math.random() * 2);
      const leaveDeduction = (salary.grossSalary / 26) * unpaidLeaveDays;
      const totalDeductions = salary.deductions + leaveDeduction;

      await prisma.payrollRecord.create({
        data: {
          employeeId: emp.id,
          payrollPeriodId: period.id,
          basicSalary: salary.basicSalary,
          hra: salary.hra,
          allowances: salary.allowances,
          bonus: salary.bonuses,
          grossSalary: salary.grossSalary,
          attendanceDays: 26,
          presentDays: 26 - unpaidLeaveDays,
          halfDays: 0,
          paidLeaveDays: 0,
          unpaidLeaveDays: unpaidLeaveDays,
          absentDays: 0,
          leaveDeduction: leaveDeduction,
          otherDeductions: salary.deductions,
          totalDeductions: totalDeductions,
          netSalary: salary.grossSalary - totalDeductions,
          status: recordStatus,
          approvedById: recordStatus === 'PAID' ? adminUser.id : null,
          approvedAt: recordStatus === 'PAID' ? new Date() : null,
        }
      })
    }
  }

  console.log('✅ Created payroll periods and records')

  // Create notifications
  const notificationMessages = [
    { title: 'Welcome to Dayflow! 🎉', message: 'Your account has been set up. Explore your dashboard.', type: 'SUCCESS' as const },
    { title: 'Leave Policy Update', message: 'The annual leave policy has been updated. Please review.', type: 'INFO' as const },
    { title: 'Attendance Reminder', message: 'Please ensure you check in/out daily for accurate records.', type: 'WARNING' as const },
    { title: 'Salary Processed', message: 'Your salary for this month has been processed.', type: 'SUCCESS' as const },
  ]

  for (const user of allUsers) {
    for (const notif of notificationMessages.slice(0, 2 + Math.floor(Math.random() * 3))) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          ...notif,
          read: Math.random() > 0.3,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
        }
      })
    }
  }
  console.log('✅ Created notifications')

  // Create activity logs
  await prisma.activityLog.createMany({
    data: [
      { actorId: adminUser.id, action: 'EMPLOYEE_CREATED', targetId: demoEmployee.id, targetType: 'USER', details: 'Created demo employee account' },
      { actorId: hrUsers[0].id, action: 'LEAVE_APPROVED', targetId: employees[0].id, targetType: 'LEAVE_REQUEST', details: 'Approved annual leave request' },
      { actorId: adminUser.id, action: 'ATTENDANCE_CORRECTED', targetId: employees[2].id, targetType: 'ATTENDANCE', details: 'Corrected check-in time' },
    ]
  })
  console.log('✅ Created activity logs')

  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📋 Demo Accounts:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('ADMIN:    admin@dayflow.demo    / Admin@123')
  console.log('HR:       hr@dayflow.demo       / Hr@12345')
  console.log('EMPLOYEE: employee@dayflow.demo / Employee@123')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
