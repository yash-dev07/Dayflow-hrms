'use client'

import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, ArrowDown, Download, Printer } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TopBar } from '@/components/shared/TopBar'
import { toast } from '@/components/ui/toaster'
import { formatCurrency, formatDate } from '@/lib/utils'

interface PayrollData {
  salary: {
    basicSalary: number
    hra: number
    allowances: number
    deductions: number
    bonuses: number
    grossSalary: number
    netSalary: number
    effectiveFrom: string
  } | null
  payroll: Array<{
    id: string
    payrollPeriod: { month: number, year: number }
    basicSalary: number
    grossSalary: number
    totalDeductions: number
    netSalary: number
    status: string
    createdAt: string
  }>
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function EmployeePayrollPage() {
  const [data, setData] = useState<PayrollData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/payroll')
      .then(r => r.json())
      .then(setData)
      .catch(() => toast({ title: 'Error', description: 'Failed to load payroll', variant: 'destructive' }))
      .finally(() => setIsLoading(false))
  }, [])

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-16 rounded-xl" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
      </div>
    )
  }

  const salary = data?.salary

  return (
    <div className="space-y-6 page-enter">
      <TopBar userName="Employee" role="EMPLOYEE" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Payroll</h1>
          <p className="text-gray-500 text-sm">View your salary structure and payment history</p>
        </div>
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="w-4 h-4" />
          Print Slip
        </Button>
      </div>

      {!salary ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No salary structure configured</p>
            <p className="text-gray-400 text-sm">Contact HR to set up your salary</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Salary Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm bg-indigo-500 text-white">
              <CardContent className="p-5">
                <p className="text-indigo-200 text-xs font-medium mb-1">Basic Salary</p>
                <p className="text-2xl font-bold">{formatCurrency(salary.basicSalary)}</p>
                <p className="text-indigo-200 text-xs mt-1">Per month</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-emerald-500 text-white">
              <CardContent className="p-5">
                <p className="text-emerald-200 text-xs font-medium mb-1">Gross Salary</p>
                <p className="text-2xl font-bold">{formatCurrency(salary.grossSalary)}</p>
                <p className="text-emerald-200 text-xs mt-1">Before deductions</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-amber-500 text-white">
              <CardContent className="p-5">
                <p className="text-amber-200 text-xs font-medium mb-1">Net Salary</p>
                <p className="text-2xl font-bold">{formatCurrency(salary.netSalary)}</p>
                <p className="text-amber-200 text-xs mt-1">Take home pay</p>
              </CardContent>
            </Card>
          </div>

          {/* Salary Breakdown */}
          <Card className="border-0 shadow-sm" id="salary-slip">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Salary Structure</CardTitle>
                <p className="text-xs text-gray-500">Effective from {formatDate(salary.effectiveFrom)}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Earnings */}
                <div className="bg-emerald-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-emerald-700 mb-3 uppercase tracking-wider">Earnings</p>
                  <div className="space-y-2">
                    {[
                      { label: 'Basic Salary', amount: salary.basicSalary },
                      { label: 'House Rent Allowance (HRA)', amount: salary.hra },
                      { label: 'Other Allowances', amount: salary.allowances },
                      { label: 'Bonuses', amount: salary.bonuses },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between">
                        <span className="text-sm text-gray-700">{item.label}</span>
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                    <div className="border-t border-emerald-200 pt-2 flex justify-between">
                      <span className="text-sm font-semibold text-emerald-700">Total Earnings</span>
                      <span className="text-sm font-bold text-emerald-700">{formatCurrency(salary.grossSalary)}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="bg-red-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-red-700 mb-3 uppercase tracking-wider">Deductions</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-700">Total Deductions</span>
                      <span className="text-sm font-medium text-red-700">-{formatCurrency(salary.deductions)}</span>
                    </div>
                  </div>
                </div>

                {/* Net Pay */}
                <div className="bg-indigo-600 rounded-xl p-4 flex justify-between items-center">
                  <span className="text-white font-bold">Net Pay</span>
                  <span className="text-white text-xl font-bold">{formatCurrency(salary.netSalary)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          {data?.payroll && data.payroll.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-xs font-medium text-gray-500 py-3 px-6">Period</th>
                        <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Gross</th>
                        <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Deductions</th>
                        <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Net Pay</th>
                        <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Status</th>
                        <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Slip</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.payroll.map(record => (
                        <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-3 px-6 text-sm font-medium text-gray-900">
                            {MONTHS[record.payrollPeriod.month - 1]} {record.payrollPeriod.year}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">{formatCurrency(record.grossSalary)}</td>
                          <td className="py-3 px-4 text-sm text-red-600">-{formatCurrency(record.totalDeductions)}</td>
                          <td className="py-3 px-4 text-sm font-bold text-gray-900">{formatCurrency(record.netSalary)}</td>
                          <td className="py-3 px-4">
                            <Badge variant={
                              record.status === 'PAID' ? 'success' :
                              record.status === 'GENERATED' || record.status === 'APPROVED' ? 'blue' : 'warning'
                            }>
                              {record.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <a href={`/admin/payroll/records/${record.id}/slip`} target="_blank" className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center">
                              <Printer className="w-4 h-4 mr-1" /> View Slip
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
