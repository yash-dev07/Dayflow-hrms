import { z } from 'zod'

export const registerSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const updateProfileSchema = z.object({
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  profilePicture: z.string().optional(),
})

export const updateEmployeeSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  joiningDate: z.string().optional(),
  employmentType: z.string().optional(),
  managerId: z.string().optional(),
})

export const leaveRequestSchema = z.object({
  leaveTypeId: z.string().min(1, 'Leave type is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  employeeComment: z.string().optional(),
}).refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
  message: 'End date cannot be before start date',
  path: ['endDate'],
})

export const leaveReviewSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  hrComment: z.string().optional(),
})

export const salarySchema = z.object({
  basicSalary: z.number().min(0, 'Basic salary cannot be negative'),
  hra: z.number().min(0, 'HRA cannot be negative'),
  allowances: z.number().min(0, 'Allowances cannot be negative'),
  deductions: z.number().min(0, 'Deductions cannot be negative'),
  bonuses: z.number().min(0, 'Bonuses cannot be negative'),
})

export const attendanceCorrectionSchema = z.object({
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  status: z.enum(['PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE']).optional(),
  remarks: z.string().optional(),
})

export const addEmployeeSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['EMPLOYEE', 'HR', 'ADMIN']).default('EMPLOYEE'),
  department: z.string().optional(),
  designation: z.string().optional(),
  joiningDate: z.string().optional(),
  employmentType: z.string().optional(),
  phone: z.string().optional(),
})
