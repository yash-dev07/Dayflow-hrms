'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { Printer, ArrowLeft, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toaster'
import { formatCurrency } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function SalarySlipPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [record, setRecord] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadRecord = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/payroll/records/${id}`)
      const data = await res.json()
      if (res.ok) setRecord(data.record)
    } catch {
      toast({ title: 'Error', description: 'Failed to load slip', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => { loadRecord() }, [loadRecord])

  if (isLoading) return <div className="p-8 page-enter"><div className="skeleton h-full min-h-[600px] max-w-3xl mx-auto rounded-xl" /></div>
  if (!record) return <div className="p-8 text-center text-gray-500">Salary slip not found</div>

  const profile = record.employee.profile
  const period = record.payrollPeriod

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Actions (Hidden when printing) */}
        <div className="flex justify-between items-center print:hidden">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex gap-2">
            <Button onClick={() => window.print()} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
              <Printer className="w-4 h-4" /> Print Slip
            </Button>
          </div>
        </div>

        {/* Salary Slip Content */}
        <div className="bg-white p-8 sm:p-12 border shadow-sm print:shadow-none print:border-none mx-auto print:p-0 print:m-0" id="salary-slip">
          
          <div className="mb-4 text-center">
            <h1 className="text-3xl font-bold text-blue-600 flex items-center justify-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded text-white flex items-center justify-center">D</div>
              Dayflow HRMS
            </h1>
          </div>

          <table className="w-full border-collapse border border-black text-sm">
            <tbody>
              <tr>
                <td colSpan={4} className="bg-[#9bbde3] border border-black text-center font-bold text-lg py-2">
                  Company Name: Dayflow HRMS
                </td>
              </tr>
              <tr>
                <td colSpan={4} className="bg-gray-200 border border-black text-center font-bold py-1">
                  Salary Slip
                </td>
              </tr>
              <tr>
                <td className="border border-black font-semibold px-2 py-1.5 w-1/4">Employee Name :</td>
                <td colSpan={3} className="border border-black px-2 py-1.5">{profile?.firstName} {profile?.lastName}</td>
              </tr>
              <tr>
                <td className="border border-black font-semibold px-2 py-1.5">Designation :</td>
                <td colSpan={3} className="border border-black px-2 py-1.5">{profile?.designation || '-'}</td>
              </tr>
              <tr>
                <td className="border border-black font-semibold px-2 py-1.5">Department :</td>
                <td colSpan={3} className="border border-black px-2 py-1.5">{profile?.department || '-'}</td>
              </tr>
              <tr>
                <td className="border border-black font-semibold px-2 py-1.5">Month :</td>
                <td colSpan={3} className="border border-black px-2 py-1.5">{MONTHS[period.month - 1]} {period.year}</td>
              </tr>
              <tr className="bg-gray-200 text-center font-bold">
                <td colSpan={2} className="border border-black py-1.5">Earnings</td>
                <td colSpan={2} className="border border-black py-1.5">Deductions</td>
              </tr>
              <tr className="font-bold text-center">
                <td className="border border-black py-1.5 w-1/4">Salary head</td>
                <td className="border border-black py-1.5 w-1/4">Amount</td>
                <td className="border border-black py-1.5 w-1/4">Salary Head</td>
                <td className="border border-black py-1.5 w-1/4">Amount</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1.5">Basic</td>
                <td className="border border-black px-2 py-1.5 text-right">{formatCurrency(record.basicSalary)}</td>
                <td className="border border-black px-2 py-1.5">Unpaid Leave Deduction</td>
                <td className="border border-black px-2 py-1.5 text-right">{formatCurrency(record.leaveDeduction)}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1.5">H R A</td>
                <td className="border border-black px-2 py-1.5 text-right">{formatCurrency(record.hra)}</td>
                <td className="border border-black px-2 py-1.5">Other Deductions</td>
                <td className="border border-black px-2 py-1.5 text-right">{formatCurrency(record.otherDeductions)}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1.5">Allowances</td>
                <td className="border border-black px-2 py-1.5 text-right">{formatCurrency(record.allowances)}</td>
                <td className="border border-black px-2 py-1.5"></td>
                <td className="border border-black px-2 py-1.5 text-right"></td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1.5">Bonus</td>
                <td className="border border-black px-2 py-1.5 text-right">{formatCurrency(record.bonus)}</td>
                <td className="border border-black px-2 py-1.5"></td>
                <td className="border border-black px-2 py-1.5 text-right"></td>
              </tr>
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="border border-black px-2 py-3"></td>
                  <td className="border border-black px-2 py-3 text-right"></td>
                  <td className="border border-black px-2 py-3"></td>
                  <td className="border border-black px-2 py-3 text-right"></td>
                </tr>
              ))}
              <tr className="font-bold bg-gray-100">
                <td className="border border-black px-2 py-2">SALARY (GROSS) / PM</td>
                <td className="border border-black px-2 py-2 text-right">{formatCurrency(record.grossSalary)}</td>
                <td className="border border-black px-2 py-2">Total Deduction</td>
                <td className="border border-black px-2 py-2 text-right">{formatCurrency(record.totalDeductions)}</td>
              </tr>
              <tr className="font-bold bg-blue-50">
                <td className="border border-black px-2 py-2 text-blue-900">NET SALARY PAYABLE</td>
                <td className="border border-black px-2 py-2 text-right text-blue-900">{formatCurrency(record.netSalary)}</td>
                <td className="border border-black px-2 py-2"></td>
                <td className="border border-black px-2 py-2 text-right"></td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-between mt-24 text-sm font-medium">
            <div className="border-t border-gray-400 w-48 text-center pt-2">Prepared by</div>
            <div className="border-t border-gray-400 w-48 text-center pt-2">Checked by</div>
            <div className="border-t border-gray-400 w-48 text-center pt-2">Authorized by</div>
          </div>

        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #salary-slip, #salary-slip * {
            visibility: visible;
          }
          #salary-slip {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
