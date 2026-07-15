import type { FastifyInstance } from 'fastify'
import { prisma } from '@sambung/database'

export async function publicRoutes(app: FastifyInstance) {
  app.get('/rates/usdc-idr', async () => {
    const rate = await prisma.rateCache.findUnique({
      where: { baseAsset_quoteAsset: { baseAsset: 'USDC', quoteAsset: 'IDRT' } },
    })

    return {
      base: 'USDC',
      quote: 'IDRT',
      bid: rate?.bid ?? 15350,
      ask: rate?.ask ?? 15380,
      source: rate?.source ?? 'soroswap',
      updatedAt: rate?.cachedAt ?? new Date(),
    }
  })

  app.post('/qris/resolve', async (request, reply) => {
    const { qris_string } = request.body as { qris_string: string }

    try {
      const { parseQRIS } = await import('@sambung/sdk')
      const result = parseQRIS(qris_string)
      return result
    } catch (err) {
      return reply.status(400).send({
        error: 'Failed to parse QRIS',
        detail: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  })
}
