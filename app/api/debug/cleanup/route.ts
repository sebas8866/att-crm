import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Find any users with the admin email
    const adminUsers = await prisma.user.findMany({
      where: {
        email: {
          in: ['info@myhomepromotions.com', 'info@myhomepromotions.com'.toLowerCase()]
        }
      }
    })

    // Delete conflicting admin users (keep the env-based auth)
    for (const user of adminUsers) {
      await prisma.user.delete({
        where: { id: user.id }
      })
    }

    return Response.json({ 
      message: 'Cleaned up conflicting users',
      deleted: adminUsers.length,
      users: adminUsers.map(u => ({ id: u.id, email: u.email, name: u.name }))
    })
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 })
  }
}
