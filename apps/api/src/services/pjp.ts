import axios from 'axios'
import { config } from '../config.js'

const xendit = axios.create({
  baseURL: 'https://api.xendit.co',
  headers: {
    'Authorization': `Basic ${Buffer.from(`${config.XENDIT_SECRET_KEY}:`).toString('base64')}`,
    'Content-Type': 'application/json',
  },
})

const flip = axios.create({
  baseURL: 'https://bigflip.id/big_sandbox_api/v2',
  headers: {
    'Authorization': `Basic ${Buffer.from(`${config.FLIP_API_KEY}:`).toString('base64')}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  },
})

export interface DisbursementResult {
  id: string
  status: string
  partner: 'xendit' | 'flip'
  receipt?: string
}

export async function disbursementToQRIS(params: {
  nmid: string
  amountIdr: number
  reference: string
}): Promise<DisbursementResult> {
  if (config.XENDIT_SECRET_KEY) {
    try {
      const result = await xenditQRIS(params)
      return { ...result, partner: 'xendit' }
    } catch (err) {
      console.warn('Xendit QRIS disbursement failed, trying Flip:', err)
    }
  }

  if (config.FLIP_API_KEY) {
    try {
      const result = await flipDisbursement(params)
      return { ...result, partner: 'flip' }
    } catch (err) {
      console.error('Flip disbursement also failed:', err)
      throw new Error(`All PJP partners failed for QRIS disbursement`)
    }
  }

  throw new Error('No PJP partner configured')
}

export async function disbursementToBank(params: {
  bankCode: string
  accountNumber: string
  amountIdr: number
  reference: string
}): Promise<DisbursementResult> {
  if (config.XENDIT_SECRET_KEY) {
    try {
      const result = await xenditBank(params)
      return { ...result, partner: 'xendit' }
    } catch (err) {
      console.warn('Xendit bank disbursement failed, trying Flip:', err)
    }
  }

  if (config.FLIP_API_KEY) {
    try {
      const result = await flipBankDisbursement(params)
      return { ...result, partner: 'flip' }
    } catch (err) {
      console.error('Flip bank disbursement also failed:', err)
      throw new Error(`All PJP partners failed for bank disbursement`)
    }
  }

  throw new Error('No PJP partner configured')
}

export async function getDisbursementStatus(
  partner: 'xendit' | 'flip',
  txId: string
): Promise<{ status: string }> {
  if (partner === 'xendit') {
    const { data } = await xendit.get(`/disbursements/${txId}`)
    return { status: data.status }
  }

  if (partner === 'flip') {
    const { data } = await flip.get('/disbursement', { params: { id: txId } })
    return { status: data.status }
  }

  throw new Error('Unknown PJP partner')
}

async function xenditQRIS(params: {
  nmid: string
  amountIdr: number
  reference: string
}) {
  const { data } = await xendit.post('/ewallets/charges', {
    reference_id: params.reference,
    currency: 'IDR',
    amount: params.amountIdr,
    checkout_method: 'ONE_TIME_PAYMENT',
    channel_code: 'ID_QRIS',
    channel_properties: {
      qr_code: { nmid: params.nmid },
    },
  })
  return { id: data.id, status: data.status }
}

async function xenditBank(params: {
  bankCode: string
  accountNumber: string
  amountIdr: number
  reference: string
}) {
  const { data } = await xendit.post('/disbursements', {
    external_id: params.reference,
    bank_code: params.bankCode,
    account_number: params.accountNumber,
    amount: params.amountIdr,
    description: 'Remittance from SAMBUNG',
  })
  return { id: data.id, status: data.status }
}

async function flipDisbursement(params: {
  nmid: string
  amountIdr: number
  reference: string
}) {
  const payload = new URLSearchParams({
    idempotency_key: params.reference,
    account_number: params.nmid,
    amount: params.amountIdr.toString(),
    remark: `SAMBUNG-${params.reference.substring(0, 20)}`,
    recipient_city: '391',
  }).toString()

  const { data } = await flip.post('/disbursement', payload)
  return { id: data.id, status: data.status }
}

async function flipBankDisbursement(params: {
  bankCode: string
  accountNumber: string
  amountIdr: number
  reference: string
}) {
  const payload = new URLSearchParams({
    idempotency_key: params.reference,
    bank_code: params.bankCode,
    account_number: params.accountNumber,
    amount: params.amountIdr.toString(),
    remark: `SAMBUNG-${params.reference.substring(0, 20)}`,
    recipient_city: '391',
  }).toString()

  const { data } = await flip.post('/disbursement', payload)
  return { id: data.id, status: data.status }
}
