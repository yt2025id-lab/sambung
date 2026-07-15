import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../..', '.env') })

export const config = {
  STELLAR_NETWORK: process.env.STELLAR_NETWORK ?? 'testnet',
  STELLAR_HORIZON_URL: process.env.STELLAR_HORIZON_URL ?? 'https://horizon-testnet.stellar.org',
  STELLAR_NETWORK_PASSPHRASE: process.env.STELLAR_NETWORK_PASSPHRASE ?? 'Test SDF Network ; September 2015',
  SAMBUNG_TREASURY_SECRET: process.env.SAMBUNG_TREASURY_SECRET ?? '',
  ANCHOR_IDRT_ISSUER: process.env.ANCHOR_IDRT_ISSUER ?? '',
  ANCHOR_IDRT_CODE: process.env.ANCHOR_IDRT_CODE ?? 'IDRT',
}

const USDC_ISSUER = config.STELLAR_NETWORK === 'mainnet'
  ? 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN'
  : 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'

const { Asset } = await import('@stellar/stellar-sdk')
export const USDC = new Asset('USDC', USDC_ISSUER)
export const IDRT = new Asset(config.ANCHOR_IDRT_CODE, config.ANCHOR_IDRT_ISSUER)
