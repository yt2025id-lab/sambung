export const FEE_BPS = {
  ANCHOR: 50,
  PJP: 30,
  PLATFORM: 20,
} as const

export const TOTAL_FEE_BPS = FEE_BPS.ANCHOR + FEE_BPS.PJP + FEE_BPS.PLATFORM

export const E_WALLET_PROVIDERS = ['GoPay', 'OVO', 'DANA', 'LinkAja'] as const

export const STELLAR = {
  TESTNET: {
    HORIZON: 'https://horizon-testnet.stellar.org',
    RPC: 'https://soroban-testnet.stellar.org',
    PASSPHRASE: 'Test SDF Network ; September 2015',
    USDC_ISSUER: 'GBV4G7AY6OZYYL3Z2S2VYMYZ5Y7V4G7H7V4G7H7V4G7H7V4G7H7V4G7H7',
  },
  MAINNET: {
    HORIZON: 'https://horizon.stellar.org',
    RPC: 'https://soroban.stellar.org',
    PASSPHRASE: 'Public Global Stellar Network ; September 2015',
    USDC_ISSUER: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
  },
} as const

export const IDRT_ISSUER = 'GDPKQ2TSNJOFSEE7XSUXPWRP27H6GFGLWD7JCHNEYYWQVGFA543EVBVT'

export const SETTLEMENT_TIMEOUT_MS = 5 * 60 * 1000 // 5 menit
export const ESCROW_TIMELOCK_SECONDS = 3600 // 1 jam
