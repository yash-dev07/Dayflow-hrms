import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/shared/Sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()
  
  if (!session) redirect('/login')
  if (!['ADMIN', 'HR'].includes(session.role)) redirect('/employee/dashboard')

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { profile: true }
  })

  if (!user) redirect('/login')

  const userName = user.profile
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : user.email

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <Sidebar 
        role={user.role as 'ADMIN' | 'HR'} 
        userName={userName} 
        employeeId={user.employeeId} 
        profilePicture={user.profile?.profilePicture ?? undefined}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 lg:py-6">
          {children}
        </div>
      </main>
    </div>
  )
}
