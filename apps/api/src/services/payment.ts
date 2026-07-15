import { prisma } from '@sambung/database'
import { FEE_BPS } from '@sambung/sdk'
import { getLiveRate } from './stellar.js'
import { queue } from '../jobs/queue.js'

export interface PaymentParams {
  userId: string
  amountIdr: number
  recipientNmid: string
  recipientProvider: string
  recipientPhone?: string
  senderStellarAddress: string
}

export async function getQuote(amountIdr: number) {
  const rate = await getLiveRate()

  const usdcRequired = amountIdr / rate.ask
  const feeAnchor = Math.floor(amountIdr * FEE_BPS.ANCHOR / 10000)
  const feePjp = Math.floor(amountIdr * FEE_BPS.PJP / 10000)
  const feePlatform = Math.floor(amountIdr * FEE_BPS.PLATFORM / 10000)
  const totalFee = feeAnchor + feePjp + feePlatform

  return {
    rateUsdcIdr: rate.ask,
    usdcRequired: usdcRequired.toFixed(7),
    feeAnchor,
    feePjp,
    feePlatform,
    totalFeeIdr: totalFee,
    recipientReceives: amountIdr - totalFee,
    validUntil: new Date(Date.now() + 30_000).toISOString(),
  }
}

export async function createPayment(params: PaymentParams) {
  const { prisma } = await import('@sambung/database')
  const rate = await getLiveRate()

  const usdcAmount = params.amountIdr / rate.ask
  const totalFee = Math.floor(params.amountIdr * (FEE_BPS.ANCHOR + FEE_BPS.PJP + FEE_BPS.PLATFORM) / 10000)

  const remittance = await prisma.remittance.create({
    data: {
      userId: params.userId,
      recipientNmid: params.recipientNmid,
      recipientProvider: params.recipientProvider,
      recipientPhone: params.recipientPhone,
      amountUsdc: usdcAmount,
      amountIdr: params.amountIdr,
      feeUsdc: totalFee / rate.ask,
      feeIdr: totalFee,
      rateAtTx: rate.ask,
      status: 'initiated',
    },
  })

  await queue.add('process-remittance', {
    remittanceId: remittance.id,
    usdcAmount: usdcAmount.toFixed(7),
    amountIdr: params.amountIdr - totalFee,
  })

  return {
    paymentId: remittance.id,
    status: 'initiated',
    amountUsdc: usdcAmount.toFixed(7),
    rate: rate.ask,
    fees: {
      anchor: Math.floor(params.amountIdr * FEE_BPS.ANCHOR / 10000),
      pjp: Math.floor(params.amountIdr * FEE_BPS.PJP / 10000),
      platform: Math.floor(params.amountIdr * FEE_BPS.PLATFORM / 10000),
    },
    recipientReceives: params.amountIdr - totalFee,
  }
}
