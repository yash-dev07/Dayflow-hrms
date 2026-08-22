'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Save, Building2, Briefcase, Mail, Phone, MapPin, Calendar, Lock } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TopBar } from '@/components/shared/TopBar'
import { toast } from '@/components/ui/toaster'
import { formatDate, getInitials } from '@/lib/utils'

const DEPARTMENTS = ['Engineering', 'Human Resources', 'Finance', 'Marketing', 'Sales', 'Operations']

interface EmployeeDetail {
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
    employmentType: string | null
    phone: string | null
    address: string | null
    city: string | null
    state: string | null
    country: string | null
    gender: string | null
  } | null
}

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [employee, setEmployee] = useState<EmployeeDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [editForm, setEditForm] = useState<any>({})

  useEffect(() => {
    fetch(`/api/employees/${resolvedParams.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setEmployee(data.employee)
        setEditForm({
          firstName: data.employee.profile?.firstName ?? '',
          lastName: data.employee.profile?.lastName ?? '',
          department: data.employee.profile?.department ?? '',
          designation: data.employee.profile?.designation ?? '',
          joiningDate: data.employee.profile?.joiningDate ? new Date(data.employee.profile.joiningDate).toISOString().split('T')[0] : '',
          employmentType: data.employee.profile?.employmentType ?? '',
          phone: data.employee.profile?.phone ?? '',
          role: data.employee.role ?? 'EMPLOYEE',
        })
      })
      .catch(() => {
        toast({ title: 'Error', description: 'Failed to load employee details', variant: 'destructive' })
        router.push('/admin/employees')
      })
      .finally(() => setIsLoading(false))
  }, [resolvedParams.id, router])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/employees/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      const data = await res.json()
      if (!res.ok) { toast({ title: 'Error', description: data.error, variant: 'destructive' }); return }
      
      toast({ title: 'Success', description: 'Employee updated successfully', variant: 'success' })
      setIsEditing(false)
      
      // Reload
      const freshRes = await fetch(`/api/employees/${resolvedParams.id}`)
      const freshData = await freshRes.json()
      setEmployee(freshData.employee)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-16 rounded-xl" />
        <div className="skeleton h-64 rounded-xl" />
      </div>
    )
  }

  if (!employee) return null

  const p = employee.profile
  const fullName = p ? `${p.firstName} ${p.lastName}` : employee.email
  const initials = p ? getInitials(p.firstName, p.lastName) : '?'

  return (
    <div className="space-y-6 page-enter">
      <TopBar userName="Admin" role="ADMIN" />

      <div className="flex items-center gap-4">
        <Link href="/admin/employees">
          <Button variant="outline" size="icon"><ChevronLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Details</h1>
          <p className="text-gray-500 text-sm">{employee.employeeId}</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-900" />
        <CardContent className="p-6 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center bg-indigo-600 text-white text-xl font-bold">
                <span className="text-2xl font-bold bg-indigo-600 text-white rounded-2xl w-full h-full flex items-center justify-center">
                  {initials}
                </span>
              </div>
              <div className="mb-1">
                <h1 className="text-xl font-bold text-gray-900">{fullName}</h1>
                <p className="text-gray-500 text-sm">{p?.designation ?? 'Employee'} · {p?.department ?? 'N/A'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant={employee.isActive ? 'success' : 'secondary'}>
                {employee.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <Badge variant={employee.role === 'ADMIN' ? 'destructive' : employee.role === 'HR' ? 'default' : 'secondary'}>
                {employee.role}
              </Badge>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Edit Details</Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button size="sm" loading={isSaving} onClick={handleSave}>
                    <Save className="w-4 h-4" /> Save
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Details */}
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="flex items-center gap-2"><Mail className="w-4 h-4 text-indigo-600"/> Personal & Contact</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                {isEditing ? <Input value={editForm.firstName} onChange={e => setEditForm((p:any) => ({...p, firstName: e.target.value}))} /> : <p className="text-sm font-medium mt-1">{p?.firstName}</p>}
              </div>
              <div>
                <Label>Last Name</Label>
                {isEditing ? <Input value={editForm.lastName} onChange={e => setEditForm((p:any) => ({...p, lastName: e.target.value}))} /> : <p className="text-sm font-medium mt-1">{p?.lastName}</p>}
              </div>
            </div>
            <div>
              <Label>Email <span className="text-xs text-gray-400 font-normal">(Read Only)</span></Label>
              <p className="text-sm font-medium mt-1 text-gray-700 flex items-center gap-2"><Lock className="w-3 h-3 text-gray-400"/> {employee.email}</p>
            </div>
            <div>
              <Label>Phone</Label>
              {isEditing ? <Input value={editForm.phone} onChange={e => setEditForm((p:any) => ({...p, phone: e.target.value}))} /> : <p className="text-sm font-medium mt-1">{p?.phone || '—'}</p>}
            </div>
            {!isEditing && (
              <div>
                <Label>Location</Label>
                <p className="text-sm text-gray-700 mt-1">
                  {[p?.city, p?.state, p?.country].filter(Boolean).join(', ') || '—'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Job Details */}
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-indigo-600"/> Employment Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Department</Label>
                {isEditing ? (
                  <Select value={editForm.department} onValueChange={v => setEditForm((p:any) => ({...p, department: v}))}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : <p className="text-sm font-medium mt-1">{p?.department || '—'}</p>}
              </div>
              <div>
                <Label>Designation</Label>
                {isEditing ? <Input value={editForm.designation} onChange={e => setEditForm((p:any) => ({...p, designation: e.target.value}))} /> : <p className="text-sm font-medium mt-1">{p?.designation || '—'}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Employment Type</Label>
                {isEditing ? (
                  <Select value={editForm.employmentType} onValueChange={v => setEditForm((p:any) => ({...p, employmentType: v}))}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                ) : <p className="text-sm font-medium mt-1">{p?.employmentType || '—'}</p>}
              </div>
              <div>
                <Label>Role Access</Label>
                {isEditing ? (
                  <Select value={editForm.role} onValueChange={v => setEditForm((p:any) => ({...p, role: v}))}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMPLOYEE">Employee</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                ) : <p className="text-sm font-medium mt-1">{employee.role}</p>}
              </div>
            </div>
            <div>
              <Label>Joining Date</Label>
              {isEditing ? (
                <input type="date" value={editForm.joiningDate} onChange={e => setEditForm((p:any) => ({...p, joiningDate: e.target.value}))} className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              ) : <p className="text-sm font-medium mt-1">{p?.joiningDate ? formatDate(p.joiningDate) : '—'}</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
