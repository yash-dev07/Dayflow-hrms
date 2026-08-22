'use client'

import { FileText, Upload } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { TopBar } from '@/components/shared/TopBar'

export default function DocumentsPage() {
  return (
    <div className="space-y-6 page-enter">
      <TopBar userName="Employee" role="EMPLOYEE" />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <p className="text-gray-500 text-sm">Your HR documents and files</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-gray-700 font-semibold mb-2">No documents yet</h3>
          <p className="text-gray-400 text-sm">Your HR documents will appear here once uploaded</p>
        </CardContent>
      </Card>
    </div>
  )
}
