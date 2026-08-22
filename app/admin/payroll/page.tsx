'use client'

import { useState, useEffect, useCallback } from 'react'
import { DollarSign, Save, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { TopBar } from '@/components/shared/TopBar'
import { toast } from '@/components/ui/toaster'
import { formatCurrency, getInitials } from '@/lib/utils'

interface SalaryRecord {
  employee: {
    id: string
    employeeId: string
    profile: { firstName: string; lastName: string; department: string | null } | null
  }
  basicSalary: number
  hra: number
  allowances: number
  deductions: number
  bonuses: number
  grossSalary: number
  netSalary: number
}

export default function AdminPayrollPage() {
  const [salaries, setSalaries] = useState<SalaryRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    basicSalary: 0, hra: 0, allowances: 0, deductions: 0, bonuses: 0
  })
  const [isSaving, setIsSaving] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<SalaryRecord | null>(null)

  const loadSalaries = useCallback(async () => {
    try {
      const res = await fetch('/api/payroll')
      const data = await res.json()
      setSalaries(data.salaries ?? [])
    } catch {
      toast({ title: 'Error', description: 'Failed to load payroll data', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadSalaries() }, [loadSalaries])

  const openEdit = (record: SalaryRecord) => {
    setSelectedEmployee(record)
    setEditingId(record.employee.id)
    setEditForm({
      basicSalary: record.basicSalary,
      hra: record.hra,
      allowances: record.allowances,
      deductions: record.deductions,
      bonuses: record.bonuses,
    })
  }

  const handleSaveSalary = async () => {
    if (!editingId) return
    setIsSaving(true)
    try {
      const res = await fetch(`/api/payroll/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      const data = await res.json()
      if (!res.ok) { toast({ title: 'Error', description: data.error, variant: 'destructive' }); return }
      const empName = selectedEmployee?.employee.profile
        ? `${selectedEmployee.employee.profile.firstName} ${selectedEmployee.employee.profile.lastName}`
        : 'Employee'
      toast({ title: 'Salary Updated ✅', description: `${empName}'s salary has been updated.`, variant: 'success' })
      setEditingId(null)
      setSelectedEmployee(null)
      await loadSalaries()
    } finally { setIsSaving(false) }
  }

  const grossSalary = editForm.basicSalary + editForm.hra + editForm.allowances + editForm.bonuses
  const netSalary = grossSalary - editForm.deductions

  const filtered = salaries.filter(s => {
    if (!search) return true
    const name = s.employee.profile ? `${s.employee.profile.firstName} ${s.employee.profile.lastName}` : ''
    return name.toLowerCase().includes(search.toLowerCase()) ||
      s.employee.employeeId.toLowerCase().includes(search.toLowerCase())
  })

  const totalPayroll = salaries.reduce((sum, s) => sum + s.netSalary, 0)
  const avgSalary = salaries.length > 0 ? totalPayroll / salaries.length : 0

  return (
    <div className="space-y-6 page-enter">
      <TopBar userName="Admin" role="ADMIN" />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
        <p className="text-gray-500 text-sm">Manage salary structures for all employees</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <CardContent className="p-5">
            <p className="text-indigo-200 text-xs">Total Monthly Payroll</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(totalPayroll)}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardContent className="p-5">
            <p className="text-emerald-200 text-xs">Average Net Salary</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(avgSalary)}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <CardContent className="p-5">
            <p className="text-amber-200 text-xs">Total Employees on Payroll</p>
            <p className="text-2xl font-bold mt-1">{salaries.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search employees..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Salary Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14 rounded-lg" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-500">No salary records found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-medium text-gray-500 py-3 px-6">Employee</th>
                    <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Basic</th>
                    <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">HRA</th>
                    <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Gross</th>
                    <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Deductions</th>
                    <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Net Pay</th>
                    <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(record => {
                    const fullName = record.employee.profile
                      ? `${record.employee.profile.firstName} ${record.employee.profile.lastName}`
                      : record.employee.employeeId
                    const initials = record.employee.profile
                      ? getInitials(record.employee.profile.firstName, record.employee.profile.lastName) : '?'
                    return (
                      <tr key={record.employee.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-600 text-xs font-bold">{initials}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{fullName}</p>
                              <p className="text-xs text-gray-500">{record.employee.profile?.department ?? ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">{formatCurrency(record.basicSalary)}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{formatCurrency(record.hra)}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{formatCurrency(record.grossSalary)}</td>
                        <td className="py-3 px-4 text-sm text-red-600">-{formatCurrency(record.deductions)}</td>
                        <td className="py-3 px-4 text-sm font-bold text-indigo-600">{formatCurrency(record.netSalary)}</td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => openEdit(record)}>
                            Edit
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Salary Modal */}
      <Dialog open={!!editingId} onOpenChange={() => setEditingId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Salary Structure</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-sm font-semibold text-gray-900">
                  {selectedEmployee.employee.profile
                    ? `${selectedEmployee.employee.profile.firstName} ${selectedEmployee.employee.profile.lastName}`
                    : selectedEmployee.employee.employeeId}
                </p>
                <p className="text-xs text-gray-500">{selectedEmployee.employee.employeeId}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Basic Salary', key: 'basicSalary' },
                  { label: 'HRA', key: 'hra' },
                  { label: 'Allowances', key: 'allowances' },
                  { label: 'Bonuses', key: 'bonuses' },
                  { label: 'Deductions', key: 'deductions' },
                ].map(field => (
                  <div key={field.key}>
                    <Label>{field.label}</Label>
                    <Input
                      type="number"
                      min={0}
                      value={editForm[field.key as keyof typeof editForm]}
                      onChange={e => setEditForm(prev => ({ ...prev, [field.key]: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                ))}
              </div>

              <div className="p-3 bg-indigo-50 rounded-xl space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Gross Salary</span>
                  <span className="font-medium">{formatCurrency(grossSalary)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-indigo-700">Net Salary</span>
                  <span className="text-indigo-700">{formatCurrency(netSalary)}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
            <Button onClick={handleSaveSalary} loading={isSaving}>
              <Save className="w-4 h-4" />
              Save Salary
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
