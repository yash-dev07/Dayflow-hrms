'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TopBar } from '@/components/shared/TopBar'

export default function EmployeeSettingsPage() {
  return (
    <div className="space-y-6 page-enter">
      <TopBar userName="Employee" role="EMPLOYEE" />
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your account settings</p>
      </div>
      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle>Account Settings</CardTitle></CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">Settings configuration coming soon.</p>
        </CardContent>
      </Card>
    </div>
  )
}
