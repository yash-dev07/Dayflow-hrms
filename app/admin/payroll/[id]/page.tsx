'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { FileText, ArrowLeft, Check, CheckCircle, XCircle, Printer } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TopBar } from '@/components/shared/TopBar'
import { toast } from '@/components/ui/toaster'
import { formatCurrency, getInitials } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function AdminPayrollPeriodPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [period, setPeriod] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isActioning, setIsActioning] = useState(false)

  const loadPeriod = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/payroll/period/${id}`)
      const data = await res.json()
      if (res.ok) setPeriod(data.period)
    } catch {
      toast({ title: 'Error', description: 'Failed to load payroll period', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => { loadPeriod() }, [loadPeriod])

  const handleAction = async (endpoint: string, successMessage: string) => {
    setIsActioning(true)
    try {
      const res = await fetch(endpoint, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { toast({ title: 'Error', description: data.error, variant: 'destructive' }); return }
      toast({ title: 'Success', description: successMessage, variant: 'success' })
      loadPeriod()
    } finally {
      setIsActioning(false)
    }
  }

  if (isLoading) return <div className="p-8 page-enter"><div className="skeleton h-12 w-1/3 rounded-lg mb-8" /><div className="skeleton h-64 rounded-xl" /></div>
  if (!period) return <div className="p-8 text-center text-gray-500">Period not found</div>

  const totalNet = period.records.reduce((s: number, r: any) => s + r.netSalary, 0)
  const pendingCount = period.records.filter((r: any) => r.status === 'GENERATED' || r.status === 'DRAFT').length
  const allApproved = period.records.every((r: any) => r.status === 'APPROVED' || r.status === 'PAID')

  return (
    <div className="space-y-6 page-enter">
      <TopBar userName="Admin" role="ADMIN" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/payroll')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {MONTHS[period.month - 1]} {period.year} Payroll
            </h1>
            <div className="text-gray-500 text-sm">
              Status: <Badge className="ml-2" variant="outline">{period.status}</Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {period.status === 'DRAFT' && (
            <Button onClick={() => handleAction(`/api/payroll/period/${period.id}/finalize`, 'Period finalized!')} loading={isActioning}>
              Finalize Period
            </Button>
          )}
          {period.status === 'GENERATED' && allApproved && (
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleAction(`/api/payroll/period/${period.id}/mark-paid`, 'Period marked as paid!')} loading={isActioning}>
              <CheckCircle className="w-4 h-4 mr-2" /> Mark as PAID
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-xs text-gray-500">Total Employees</p><p className="text-xl font-bold mt-1">{period.records.length}</p></CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-xs text-gray-500">Total Net Pay</p><p className="text-xl font-bold mt-1 text-indigo-700">{formatCurrency(totalNet)}</p></CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-xs text-gray-500">Pending Approvals</p><p className="text-xl font-bold mt-1">{pendingCount}</p></CardContent></Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-500 py-3 px-6">Employee</th>
                  <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Gross Pay</th>
                  <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Deductions</th>
                  <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Net Pay</th>
                  <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Status</th>
                  <th className="text-right text-xs font-medium text-gray-500 py-3 px-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {period.records.map((r: any) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-600 text-xs font-bold">{getInitials(r.employee.profile?.firstName, r.employee.profile?.lastName)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{r.employee.profile?.firstName} {r.employee.profile?.lastName}</p>
                          <p className="text-xs text-gray-500">{r.employee.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{formatCurrency(r.grossSalary)}</td>
                    <td className="py-3 px-4 text-sm text-red-600">-{formatCurrency(r.totalDeductions)}</td>
                    <td className="py-3 px-4 text-sm font-bold text-indigo-700">{formatCurrency(r.netSalary)}</td>
                    <td className="py-3 px-4">
                      {r.status === 'APPROVED' || r.status === 'PAID' ? (
                        <Badge className="bg-emerald-100 text-emerald-700">{r.status}</Badge>
                      ) : r.status === 'REJECTED' ? (
                        <Badge className="bg-red-100 text-red-700">REJECTED</Badge>
                      ) : (
                        <Badge variant="outline">{r.status}</Badge>
                      )}
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        {r.status === 'GENERATED' && (
                          <>
                            <Button size="sm" variant="outline" className="h-7 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => handleAction(`/api/payroll/records/${r.id}/approve`, 'Approved record')} disabled={isActioning}>
                              <Check className="w-3 h-3 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleAction(`/api/payroll/records/${r.id}/reject`, 'Rejected record')} disabled={isActioning}>
                              <XCircle className="w-3 h-3 mr-1" /> Reject
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-indigo-600" onClick={() => router.push(`/admin/payroll/records/${r.id}/slip`)}>
                          <FileText className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
