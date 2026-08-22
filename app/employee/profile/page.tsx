'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Camera, Mail, Phone, MapPin, Building2, Briefcase, Calendar, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TopBar } from '@/components/shared/TopBar'
import { toast } from '@/components/ui/toaster'
import { formatDate, formatCurrency, getInitials } from '@/lib/utils'

interface ProfileData {
  id: string
  employeeId: string
  email: string
  role: string
  profile: {
    firstName: string
    lastName: string
    phone: string | null
    address: string | null
    city: string | null
    state: string | null
    country: string | null
    department: string | null
    designation: string | null
    joiningDate: string | null
    employmentType: string | null
    profilePicture: string | null
    gender: string | null
    dateOfBirth: string | null
  } | null
  salary: {
    basicSalary: number
    hra: number
    allowances: number
    deductions: number
    bonuses: number
    grossSalary: number
    netSalary: number
  } | null
}

export default function EmployeeProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [editData, setEditData] = useState({ phone: '', address: '', city: '', state: '', country: '', profilePicture: '' })
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => {
        setProfile(data)
        setEditData({
          phone: data.profile?.phone ?? '',
          address: data.profile?.address ?? '',
          city: data.profile?.city ?? '',
          state: data.profile?.state ?? '',
          country: data.profile?.country ?? '',
          profilePicture: data.profile?.profilePicture ?? '',
        })
      })
      .catch(() => toast({ title: 'Error', description: 'Failed to load profile', variant: 'destructive' }))
      .finally(() => setIsLoading(false))
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
        return
      }
      setProfile(prev => prev ? { ...prev, profile: { ...prev.profile, ...editData } as any } : null)
      setIsEditing(false)
      toast({ title: 'Profile Updated', description: 'Your profile has been saved.', variant: 'success' })
      router.refresh()
    } catch {
      toast({ title: 'Error', description: 'Failed to save', variant: 'destructive' })
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

  const p = profile?.profile
  const fullName = p ? `${p.firstName} ${p.lastName}` : 'Unknown'
  const initials = p ? getInitials(p.firstName, p.lastName) : '?'

  return (
    <div className="space-y-6 page-enter">
      <TopBar userName={fullName} role={profile?.role ?? 'EMPLOYEE'} />

      {/* Profile Header Card */}
      <Card className="border-0 shadow-sm overflow-hidden rounded-3xl">
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl shadow-xl flex items-center justify-center text-white text-3xl font-bold overflow-hidden bg-gradient-to-br from-orange-400 via-red-500 to-purple-600">
                  {p?.profilePicture ? (
                    <img src={p.profilePicture} alt={fullName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center">
                      {initials}
                    </span>
                  )}
                </div>
                {/* Photo Upload Overlay */}
                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
                    <Camera className="w-6 h-6" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            setEditData(prev => ({ ...prev, profilePicture: reader.result as string }))
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                    />
                  </label>
                )}
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">{fullName}</h1>
                <p className="text-indigo-100 text-base font-medium mt-1">{p?.designation ?? 'Employee'}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-white/80 bg-white/10 px-2.5 py-1 rounded-md">
                    <Building2 className="w-3.5 h-3.5" />
                    {p?.department ?? 'N/A'}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-white/80 bg-white/10 px-2.5 py-1 rounded-md">
                    <Lock className="w-3.5 h-3.5" />
                    {profile?.employeeId}
                  </span>
                  <span className="text-xs font-bold text-white bg-indigo-500/50 px-2.5 py-1 rounded-full border border-indigo-400/30">
                    {profile?.role}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white rounded-xl px-6">
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white rounded-xl">
                    Cancel
                  </Button>
                  <Button size="sm" loading={isSaving} onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 border-0 shadow-lg shadow-emerald-500/20">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-600" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-500">Employee ID</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Lock className="w-3 h-3 text-gray-400" />
                  <p className="text-sm font-medium text-gray-700">{profile?.employeeId}</p>
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Email</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Lock className="w-3 h-3 text-gray-400" />
                  <p className="text-sm font-medium text-gray-700 truncate">{profile?.email}</p>
                </div>
              </div>
            </div>

            {/* Editable fields */}
            <div>
              <Label htmlFor="phone">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Phone
                </span>
              </Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={editData.phone}
                  onChange={e => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                />
              ) : (
                <p className="text-sm text-gray-700 mt-1">{p?.phone ?? '—'}</p>
              )}
            </div>

            <div>
              <Label>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Address
                </span>
              </Label>
              {isEditing ? (
                <div className="space-y-2">
                  <Input placeholder="Address" value={editData.address} onChange={e => setEditData(prev => ({ ...prev, address: e.target.value }))} />
                  <div className="grid grid-cols-3 gap-2">
                    <Input placeholder="City" value={editData.city} onChange={e => setEditData(prev => ({ ...prev, city: e.target.value }))} />
                    <Input placeholder="State" value={editData.state} onChange={e => setEditData(prev => ({ ...prev, state: e.target.value }))} />
                    <Input placeholder="Country" value={editData.country} onChange={e => setEditData(prev => ({ ...prev, country: e.target.value }))} />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-700 mt-1">
                  {[p?.address, p?.city, p?.state, p?.country].filter(Boolean).join(', ') || '—'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Job Information */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              Job Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Department', value: p?.department, icon: Building2 },
              { label: 'Designation', value: p?.designation, icon: Briefcase },
              { label: 'Joining Date', value: p?.joiningDate ? formatDate(p.joiningDate) : null, icon: Calendar },
              { label: 'Employment Type', value: p?.employmentType, icon: Lock },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <item.icon className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-sm font-medium text-gray-900">{item.value ?? '—'}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Salary Information (Read-only) */}
        {profile?.salary && (
          <Card className="border-0 shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                💰 Salary Information
                <Badge variant="secondary" className="text-xs">Read Only</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: 'Basic Salary', value: profile.salary.basicSalary, highlight: false },
                  { label: 'HRA', value: profile.salary.hra, highlight: false },
                  { label: 'Allowances', value: profile.salary.allowances, highlight: false },
                  { label: 'Bonuses', value: profile.salary.bonuses, highlight: false },
                  { label: 'Deductions', value: profile.salary.deductions, highlight: false, negative: true },
                  { label: 'Net Salary', value: profile.salary.netSalary, highlight: true },
                ].map(item => (
                  <div key={item.label} className={`p-4 rounded-xl text-center ${item.highlight ? 'bg-indigo-50 border border-indigo-100' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                    <p className={`text-base font-bold ${item.highlight ? 'text-indigo-600' : item.negative ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatCurrency(item.value)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                <p className="text-sm text-emerald-700">
                  Your gross salary is <strong>{formatCurrency(profile.salary.grossSalary)}</strong>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
