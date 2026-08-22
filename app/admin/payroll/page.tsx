'use client'

import { useState, useEffect, useCallback } from 'react'
import { FileText, Save, Search, Play, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { TopBar } from '@/components/shared/TopBar'
import { toast } from '@/components/ui/toaster'
import { formatCurrency, getInitials } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function AdminPayrollPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('periods')
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateForm, setGenerateForm] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() })
  const [showGenerateModal, setShowGenerateModal] = useState(false)

  // Data
  const [periods, setPeriods] = useState<any[]>([])
  const [salaries, setSalaries] = useState<any[]>([])
  
  // Salary Edit State
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ basicSalary: 0, hra: 0, allowances: 0, deductions: 0, bonuses: 0 })
  const [isSaving, setIsSaving] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null)

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      const [periodsRes, payrollRes] = await Promise.all([
        fetch('/api/payroll/period'),
        fetch('/api/payroll')
      ])
      const periodsData = await periodsRes.json()
      const payrollData = await payrollRes.json()
      
      setPeriods(periodsData.periods ?? [])
      setSalaries(payrollData.salaries ?? [])
    } catch {
      toast({ title: 'Error', description: 'Failed to load payroll data', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch('/api/payroll/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generateForm),
      })
      const data = await res.json()
      if (!res.ok) { toast({ title: 'Error', description: data.error, variant: 'destructive' }); return }
      toast({ title: 'Success', description: `Generated payroll for ${data.generatedCount} employees.`, variant: 'success' })
      setShowGenerateModal(false)
      loadData()
    } finally {
      setIsGenerating(false)
    }
  }

  const openEdit = (record: any) => {
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
      toast({ title: 'Salary Updated ✅', description: `Salary structure has been updated.`, variant: 'success' })
      setEditingId(null)
      setSelectedEmployee(null)
      loadData()
    } finally { setIsSaving(false) }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Draft</Badge>
      case 'GENERATED': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Generated</Badge>
      case 'PAID': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Paid</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6 page-enter">
      <TopBar userName="Admin" role="ADMIN" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
          <p className="text-gray-500 text-sm">Process monthly payroll and manage salary structures</p>
        </div>
        <Button onClick={() => setShowGenerateModal(true)} className="gap-2">
          <Play className="w-4 h-4" /> Generate Payroll
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger value="periods" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">Payroll Periods</TabsTrigger>
          <TabsTrigger value="structures" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">Salary Structures</TabsTrigger>
        </TabsList>

        <TabsContent value="periods" className="space-y-4 m-0">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-3">
                  {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-16 rounded-lg" />)}
                </div>
              ) : periods.length === 0 ? (
                <div className="py-16 text-center text-gray-500">No payroll periods found. Generate one to get started.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-xs font-medium text-gray-500 py-3 px-6">Period</th>
                        <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Status</th>
                        <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Employees</th>
                        <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Total Payroll</th>
                        <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {periods.map(period => (
                        <tr key={period.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-4 px-6 font-medium text-gray-900">
                            {MONTHS[period.month - 1]} {period.year}
                          </td>
                          <td className="py-4 px-4">{getStatusBadge(period.status)}</td>
                          <td className="py-4 px-4 text-gray-600">{period._count.records}</td>
                          <td className="py-4 px-4 font-bold text-gray-900">{formatCurrency(period.totalPayroll)}</td>
                          <td className="py-4 px-4">
                            <Button variant="outline" size="sm" onClick={() => router.push(`/admin/payroll/${period.id}`)}>
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structures" className="space-y-4 m-0">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search employees..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-3">
                  {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14 rounded-lg" />)}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-xs font-medium text-gray-500 py-3 px-6">Employee</th>
                        <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Basic</th>
                        <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">HRA</th>
                        <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Gross</th>
                        <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Net Pay</th>
                        <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salaries.filter(s => {
                        if (!search) return true
                        const name = s.employee.profile ? `${s.employee.profile.firstName} ${s.employee.profile.lastName}` : ''
                        return name.toLowerCase().includes(search.toLowerCase()) || s.employee.employeeId.toLowerCase().includes(search.toLowerCase())
                      }).map(record => (
                        <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-3 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-indigo-600 text-xs font-bold">{getInitials(record.employee.profile?.firstName, record.employee.profile?.lastName)}</span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {record.employee.profile ? `${record.employee.profile.firstName} ${record.employee.profile.lastName}` : record.employee.employeeId}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">{formatCurrency(record.basicSalary)}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{formatCurrency(record.hra)}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{formatCurrency(record.grossSalary)}</td>
                          <td className="py-3 px-4 text-sm font-bold text-indigo-600">{formatCurrency(record.netSalary)}</td>
                          <td className="py-3 px-4">
                            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => openEdit(record)}>
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generate Payroll Modal */}
      <Dialog open={showGenerateModal} onOpenChange={setShowGenerateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Payroll</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label>Month</Label>
              <select 
                className="w-full mt-1 border rounded-md p-2"
                value={generateForm.month}
                onChange={e => setGenerateForm(p => ({ ...p, month: parseInt(e.target.value) }))}
              >
                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <Label>Year</Label>
              <Input 
                type="number" 
                value={generateForm.year} 
                onChange={e => setGenerateForm(p => ({ ...p, year: parseInt(e.target.value) }))} 
                className="mt-1" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateModal(false)}>Cancel</Button>
            <Button onClick={handleGenerate} loading={isGenerating}>Generate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Salary Modal */}
      <Dialog open={!!editingId} onOpenChange={() => setEditingId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Salary Structure</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            {[
              { label: 'Basic Salary', key: 'basicSalary' },
              { label: 'HRA', key: 'hra' },
              { label: 'Allowances', key: 'allowances' },
              { label: 'Bonuses', key: 'bonuses' },
              { label: 'Deductions', key: 'deductions' },
            ].map(field => (
              <div key={field.key}>
                <Label>{field.label}</Label>
                <Input type="number" min={0} value={editForm[field.key as keyof typeof editForm]} onChange={e => setEditForm(prev => ({ ...prev, [field.key]: parseFloat(e.target.value) || 0 }))} />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
            <Button onClick={handleSaveSalary} loading={isSaving}>Save Structure</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
