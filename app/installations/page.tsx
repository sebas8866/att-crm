import { prisma } from '@/lib/prisma'
import { addDays, startOfMonth, endOfMonth } from 'date-fns'
import InstallationsPageClient from './page.client'

export const dynamic = 'force-dynamic'

async function getInstallations() {
  try {
    // Get ALL installations (not just this month)
    const allInstallations = await prisma.installation.findMany({
      include: {
        customer: true,
      },
      orderBy: {
        installDate: 'desc',
      },
    })

    const today = new Date()
    
    // Get upcoming installations (next 7 days)
    const upcomingInstallations = allInstallations.filter(i => {
      const installDate = new Date(i.installDate)
      return installDate >= today && installDate <= addDays(today, 7) && i.status === 'SCHEDULED'
    })

    // Get completed installations
    const completedWithoutCommission = allInstallations.filter(i => 
      i.status === 'COMPLETED'
    )

    // Serialize dates to strings for client component
    const serializedAll = allInstallations.map(i => ({
      ...i,
      installDate: i.installDate.toISOString(),
      createdAt: i.createdAt.toISOString(),
      updatedAt: i.updatedAt.toISOString(),
    }))

    const serializedUpcoming = upcomingInstallations.map(i => ({
      ...i,
      installDate: i.installDate.toISOString(),
      createdAt: i.createdAt.toISOString(),
      updatedAt: i.updatedAt.toISOString(),
    }))

    const serializedCompleted = completedWithoutCommission.map(i => ({
      ...i,
      installDate: i.installDate.toISOString(),
      createdAt: i.createdAt.toISOString(),
      updatedAt: i.updatedAt.toISOString(),
    }))

    return { 
      allInstallations: serializedAll, 
      upcomingInstallations: serializedUpcoming,
      completedWithoutCommission: serializedCompleted,
    }
  } catch (error) {
    console.error('Error fetching installations:', error)
    return { 
      allInstallations: [], 
      upcomingInstallations: [],
      completedWithoutCommission: [],
    }
  }
}

export default async function InstallationsPage() {
  const { allInstallations, upcomingInstallations, completedWithoutCommission } = await getInstallations()

  return (
    <InstallationsPageClient
      allInstallations={allInstallations}
      upcomingInstallations={upcomingInstallations}
      completedWithoutCommission={completedWithoutCommission}
    />
  )
}
