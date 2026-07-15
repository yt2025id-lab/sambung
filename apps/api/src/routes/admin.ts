import type { FastifyInstance } from 'fastify'
import { prisma } from '@sambung/database'

export async function adminRoutes(app: FastifyInstance) {
  app.get('/dashboard', async () => {
    const [totalTx, settledTx, totalVolume, failedTx] = await Promise.all([
      prisma.remittance.count(),
      prisma.remittance.count({ where: { status: 'settled' } }),
      prisma.remittance.aggregate({ _sum: { amountIdr: true }, where: { status: 'settled' } }),
      prisma.remittance.count({ where: { status: 'failed' } }),
    ])

    return {
      totalTransactions: totalTx,
      settledTransactions: settledTx,
      failedTransactions: failedTx,
      totalVolumeIdr: totalVolume._sum.amountIdr ?? 0,
    }
  })

  app.get('/transactions', async (request) => {
    const page = Number((request.query as { page?: string }).page) || 1
    const limit = 50

    const [data, total] = await Promise.all([
      prisma.remittance.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
        include: { user: { select: { email: true, fullName: true } } },
      }),
      prisma.remittance.count(),
    ])

    return { data, total, page, totalPages: Math.ceil(total / limit) }
  })

  app.post('/transactions/:id/refund', async (request, reply) => {
    const { id } = request.params as { id: string }

    const tx = await prisma.remittance.findUnique({ where: { id } })
    if (!tx) return reply.status(404).send({ error: 'Not found' })

    await prisma.remittance.update({
      where: { id },
      data: { status: 'refunded' },
    })

    return { status: 'refunded' }
  })
}
