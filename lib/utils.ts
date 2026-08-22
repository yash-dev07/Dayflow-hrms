import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, differenceInMinutes } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | null | undefined, formatStr = 'MMM dd, yyyy'): string {
  if (!date) return '—'
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, formatStr)
  } catch {
    return '—'
  }
}

export function formatTime(date: string | Date | null | undefined): string {
  if (!date) return '—'
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    return format(d, 'hh:mm a')
  } catch {
    return '—'
  }
}

export function calculateWorkedHours(checkIn: Date | null, checkOut: Date | null): number | null {
  if (!checkIn || !checkOut) return null
  const minutes = differenceInMinutes(checkOut, checkIn)
  return parseFloat((minutes / 60).toFixed(2))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function calculateSalary(data: {
  basicSalary: number
  hra: number
  allowances: number
  bonuses: number
  deductions: number
}) {
  const grossSalary = data.basicSalary + data.hra + data.allowances + data.bonuses
  const netSalary = grossSalary - data.deductions
  return { grossSalary, netSalary }
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase()
}

export function getDepartmentColor(department: string): string {
  const colors: Record<string, string> = {
    Engineering: '#6366f1',
    'Human Resources': '#ec4899',
    Finance: '#f59e0b',
    Marketing: '#10b981',
    Sales: '#3b82f6',
    Operations: '#8b5cf6',
    default: '#6366f1',
  }
  return colors[department] ?? colors.default
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PRESENT: 'bg-emerald-100 text-emerald-700',
    ABSENT: 'bg-red-100 text-red-700',
    HALF_DAY: 'bg-amber-100 text-amber-700',
    LEAVE: 'bg-blue-100 text-blue-700',
    PENDING: 'bg-amber-100 text-amber-700',
    APPROVED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-gray-100 text-gray-700',
    PAID: 'bg-emerald-100 text-emerald-700',
    PROCESSING: 'bg-blue-100 text-blue-700',
  }
  return colors[status] ?? 'bg-gray-100 text-gray-700'
}

export function calculateLeaveDays(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  return Math.max(0, diff)
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}
