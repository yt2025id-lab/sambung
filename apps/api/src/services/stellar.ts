import {
  Horizon, Keypair, TransactionBuilder,
  Operation, Asset, BASE_FEE,
} from '@stellar/stellar-sdk'
import { config } from '../config.js'

const server = new Horizon.Server(config.STELLAR_HORIZON_URL)

const USDC_ISSUER = config.STELLAR_NETWORK === 'mainnet'
  ? 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN'
  : 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'

export const USDC = new Asset('USDC', USDC_ISSUER)
export const IDRT = new Asset(config.ANCHOR_IDRT_CODE, config.ANCHOR_IDRT_ISSUER)
export const XLM = Asset.native()

export async function getLiveRate(): Promise<{ bid: number; ask: number }> {
  try {
    const orderbook = await server.orderbook(USDC, IDRT).call()

    const bestBid = orderbook.bids[0]?.price
    const bestAsk = orderbook.asks[0]?.price

    return {
      bid: bestBid ? parseFloat(bestBid) : 15350,
      ask: bestAsk ? parseFloat(bestAsk) : 15380,
    }
  } catch {
    return { bid: 15350, ask: 15380 }
  }
}

export async function submitPathPayment(params: {
  sourceSecret: string
  sendAsset: Asset
  sendAmount: string
  destAsset: Asset
  destAmount: string
  destMin: string
  destination: string
  path?: Asset[]
  paymentId: string
}): Promise<string> {
  const sourceKeypair = Keypair.fromSecret(params.sourceSecret)
  const account = await server.loadAccount(sourceKeypair.publicKey())

  const path = params.path ?? [params.sendAsset, XLM, params.destAsset]

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: config.STELLAR_NETWORK_PASSPHRASE,
  })
    .addOperation(Operation.pathPaymentStrictSend({
      sendAsset: params.sendAsset,
      sendAmount: params.sendAmount,
      destination: params.destination,
      destAsset: params.destAsset,
      destMin: params.destMin,
      path,
    }))
    .addOperation(Operation.setOptions({
      memoType: 'hash',
      memo: params.paymentId,
    }))
    .setTimeout(30)
    .build()

  tx.sign(sourceKeypair)
  const result = await server.submitTransaction(tx)
  return result.hash
}

export async function getAccountBalance(publicKey: string): Promise<{ assetCode: string; balance: string }[]> {
  const account = await server.loadAccount(publicKey)
  return account.balances.map(b => ({
    assetCode: 'asset_code' in b ? b.asset_code : 'XLM',
    balance: b.balance,
  }))
}
