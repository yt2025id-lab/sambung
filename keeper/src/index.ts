import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../..', '.env') })
import { Worker } from 'bullmq'
import IORedis from 'ioredis'
import { prisma } from '@sambung/database'
import { executePathPayment } from './path-payment.js'
import { checkAnchorStatus } from './anchor.js'
import { pino } from 'pino'

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' })
const connection = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
})

async function main() {
  logger.info('Starting SAMBUNG Keeper...')

  const remittanceWorker = new Worker('sambung', async (job) => {
    const { remittanceId } = job.data as { remittanceId: string }
    logger.info({ remittanceId }, 'Processing remittance')

    try {
      await prisma.remittance.update({
        where: { id: remittanceId },
        data: { status: 'swapping' },
      })

      const txHash = await executePathPayment(remittanceId)

      await prisma.remittance.update({
        where: { id: remittanceId },
        data: {
          status: 'waiting_anchor',
          stellarTxHash: txHash,
        },
      })

      logger.info({ remittanceId, txHash }, 'Path Payment executed')
    } catch (err) {
      logger.error({ remittanceId, err }, 'Remittance processing failed')
      await prisma.remittance.update({
        where: { id: remittanceId },
        data: {
          status: 'failed',
          failureReason: err instanceof Error ? err.message : 'Unknown error',
        },
      })
    }
  }, { connection, name: 'process-remittance' })

  const settlementWorker = new Worker('sambung', async (job) => {
    const { remittanceId } = job.data as { remittanceId: string }
    await checkAnchorStatus(remittanceId)
  }, { connection, name: 'check-settlement' })

  logger.info('Keeper workers started')
}

main().catch((err) => {
  logger.fatal(err)
  process.exit(1)
})
