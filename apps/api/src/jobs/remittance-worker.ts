import { prisma } from '@sambung/database'
import { createWorker } from './queue.js'
import { submitPathPayment, USDC, IDRT } from '../services/stellar.js'
import { config } from '../config.js'
import { disbursementToQRIS } from '../services/pjp.js'

export function startRemittanceWorker() {
  createWorker('process-remittance', async (job) => {
    const { remittanceId } = job.data as { remittanceId: string }
    const remittance = await prisma.remittance.findUniqueOrThrow({ where: { id: remittanceId } })

    await prisma.remittance.update({
      where: { id: remittanceId },
      data: { status: 'swapping' },
    })

    try {
      if (!config.SAMBUNG_TREASURY_SECRET) {
        throw new Error('SAMBUNG_TREASURY_SECRET not configured')
      }

      const txHash = await submitPathPayment({
        sourceSecret: config.SAMBUNG_TREASURY_SECRET,
        sendAsset: USDC,
        sendAmount: remittance.amountUsdc.toString(),
        destAsset: IDRT,
        destAmount: remittance.amountIdr.toString(),
        destMin: Math.floor(Number(remittance.amountIdr) * 0.99).toString(),
        destination: config.ANCHOR_IDRT_ISSUER,
        paymentId: remittanceId,
      })

      await prisma.remittance.update({
        where: { id: remittanceId },
        data: {
          status: 'waiting_anchor',
          stellarTxHash: txHash,
        },
      })

      const pjpResult = await disbursementToQRIS({
        nmid: remittance.recipientNmid,
        amountIdr: Number(remittance.amountIdr),
        reference: remittanceId,
      })

      await prisma.remittance.update({
        where: { id: remittanceId },
        data: {
          status: 'settled',
          pjpTxId: pjpResult.id,
          pjpPartnerId: pjpResult.partner,
          completedAt: new Date(),
        },
      })
    } catch (err) {
      await prisma.remittance.update({
        where: { id: remittanceId },
        data: {
          status: 'failed',
          failureReason: err instanceof Error ? err.message : 'Unknown error',
        },
      })
    }
  })
}
