'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Eye, Edit2, Trash2, Filter } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TopBar } from '@/components/shared/TopBar'
import { toast } from '@/components/ui/toaster'
import { formatDate, getInitials } from '@/lib/utils'

interface Employee {
  id: string
  employeeId: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
  profile: {
    firstName: string
    lastName: string
    department: string | null
    designation: string | null
    joiningDate: string | null
    profilePicture: string | null
  } | null
  salaryStructure: { netSalary: number } | null
}

const DEPARTMENTS = ['Engineering', 'Human Resources', 'Finance', 'Marketing', 'Sales', 'Operations']

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [addForm, setAddForm] = useState({
    employeeId: '', email: '', password: 'Employee@123',
    firstName: '', lastName: '', department: '', designation: '',
    joiningDate: new Date().toISOString().split('T')[0],
    employmentType: 'Full-time', phone: '', role: 'EMPLOYEE'
  })

  const loadEmployees = useCallback(async () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (deptFilter) params.set('department', deptFilter)

    try {
      const res = await fetch(`/api/employees?${params}`)
      const data = await res.json()
      setEmployees(data.employees ?? [])
      setTotal(data.total ?? 0)
    } catch {
      toast({ title: 'Error', description: 'Failed to load employees', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }, [search, deptFilter])

  useEffect(() => {
    const debounce = setTimeout(loadEmployees, 300)
    return () => clearTimeout(debounce)
  }, [loadEmployees])

  const handleAddEmployee = async () => {
    setIsAdding(true)
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      })
      const data = await res.json()
      if (!res.ok) { toast({ title: 'Error', description: data.error, variant: 'destructive' }); return }
      toast({ title: 'Employee Added ✅', description: `${addForm.firstName} ${addForm.lastName} has been added.`, variant: 'success' })
      setShowAddModal(false)
      setAddForm({ employeeId: '', email: '', password: 'Employee@123', firstName: '', lastName: '', department: '', designation: '', joiningDate: new Date().toISOString().split('T')[0], employmentType: 'Full-time', phone: '', role: 'EMPLOYEE' })
      await loadEmployees()
    } finally { setIsAdding(false) }
  }

  const handleDeactivate = async (id: string) => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) { toast({ title: 'Error', description: data.error, variant: 'destructive' }); return }
      toast({ title: 'Employee Deactivated', description: 'The employee has been deactivated.' })
      setDeleteId(null)
      await loadEmployees()
    } finally { setIsDeleting(false) }
  }

  return (
    <div className="space-y-6 page-enter">
      <TopBar userName="Admin" role="ADMIN" showSearch={false} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-500 text-sm">{total} total employees</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" />
          Add Employee
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name, ID, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Departments</SelectItem>
            {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        {(search || deptFilter) && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setDeptFilter('') }}>
            Clear filters
          </Button>
        )}
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-14 rounded-lg" />)}
            </div>
          ) : employees.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-gray-500 font-medium">No employees found</p>
              {(search || deptFilter) && <p className="text-gray-400 text-sm mt-1">Try adjusting your search filters</p>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-medium text-gray-500 py-3 px-6">Employee</th>
                    <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Department</th>
                    <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Role</th>
                    <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Joined</th>
                    <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Status</th>
                    <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => {
                    const fullName = emp.profile ? `${emp.profile.firstName} ${emp.profile.lastName}` : emp.email
                    const initials = emp.profile ? getInitials(emp.profile.firstName, emp.profile.lastName) : '?'
                    return (
                      <tr key={emp.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-indigo-600 text-xs font-bold">{initials}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{fullName}</p>
                              <p className="text-xs text-gray-500">{emp.employeeId} · {emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm text-gray-900">{emp.profile?.department ?? '—'}</p>
                            <p className="text-xs text-gray-500">{emp.profile?.designation ?? ''}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={emp.role === 'ADMIN' ? 'destructive' : emp.role === 'HR' ? 'default' : 'secondary'}>
                            {emp.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {emp.profile?.joiningDate ? formatDate(emp.profile.joiningDate) : '—'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={emp.isActive ? 'success' : 'secondary'}>
                            {emp.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <Link href={`/admin/employees/${emp.id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8" title="View">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:text-red-600"
                              title="Deactivate"
                              onClick={() => setDeleteId(emp.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
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

      {/* Add Employee Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Employee ID *</Label>
                <Input placeholder="DF-EMP-XXX" value={addForm.employeeId} onChange={e => setAddForm(p => ({ ...p, employeeId: e.target.value }))} />
              </div>
              <div>
                <Label>Role</Label>
                <Select value={addForm.role} onValueChange={v => setAddForm(p => ({ ...p, role: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMPLOYEE">Employee</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>First Name *</Label>
                <Input placeholder="John" value={addForm.firstName} onChange={e => setAddForm(p => ({ ...p, firstName: e.target.value }))} />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input placeholder="Doe" value={addForm.lastName} onChange={e => setAddForm(p => ({ ...p, lastName: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" placeholder="john@company.com" value={addForm.email} onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" value={addForm.password} onChange={e => setAddForm(p => ({ ...p, password: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Department</Label>
                <Select value={addForm.department} onValueChange={v => setAddForm(p => ({ ...p, department: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Designation</Label>
                <Input placeholder="Software Engineer" value={addForm.designation} onChange={e => setAddForm(p => ({ ...p, designation: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Joining Date</Label>
                <input type="date" value={addForm.joiningDate} onChange={e => setAddForm(p => ({ ...p, joiningDate: e.target.value }))} className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <Label>Employment Type</Label>
                <Select value={addForm.employmentType} onValueChange={v => setAddForm(p => ({ ...p, employmentType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Intern">Intern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleAddEmployee} loading={isAdding}
              disabled={!addForm.employeeId || !addForm.email || !addForm.firstName || !addForm.lastName}>
              Add Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Deactivate Employee?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">This will deactivate the employee account. They will no longer be able to login.</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" loading={isDeleting} onClick={() => deleteId && handleDeactivate(deleteId)}>
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
