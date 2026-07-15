import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '@sambung/database'
import { config } from '../config.js'

function verifyXenditWebhook(request: FastifyRequest): boolean {
  const token = request.headers['x-callback-token']
  return token === config.XENDIT_WEBHOOK_TOKEN
}

function verifyFlipWebhook(request: FastifyRequest): boolean {
  const token = request.headers['x-flip-signature']
  return token === config.FLIP_WEBHOOK_SECRET
}

async function verifyWebhook(
  request: FastifyRequest,
  reply: FastifyReply,
  partner: 'xendit' | 'flip'
): Promise<boolean> {
  if (partner === 'xendit' && config.XENDIT_WEBHOOK_TOKEN) {
    if (!verifyXenditWebhook(request)) {
      reply.status(401).send({ error: 'Invalid webhook signature' })
      return false
    }
  }

  if (partner === 'flip' && config.FLIP_WEBHOOK_SECRET) {
    if (!verifyFlipWebhook(request)) {
      reply.status(401).send({ error: 'Invalid webhook signature' })
      return false
    }
  }

  return true
}

export async function webhookRoutes(app: FastifyInstance) {
  app.post('/pjp/settlement', async (request, reply) => {
    if (!(await verifyWebhook(request, reply, 'xendit'))) return

    const body = request.body as {
      payment_id: string
      pjp_tx_id: string
      status: 'success' | 'failed'
    }

    if (body.status === 'success') {
      await prisma.remittance.update({
        where: { id: body.payment_id },
        data: {
          status: 'settled',
          pjpTxId: body.pjp_tx_id,
          pjpPartnerId: 'xendit',
          completedAt: new Date(),
        },
      })
    } else {
      await prisma.remittance.update({
        where: { id: body.payment_id },
        data: {
          status: 'failed',
          failureReason: 'PJP settlement failed',
        },
      })
    }

    return { received: true }
  })

  app.post('/pjp/failed', async (request, reply) => {
    if (!(await verifyWebhook(request, reply, 'xendit'))) return

    const body = request.body as {
      payment_id: string
      reason: string
    }

    await prisma.remittance.update({
      where: { id: body.payment_id },
      data: {
        status: 'failed',
        failureReason: body.reason,
      },
    })

    return { received: true }
  })

  app.post('/flip/settlement', async (request, reply) => {
    if (!(await verifyWebhook(request, reply, 'flip'))) return

    const body = request.body as {
      idempotency_key: string
      status: string
      receipt: string
    }

    if (body.status === 'DONE') {
      await prisma.remittance.update({
        where: { id: body.idempotency_key },
        data: {
          status: 'settled',
          pjpTxId: body.receipt,
          pjpPartnerId: 'flip',
          completedAt: new Date(),
        },
      })
    } else if (body.status === 'FAILED') {
      await prisma.remittance.update({
        where: { id: body.idempotency_key },
        data: {
          status: 'failed',
          failureReason: 'Flip disbursement failed',
        },
      })
    }

    return { received: true }
  })

  app.post('/anchor/swap', async (request) => {
    const body = request.body as {
      payment_id: string
      tx_hash: string
      amount_idr: number
    }

    await prisma.remittance.update({
      where: { id: body.payment_id },
      data: {
        status: 'waiting_anchor',
        stellarTxHash: body.tx_hash,
        anchorTxHash: body.tx_hash,
      },
    })

    return { received: true }
  })
}
