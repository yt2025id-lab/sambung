export type RemittanceStatus =
  | 'initiated'
  | 'swapping'
  | 'waiting_anchor'
  | 'settled'
  | 'failed'
  | 'cancelled'
  | 'refunded'

export type EWalletProvider = 'GoPay' | 'OVO' | 'DANA' | 'LinkAja'

export type PjpPartner = 'XENDIT' | 'FLIP' | 'MIDTRANS'

export interface QRISData {
  nmid: string
  merchantName?: string
  merchantCity?: string
  merchantCategory?: string
  amount?: number
  currency: string
  crc: string
}

export interface RemittanceQuote {
  rateUsdcIdr: number
  usdcRequired: string
  feeAnchor: number
  feePjp: number
  feePlatform: number
  totalFeeIdr: number
  recipientReceives: number
  validUntil: string
}

export interface CreateRemittanceRequest {
  amountIdr: number
  recipientNmid: string
  recipientProvider: string
  recipientPhone?: string
  senderStellarAddress: string
}

export interface CreateRemittanceResponse {
  paymentId: string
  status: RemittanceStatus
  amountUsdc: string
  rate: number
  fees: {
    anchor: number
    pjp: number
    platform: number
  }
  recipientReceives: number
}
