import type { FastifyInstance } from 'fastify'
import { prisma } from '@sambung/database'
import { createPayment, getQuote } from '../services/payment.js'

export async function sambungRoutes(app: FastifyInstance) {
  app.post('/remittance/quote', async (request, reply) => {
    const { amount_idr, currency } = request.body as { amount_idr: number; currency?: string }

    if (!amount_idr || amount_idr < 10000) {
      return reply.status(400).send({ error: 'Minimum remittance: Rp 10.000' })
    }

    const quote = await getQuote(amount_idr)
    return quote
  })

  app.post('/remittance/create', async (request, reply) => {
    const body = request.body as {
      amount_idr: number
      recipient_nmid: string
      recipient_provider: string
      recipient_phone?: string
      sender_stellar_address: string
    }

    if (!body.amount_idr || !body.recipient_nmid || !body.sender_stellar_address) {
      return reply.status(400).send({ error: 'Missing required fields' })
    }

    const result = await createPayment({
      userId: request.userId!,
      amountIdr: body.amount_idr,
      recipientNmid: body.recipient_nmid,
      recipientProvider: body.recipient_provider,
      recipientPhone: body.recipient_phone,
      senderStellarAddress: body.sender_stellar_address,
    })

    return result
  })

  app.get('/remittance/:id', async (request, reply) => {
    const { id } = request.params as { id: string }

    const remittance = await prisma.remittance.findUnique({
      where: { id },
      select: {
        id: true,
        amountUsdc: true,
        amountIdr: true,
        status: true,
        stellarTxHash: true,
        pjpTxId: true,
        createdAt: true,
        completedAt: true,
        failureReason: true,
      },
    })

    if (!remittance) {
      return reply.status(404).send({ error: 'Remittance not found' })
    }

    return remittance
  })

  app.get('/remittance/history', async (request) => {
    const page = Number((request.query as { page?: string }).page) || 1
    const limit = 20

    const [remittances, total] = await Promise.all([
      prisma.remittance.findMany({
        where: { userId: request.userId! },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
        select: {
          id: true,
          amountIdr: true,
          status: true,
          recipientNmid: true,
          createdAt: true,
          completedAt: true,
        },
      }),
      prisma.remittance.count({ where: { userId: request.userId! } }),
    ])

    return { data: remittances, total, page, totalPages: Math.ceil(total / limit) }
  })

  app.post('/remittance/:id/cancel', async (request, reply) => {
    const { id } = request.params as { id: string }

    const remittance = await prisma.remittance.findUnique({ where: { id } })

    if (!remittance) return reply.status(404).send({ error: 'Not found' })
    if (remittance.status !== 'initiated') {
      return reply.status(400).send({ error: 'Can only cancel initiated payments' })
    }

    await prisma.remittance.update({
      where: { id },
      data: { status: 'cancelled' },
    })

    return { status: 'cancelled' }
  })

  // Recipient management
  app.post('/recipients', async (request, reply) => {
    const body = request.body as {
      name: string
      nmid: string
      provider: string
      phone?: string
    }

    const recipient = await prisma.recipient.create({
      data: {
        userId: request.userId!,
        name: body.name,
        nmid: body.nmid,
        provider: body.provider,
        phone: body.phone,
      },
    })

    return recipient
  })

  app.get('/recipients', async (request) => {
    const recipients = await prisma.recipient.findMany({
      where: { userId: request.userId! },
      orderBy: { createdAt: 'desc' },
    })
    return { data: recipients }
  })

  app.put('/recipients/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = request.body as { name?: string; nmid?: string; phone?: string }

    const recipient = await prisma.recipient.updateMany({
      where: { id, userId: request.userId! },
      data: body,
    })

    if (recipient.count === 0) return reply.status(404).send({ error: 'Not found' })
    return { status: 'updated' }
  })

  app.delete('/recipients/:id', async (request, reply) => {
    const { id } = request.params as { id: string }

    const result = await prisma.recipient.deleteMany({
      where: { id, userId: request.userId! },
    })

    if (result.count === 0) return reply.status(404).send({ error: 'Not found' })
    return { status: 'deleted' }
  })
}
