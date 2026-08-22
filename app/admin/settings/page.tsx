'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TopBar } from '@/components/shared/TopBar'

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 page-enter">
      <TopBar userName="Admin" role="ADMIN" />
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm">System and company configuration</p>
      </div>
      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle>Company Settings</CardTitle></CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">Settings configuration coming soon.</p>
        </CardContent>
      </Card>
    </div>
  )
}
