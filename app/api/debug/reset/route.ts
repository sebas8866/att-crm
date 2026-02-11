import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Find and delete any users with the admin email
    const adminUsers = await prisma.user.findMany({
      where: {
        email: {
          equals: 'info@myhomepromotions.com',
          mode: 'insensitive'
        }
      }
    })

    // Delete them
    for (const user of adminUsers) {
      await prisma.user.delete({
        where: { id: user.id }
      })
    }

    return Response.json({ 
      success: true,
      message: 'Auth system reset complete',
      deletedUsers: adminUsers.length,
      deleted: adminUsers.map(u => ({ id: u.id, email: u.email, name: u.name }))
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    return Response.json({ 
      error: String(error) 
    }, { status: 500 })
  }
}
